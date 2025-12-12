import { WebContents } from 'electron'

export class ActionExecutor {
    async execute(plan: any, webContents: WebContents) {
        const { action, params } = plan

        if (action === 'navigate') {
            await webContents.loadURL(params.url)
        } else if (action === 'click') {
            await webContents.executeJavaScript(`
            (async () => {
                const sleep = (ms) => new Promise(r => setTimeout(r, ms));
                const selector = '${params.selector}';
                let el = null;
                
                // Retry for 5 seconds
                for (let i = 0; i < 25; i++) {
                    el = document.querySelector(selector);
                    if (el && el.offsetParent !== null) break; // Check visibility
                    await sleep(200);
                }

                if (el) {
                    el.click();
                    // Also dispatch mouse events for React/Angular apps
                    const opts = { bubbles: true, cancelable: true, view: window };
                    el.dispatchEvent(new MouseEvent('mousedown', opts));
                    el.dispatchEvent(new MouseEvent('mouseup', opts));
                } else {
                    throw new Error('Element not found after retry: ' + selector);
                }
            })()
            `)
        } else if (action === 'type') {
            const selectors = params.selector.split(',').map((s: string) => s.trim())
            await webContents.executeJavaScript(`
            (async () => {
                const sleep = (ms) => new Promise(r => setTimeout(r, ms));
                const selectors = ${JSON.stringify(selectors)};
                let el = null;
                
                // Retry for 5 seconds
                for (let i = 0; i < 25; i++) {
                     for (const s of selectors) {
                        el = document.querySelector(s);
                        if (el && el.offsetParent !== null) break;
                    }
                    if (el) break;
                    await sleep(200);
                }
                
                if (el) {
                    el.focus();
                    el.value = '${params.text}';
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Delay before submit
                    await sleep(100);
                    
                    if (el.tagName === 'INPUT' && el.form) {
                        el.form.submit(); // Prefer form submit for search
                    } else {
                        // Press Enter
                        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13 }));
                        el.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13 }));
                        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13 }));
                    }
                } else {
                    throw new Error('Element not found after retry: ' + selectors.join(', '));
                }
            })()
        `)
        }
    }
}
