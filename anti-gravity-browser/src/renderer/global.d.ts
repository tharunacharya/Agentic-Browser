export { };

declare global {
    interface Window {
        api: {
            sendGoal: (goal: string) => Promise<any>;
            newTab: (url?: string) => Promise<any>;
            switchTab: (id: string) => Promise<any>;
            on: (channel: string, listener: (event: any, ...args: any[]) => void) => () => void;
            off: (channel: string, listener: (...args: any[]) => void) => void;
        };
    }
}
