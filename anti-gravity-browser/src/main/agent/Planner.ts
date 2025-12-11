export class Planner {
    async getNextAction(goal: string, state: any): Promise<any> {
        // STUB: Real implementation would call LLM here
        // For now, prompt-like logs

        console.log('[Planner] Analyzing state against goal:', goal)

        // Fake simple logic for demo
        if (state?.url === 'about:blank') {
            return {
                action: 'navigate',
                params: { url: 'https://google.com' }
            }
        }

        if (goal.includes('search') && state?.url.includes('google')) {
            // Assume we need to type query
            return {
                action: 'type',
                params: { selector: 'input[name="q"]', text: 'Anti-Gravity Browser' }
            }
        }

        return { action: 'finish' }
    }
}
