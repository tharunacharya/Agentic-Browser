import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

export class Planner {
    private model: any

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY
        console.log('[Planner] Initializing. API Key present?', !!apiKey, 'Length:', apiKey?.length || 0)

        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey)
            // Trying 1.5-pro
            this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
        } else {
            console.error('Gemini API Key missing!')
        }
    }

    async getNextAction(goal: string, state: any): Promise<any> {
        console.log('[Planner] Analyzing state against goal:', goal)

        if (!process.env.GEMINI_API_KEY) {
            return { action: 'error', message: 'API Key Missing' }
        }

        // Try models confirmed to exist for this key (Gemini 2.0/2.5 series)
        const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-pro-latest"]
        let lastError = null

        for (const modelName of modelsToTry) {
            try {
                console.log(`[Planner] Attempting with model: ${modelName}`)
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
                const model = genAI.getGenerativeModel({ model: modelName })

                const prompt = `
                You are an autonomous browser agent.
                GOAL: "${goal}"
                CURRENT STATE:
                - URL: ${state?.url}
                - Title: ${state?.title}
                
                AVAILABLE ACTIONS:
                - navigate(url): Go to a URL.
                - click(selector): Click an element.
                - type(selector, text): Type text into an input.
                - finish(): Goal is achieved.

                RULES:
                1. If expecting a search results page but on a landing page, search/type.
                2. If result found, click it.
                3. If need to filter (e.g. price < 200), look for filter buttons or inspect prices.
                4. Be concise. Return ONLY valid JSON.
                
                COMPLEX GOAL HANDLING:
                - If goal has location (e.g. "nagavara"), check if current location matches or search for location first.
                - If goal has price limit, try to find sort/filter options.

                Example JSON:
                { "action": "type", "params": { "selector": "input[name='q']", "text": "Hello" } }
                `

                const result = await model.generateContent(prompt)
                const response = result.response
                const text = response.text()

                // Cleanup markdown code blocks if present
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
                console.log('[Planner] LLM Response:', cleanText)

                return JSON.parse(cleanText)

            } catch (error: any) {
                console.warn(`[Planner] Failed with ${modelName}:`, error.message)
                lastError = error
                // Continue to next model
            }
        }

        console.error('[Planner] All models failed.')
        return { action: 'error', message: `All models failed. Last error: ${lastError?.message}` }
    }
}
