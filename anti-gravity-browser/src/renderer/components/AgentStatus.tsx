import React from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
    goal: string
    status: string
    log: string
}

export function AgentStatus({ goal, status, log }: Props) {
    return (
        <div
            className="bg-black/60 backdrop-blur-md border border-glassBorder rounded-lg p-4 text-white shadow-xl pointer-events-auto transition-all animate-in slide-in-from-right duration-300"
        >
            <div className="flex items-center space-x-2 mb-2">
                <Loader2 className={`h-4 w-4 text-purple-500 ${status === 'idle' ? '' : 'animate-spin'}`} />
                <span className="text-sm font-semibold text-purple-300">
                    {status === 'idle' ? 'Agent Finished' : 'Agent Active'}
                </span>
            </div>
            <div className="text-xs text-gray-300 mb-2 truncate max-w-[250px]">
                Goal: "{goal}"
            </div>

            <div className="space-y-1">
                <div className="text-xs text-gray-400 font-mono">&gt; {log}</div>
            </div>
        </div>
    )
}
