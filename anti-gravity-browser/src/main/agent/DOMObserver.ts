import { WebContents } from 'electron'

export class DOMObserver {
    public lastState: any = null

    async observe(webContents: WebContents) {
        // We use the Chrome DevTools Protocol to get the DOM tree
        // Specifically, accessibility tree is better for agents than raw DOM
        try {
            const { root } = await webContents.debugger.sendCommand('Accessibility.getFullAXTree')

            // Also get URL and title
            const title = webContents.getTitle()
            const url = webContents.getURL()

            this.lastState = {
                title,
                url,
                axTree: root
                // We could also take a screenshot here using Page.captureScreenshot
            }

            console.log(`[Observer] Observed page: ${title}`)
            return this.lastState
        } catch (error) {
            console.error('[Observer] Failed to observe:', error)
            return null
        }
    }
}
