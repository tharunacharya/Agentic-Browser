import { WebContents } from 'electron'
import { DOMObserver } from './DOMObserver'
import { ActionExecutor } from './ActionExecutor'
import { Planner } from './Planner'

export class AgentRuntime {
    private observer: DOMObserver
    private executor: ActionExecutor
    private planner: Planner
    private isRunning: boolean = false

    constructor() {
        this.observer = new DOMObserver()
        this.executor = new ActionExecutor()
        this.planner = new Planner()
    }

    async runGoal(goal: string, webContents: WebContents) {
        if (this.isRunning) {
            console.warn('Agent already running')
            return
        }

        this.isRunning = true
        console.log(`[Agent] Starting goal: ${goal}`)

        try {
            // Attach debugger if not attached
            if (!webContents.debugger.isAttached()) {
                try {
                    webContents.debugger.attach('1.3')
                    console.log('[Agent] Debugger attached to tab')
                } catch (err) {
                    console.error('[Agent] Failed to attach debugger:', err)
                    return
                }
            }

            // Initial Observation
            await this.observer.observe(webContents)

            // Planning Loop (Simplified for scaffolding)
            let completed = false
            while (!completed && this.isRunning) {
                console.log('[Agent] Planning next step...')
                const plan = await this.planner.getNextAction(goal, this.observer.lastState)

                if (plan.action === 'finish') {
                    console.log('[Agent] Goal completed!')
                    completed = true
                } else if (plan.action) {
                    console.log(`[Agent] Executing: ${plan.action}`)
                    await this.executor.execute(plan, webContents)

                    // Wait for effects
                    await new Promise(r => setTimeout(r, 2000))

                    // Re-observe
                    await this.observer.observe(webContents)
                } else {
                    console.warn('[Agent] No plan generated. Stopping.')
                    break
                }
            }

        } catch (error) {
            console.error('[Agent] Runtime error:', error)
        } finally {
            this.isRunning = false
            // Don't detach immediately in case user wants to inspect or continue
        }
    }

    stop() {
        this.isRunning = false
    }
}
