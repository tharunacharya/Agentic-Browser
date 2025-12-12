import { app, BrowserWindow, ipcMain, BrowserView } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
import { WindowManager } from './browser/WindowManager'
import { AgentRuntime } from './agent/AgentRuntime'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = join(fileURLToPath(import.meta.url), '..')

// The built directory structure
//
// ├─┬─ dist
// │ ├── main
// │ └── renderer
//
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let windowManager: WindowManager | null = null

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

async function createWindow() {
    windowManager = new WindowManager()
    await windowManager.createMainWindow()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        windowManager = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// --- AUTO-TEST: Trigger Zomato Goal automatically ---
setTimeout(() => {
    console.log('[Auto-Test] Triggering Zomato Goal...')
    const view = windowManager?.getActiveView()
    if (view) {
        agent.runGoal('open zomato and add briyani to the cart', view.webContents, (data) => {
            console.log('[Auto-Test Agent Status]', data)
        })
    }
}, 5000)
// --------------------------------------------------

// IPC handlers for UI interactions
ipcMain.handle('browser:new-tab', (event, url) => {
    windowManager?.createTab(url)
})

ipcMain.handle('browser:switch-tab', (event, id) => {
    windowManager?.switchTab(id)
})

ipcMain.handle('browser:back', () => {
    windowManager?.goBack()
})

ipcMain.handle('browser:forward', () => {
    windowManager?.goForward()
})

ipcMain.handle('browser:reload', () => {
    windowManager?.reload()
})

const agent = new AgentRuntime()

ipcMain.handle('agent:run-goal', async (event, goal) => {
    console.log('Received agent goal:', goal)
    let view = windowManager?.getActiveView()

    // If no tab exists (first run), create one
    if (!view) {
        console.log('[Main] No active view, creating new tab for goal...')
        windowManager?.createTab('about:blank')
        view = windowManager?.getActiveView()
    }

    if (view) {
        // Run in background without awaiting to return 'started' status to UI
        agent.runGoal(goal, view.webContents, (data) => {
            // Forward agent status to the UI (Renderer) which sent the request
            event.sender.send('agent:status', data)
        })
        return { status: 'started', goal }
    } else {
        return { status: 'error', message: 'Failed to create tab' }
    }
})
