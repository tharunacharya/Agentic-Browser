import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WindowManager } from './browser/WindowManager'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

// IPC handlers for UI interactions
ipcMain.handle('browser:new-tab', (event, url) => {
    windowManager?.createTab(url)
})

ipcMain.handle('browser:switch-tab', (event, id) => {
    windowManager?.switchTab(id)
})

import { AgentRuntime } from './agent/AgentRuntime'
const agent = new AgentRuntime()

ipcMain.handle('agent:run-goal', async (event, goal) => {
    console.log('Received agent goal:', goal)
    const view = windowManager?.getActiveView()
    if (view) {
        // Run in background without awaiting to return 'started' status to UI
        agent.runGoal(goal, view.webContents)
        return { status: 'started', goal }
    } else {
        return { status: 'error', message: 'No active tab' }
    }
})
