import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface Props {
    goal: string
}

export function AgentStatus({ goal }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/60 backdrop-blur-md border border-glassBorder rounded-lg p-4 text-white shadow-xl pointer-events-auto"
        >
            <div className="flex items-center space-x-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm font-semibold text-purple-300">Agent Active</span>
            </div>
            <div className="text-xs text-gray-300 mb-2">
                Goal: "{goal}"
            </div>

            <div className="space-y-1">
                <div className="text-xs text-gray-400 font-mono">&gt; Observing DOM...</div>
                <div className="text-xs text-gray-400 font-mono">&gt; Checking MCP...</div>
            </div>
        </motion.div>
    )
}
