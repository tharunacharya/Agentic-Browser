import { WebContents } from 'electron'
import { MCPDiscovery } from './Discovery'
import { MCPClient } from './Client'

export class MCPService {
    private discovery: MCPDiscovery
    private activeClients: Map<string, MCPClient[]> = new Map() // TabID -> Clients

    constructor() {
        this.discovery = new MCPDiscovery()
    }

    async onDidFinishLoad(webContents: WebContents, tabId: string) {
        const url = webContents.getURL()
        if (!url.startsWith('http')) return

        const config = await this.discovery.checkUrl(url)
        if (config && config.servers) {
            const clients: MCPClient[] = []
            for (const server of config.servers) {
                if (server.type === 'sse' && server.url) {
                    const client = new MCPClient(server.url)
                    await client.connect()
                    clients.push(client)
                }
            }
            this.activeClients.set(tabId, clients)
            console.log(`[MCP] Activated ${clients.length} clients for tab ${tabId}`)
        }
    }

    getToolsForTab(tabId: string) {
        // Aggregate tools from all clients
        const clients = this.activeClients.get(tabId) || []
        // Return promise of list
        return Promise.all(clients.map(c => c.listTools())).then(lists => lists.flat())
    }
}
