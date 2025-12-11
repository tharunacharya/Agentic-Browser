import { WebContents } from 'electron'

export class ActionExecutor {
    async execute(plan: any, webContents: WebContents) {
        const { action, params } = plan

        try {
            if (action === 'navigate') {
                await webContents.loadURL(params.url)
            } else if (action === 'click') {
                // Complex: transform selector to node coordinates via DOM.getDocument/resolveNode
                // For MVP, we can inject JS, though CDP Input.dispatchMouseEvent is robust.
                await webContents.executeJavaScript(`document.querySelector('${params.selector}').click()`)
            } else if (action === 'type') {
                await webContents.executeJavaScript(`
                const el = document.querySelector('${params.selector}');
                el.value = '${params.text}';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.form?.submit(); // Auto submit for demo
           `)
            }
        } catch (error) {
            console.error(`[Executor] Failed to execute ${action}:`, error)
        }
    }
}
