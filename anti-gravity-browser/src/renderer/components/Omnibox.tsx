import React, { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'

interface Props {
    onSubmit: (text: string) => void
}

export function Omnibox({ onSubmit }: Props) {
    const [input, setInput] = useState('')

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            console.log('Omnibox submit:', input)
            onSubmit(input)
        }
    }

    return (
        <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {input.startsWith('/') ? <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" /> : <Search className="h-4 w-4 text-gray-400" />}
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-glassBorder rounded-xl leading-5 bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all shadow-lg backdrop-blur-md"
                placeholder="Search or type a command..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}
