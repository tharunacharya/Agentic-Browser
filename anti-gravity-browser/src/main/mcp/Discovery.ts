import { net } from 'electron'

export interface MCPMetadata {
    mcp_version: string
    servers: Array<{
        name: string
        type: 'fcp' | 'stdio' | 'sse' // Function Calling Protocol / stdio / server-sent-events
        url?: string
        command?: string
    }>
}

export class MCPDiscovery {
    async checkUrl(urlStr: string): Promise<MCPMetadata | null> {
        try {
            const url = new URL(urlStr)
            const wellKnownUrl = `${url.protocol}//${url.host}/.well-known/mcp.json`

            console.log(`[MCP] Checking ${wellKnownUrl}`)

            const response = await net.fetch(wellKnownUrl)
            if (response.ok) {
                const data = await response.json() as MCPMetadata
                console.log(`[MCP] Found configuration at ${wellKnownUrl}`, data)
                return data
            }
        } catch (e) {
            // Ignore errors, most sites won't have it
        }
        return null
    }
}
