import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('api', {
    sendGoal: (goal: string) => ipcRenderer.invoke('agent:run-goal', goal),
    newTab: (url?: string) => ipcRenderer.invoke('browser:new-tab', url),
    switchTab: (id: string) => ipcRenderer.invoke('browser:switch-tab', id),
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
        const subscription = (_event: any, ...args: any[]) => listener(_event, ...args)
        ipcRenderer.on(channel, subscription)
        return () => ipcRenderer.removeListener(channel, subscription)
    },
    off: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener)
    },
    goBack: () => ipcRenderer.invoke('browser:back'),
    goForward: () => ipcRenderer.invoke('browser:forward'),
    reload: () => ipcRenderer.invoke('browser:reload')
})
