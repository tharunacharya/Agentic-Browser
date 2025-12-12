import React, { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'

interface Props {
    onSubmit: (text: string) => void
    variant?: 'center' | 'topbar'
}

export function Omnibox({ onSubmit, variant = 'topbar' }: Props) {
    const [input, setInput] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        console.log('Omnibox submit:', input)
        onSubmit(input)
    }

    const containerClasses = variant === 'center'
        ? "w-full max-w-2xl transform transition-all duration-500 scale-100"
        : "w-full transform transition-all duration-500 scale-100"

    const inputClasses = variant === 'center'
        ? "block w-full pl-6 pr-6 py-4 border-2 border-purple-500/50 rounded-2xl text-xl bg-slate-800/90 text-white placeholder-gray-400 focus:outline-none focus:bg-slate-800 focus:ring-4 focus:ring-purple-500/30 shadow-2xl backdrop-blur-xl"
        : "block w-full pl-10 pr-3 py-2 border border-purple-500/50 rounded-xl leading-5 bg-slate-800 text-white placeholder-gray-300 focus:outline-none focus:bg-slate-700 focus:ring-2 focus:ring-purple-500 sm:text-sm transition-all shadow-lg"

    return (
        <form onSubmit={handleSubmit} className={`relative group ${containerClasses}`}>
            {variant === 'topbar' && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {input.startsWith('/') ? <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" /> : <Search className="h-4 w-4 text-gray-400" />}
                </div>
            )}
            <input
                type="text"
                className={inputClasses}
                placeholder={variant === 'center' ? "What is your command? (e.g. 'Open zomato...')" : "TYPE COMMAND HERE"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus={variant === 'center'}
            />
        </form>
    )
}
