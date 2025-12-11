export interface Tab {
    id: string
    url: string
    title: string
    isLoading: boolean
}

export interface AgentState {
    status: 'idle' | 'observing' | 'planning' | 'acting' | 'reflecting'
    currentGoal?: string
    thoughtProcess: string[]
    logs: string[]
}
