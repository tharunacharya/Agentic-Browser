import React, { useState } from 'react'
import { Omnibox } from './components/Omnibox'
import { AgentStatus } from './components/AgentStatus'

function App() {
    const [currentGoal, setCurrentGoal] = useState('')

    const handleGoalSubmit = (goal: string) => {
        console.log('App: submitting goal', goal)
        setCurrentGoal(goal)
        window.api.sendGoal(goal).then((res) => {
            console.log('App: agent response', res)
        }).catch((err) => {
            console.error('App: agent communication error', err)
        })
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-background/80 backdrop-blur-xl text-foreground overflow-hidden">
            {/* Top Bar / Navigation */}
            <div className="h-[80px] w-full border-b border-glassBorder flex items-center px-4 space-x-4 draggable-area">
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Anti-Gravity
                </div>

                <div className="flex-1 max-w-3xl no-drag">
                    <Omnibox onSubmit={handleGoalSubmit} />
                </div>

                <div className="flex space-x-2 no-drag">
                    <button onClick={() => window.api.newTab('https://google.com')} className="p-2 hover:bg-glass rounded-full transition-colors">
                        +
                    </button>
                </div>
            </div>

            {/* Main Content Area - Transparent to let BrowserView show through */}
            <div className="flex-1 w-full relative">
                {/* Agent Overlay / Status */}
                {currentGoal && (
                    <div className="absolute top-4 right-4 w-80 pointer-events-none">
                        <AgentStatus goal={currentGoal} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
