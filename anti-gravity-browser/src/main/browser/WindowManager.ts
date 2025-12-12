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
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
            },
        })

        if (process.env.VITE_DEV_SERVER_URL) {
            console.log('[WindowManager] Loading URL:', process.env.VITE_DEV_SERVER_URL)
            await this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
        } else {
            console.log('[WindowManager] Loading File')
            await this.mainWindow.loadFile(path.join(process.env.DIST!, '../renderer/index.html'))
        }

        // Default tab - DISABLED to show UI first
        // this.createTab('https://www.google.com')

        this.mainWindow.on('resize', () => {
            // Debounce slightly
            setTimeout(() => this.updateActiveViewBounds(), 10)
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

        // Force update bounds shortly after creation
        setTimeout(() => this.updateActiveViewBounds(), 100)

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

        const [width, height] = this.mainWindow.getContentSize()
        console.log(`[WindowManager] Updating bounds: w=${width}, h=${height}`)

        // Reserve top 80px for UI (Address Bar etc)
        const topBarHeight = 80
        // Reserve right side for Agent Sidebar (optional)
        const sidebarWidth = 0

        const bounds = {
            x: 0,
            y: topBarHeight,
            width: width - sidebarWidth,
            height: height - topBarHeight
        }

        console.log('[WindowManager] Setting view bounds:', bounds)
        view.setBounds(bounds)
        view.setBackgroundColor('#ffffff') // Force white background

        // Ensure it's on top again just in case
        this.mainWindow.setTopBrowserView(view)
    }

    getActiveView() {
        if (!this.activeViewId) return null
        return this.views.get(this.activeViewId)
    }

    goBack() {
        console.log(`[WindowManager] goBack called. ActiveID: ${this.activeViewId}, Total Views: ${this.views.size}`)
        const view = this.getActiveView()
        if (view) {
            console.log('[WindowManager] Active View found, canGoBack:', view.webContents.canGoBack())
            if (view.webContents.canGoBack()) {
                view.webContents.goBack()
            }
        } else {
            console.error('[WindowManager] ERROR: No Active View found for goBack!')
        }
    }

    goForward() {
        console.log(`[WindowManager] goForward called. ActiveID: ${this.activeViewId}`)
        const view = this.getActiveView()
        if (view && view.webContents.canGoForward()) {
            view.webContents.goForward()
        }
    }

    reload() {
        console.log(`[WindowManager] reload called. ActiveID: ${this.activeViewId}`)
        const view = this.getActiveView()
        if (view) {
            view.webContents.reload()
        } else {
            console.error('[WindowManager] ERROR: No Active View found for reload!')
        }
    }
}
