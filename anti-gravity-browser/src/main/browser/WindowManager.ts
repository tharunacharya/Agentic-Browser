import { BrowserWindow, BrowserView, app, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

import { MCPService } from '../mcp/MCPService'

export class WindowManager {
    private mainWindow: BrowserWindow | null = null
    private views: Map<string, BrowserView> = new Map()
    private activeViewId: string | null = null
    private mcpService: MCPService

    constructor() {
        this.mcpService = new MCPService()
    }

    async createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            titleBarStyle: 'hiddenInset', // Mac-style seamless titlebar
            trafficLightPosition: { x: 12, y: 12 },
            vibrancy: 'fullscreen-ui', // Glass effect
            backgroundMaterial: 'acrylic',
            webPreferences: {
                preload: path.join(__dirname, '../preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
            },
        })

        if (process.env.VITE_DEV_SERVER_URL) {
            await this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
        } else {
            await this.mainWindow.loadFile(path.join(process.env.DIST!, '../renderer/index.html'))
        }

        // Default tab
        this.createTab('https://www.google.com')

        this.mainWindow.on('resize', () => {
            this.updateActiveViewBounds()
        })
    }

    createTab(url: string = 'about:blank') {
        if (!this.mainWindow) return

        const view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                // sandbox: true // Enable for security
            }
        })

        this.mainWindow.addBrowserView(view)
        view.webContents.loadURL(url)

        // Generate a random ID (simple implementation)
        const id = Math.random().toString(36).substring(7)
        this.views.set(id, view)

        view.webContents.on('did-finish-load', () => {
            this.mcpService.onDidFinishLoad(view.webContents, id)
        })

        this.switchTab(id)
        return id
    }

    switchTab(id: string) {
        if (!this.mainWindow || !this.views.has(id)) return

        // Hide current view if any (effectively by removing it or resizing it to 0)
        // Actually, setBrowserView(null) is cleaner but we want to keep state.
        // We will just manage the 'active' one by bringing it to top/setting bounds.

        // Ideally we remove others from the window to save resources or just hide them.
        // For simplicity, let's just set the TOP view.
        const view = this.views.get(id)!
        this.mainWindow.setTopBrowserView(view)
        this.activeViewId = id

        this.updateActiveViewBounds()
    }

    updateActiveViewBounds() {
        if (!this.mainWindow || !this.activeViewId) return
        const view = this.views.get(this.activeViewId)
        if (!view) return

        const bounds = this.mainWindow.getBounds()

        // Reserve top 80px for UI (Address Bar etc)
        const topBarHeight = 80
        // Reserve right side for Agent Sidebar (optional)
        const sidebarWidth = 0

        view.setBounds({
            x: 0,
            y: topBarHeight,
            width: bounds.width - sidebarWidth,
            height: bounds.height - topBarHeight
        })
    }

    getActiveView() {
        if (!this.activeViewId) return null
        return this.views.get(this.activeViewId)
    }
}
