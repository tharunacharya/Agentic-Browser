import React, { useState, useEffect } from 'react'
import { Omnibox } from './components/Omnibox'
import { AgentStatus } from './components/AgentStatus'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props)
        this.state = { hasError: false, error: null }
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-500 bg-black h-screen z-[9999] relative">
                    <h1>Something went wrong.</h1>
                    <pre className="mt-4 break-words whitespace-pre-wrap">{this.state.error?.toString()}</pre>
                </div>
            )
        }
        return this.props.children
    }
}

function App() {
    const [hasStarted, setHasStarted] = useState(false)
    const [currentGoal, setCurrentGoal] = useState('')
    const [agentState, setAgentState] = useState({ status: 'idle', log: 'Ready' })

    useEffect(() => {
        // Safety check for API availability
        if (!window.api) {
            console.error('Window API not found!')
            return
        }

        const cleanup = window.api.on('agent:status', (event, data) => {
            console.log('Agent Update:', data)
            setAgentState(data)
        })
        return cleanup
    }, [])

    const handleGoalSubmit = (goal: string) => {
        if (!window.api) return
        console.log('App: submitting goal', goal)
        setCurrentGoal(goal)
        setHasStarted(true)
        setAgentState({ status: 'starting', log: 'Initializing...' })
        // Delay api call slightly to allow UI transition
        setTimeout(() => {
            window.api.sendGoal(goal)
        }, 500)
    }

    if (!hasStarted) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-foreground overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/10 pointer-events-none" />

                <div className="z-10 flex flex-col items-center space-y-8 max-w-2xl w-full px-4">
                    <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-2xl">
                        Anti-Gravity
                    </div>
                    <p className="text-gray-400 text-lg">Where is your intention taking us today?</p>

                    {/* Uncommented components */}
                    {/* <div className="text-white border p-4">OMNIBOX PLACEHOLDER</div> */}
                    <Omnibox onSubmit={handleGoalSubmit} variant="center" />
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-slate-900 text-foreground overflow-hidden">
            {/* Top Bar / Navigation */}
            <div className="h-[80px] w-full bg-slate-950 border-b border-purple-500/30 flex items-center px-4 space-x-4 draggable-area shadow-2xl z-50 animate-in slide-in-from-top duration-500">
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Anti-Gravity
                </div>

                <div className="flex-1 max-w-3xl no-drag relative flex items-center space-x-2">
                    <div className="flex space-x-1 mr-2 bg-slate-800 rounded-lg p-1 border border-white/10 z-[100]">
                        <button onClick={() => { console.log('Back Clicked'); window.api.goBack() }} className="p-2 hover:bg-white/20 rounded text-white transition-colors cursor-pointer" title="Back">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button onClick={() => { console.log('Forward Clicked'); window.api.goForward() }} className="p-2 hover:bg-white/20 rounded text-white transition-colors cursor-pointer" title="Forward">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                        <button onClick={() => { console.log('Reload Clicked'); window.api.reload() }} className="p-2 hover:bg-white/20 rounded text-white transition-colors cursor-pointer" title="Refresh">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                        </button>
                    </div>
                    <Omnibox onSubmit={handleGoalSubmit} variant="topbar" />

                    {/* Agent Status integrated into Top Bar */}
                    {(currentGoal && agentState.status !== 'idle') && (
                        <div className="absolute top-full right-0 mt-2 z-50 w-80">
                            {/* We need to ensure this popup stays ON TOP of the BrowserView.
                                 Electron limitation: React overlays cannot easily cover BrowserView.
                                 Workaround: We will render it INSIDE the topbar (height constrained) 
                                 OR rely on the fact that sometimes drop-downs work? 
                                 Actually, standard practice is to squeeze BrowserView or use a separate window.
                                 
                                 BETTER: Put it INLINE in the toolbar for now.
                             */}
                        </div>
                    )}
                </div>

                {/* Inline Agent Status to be safe */}
                {(currentGoal && agentState.status !== 'idle') && (
                    <div className="mr-4 no-drag text-white text-xs bg-slate-800 p-2 rounded border border-purple-500/50 flex flex-col w-48">
                        <div className="font-bold text-purple-400 capitalize">{agentState.status}</div>
                        <div className="truncate text-gray-400">{agentState.log}</div>
                    </div>
                )}

                <div className="flex space-x-2 no-drag">
                    <button onClick={() => window.api?.newTab('https://google.com')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        +
                    </button>
                    <button onClick={() => setHasStarted(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 text-xs">
                        RESET
                    </button>
                </div>
            </div>

            {/* Main Content Area - Transparent to let BrowserView show through */}
            <div className="flex-1 w-full relative">
                {/* BrowserView takes up this space natively */}
            </div>
        </div>
    )
}

function ErrorBoundaryApp() {
    return (
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    )
}

export default ErrorBoundaryApp
