import { contextBridge, ipcRenderer } from 'electron';

// Agent interface for type safety
interface Agent {
    id: string;
    name: string;
    shortcut: string;
    shortcutKey: string;
    systemPrompt: string;
    isBuiltIn: boolean;
    enabled: boolean;
    icon?: string;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // API Key management
    getApiKey: (): Promise<string> => ipcRenderer.invoke('get-api-key'),
    setApiKey: (apiKey: string): Promise<boolean> => ipcRenderer.invoke('set-api-key', apiKey),
    deleteApiKey: (): Promise<boolean> => ipcRenderer.invoke('delete-api-key'),
    hasApiKey: (): Promise<boolean> => ipcRenderer.invoke('has-api-key'),

    // Shortcut management
    getShortcutEnabled: (): Promise<boolean> => ipcRenderer.invoke('get-shortcut-enabled'),
    toggleShortcut: (): Promise<boolean> => ipcRenderer.invoke('toggle-shortcut'),

    // Agent management
    getAgents: (): Promise<Agent[]> => ipcRenderer.invoke('get-agents'),
    toggleAgent: (agentId: string): Promise<boolean> => ipcRenderer.invoke('toggle-agent', agentId),
    setAgentEnabled: (agentId: string, enabled: boolean): Promise<boolean> =>
        ipcRenderer.invoke('set-agent-enabled', agentId, enabled),
    addAgent: (agentData: Omit<Agent, 'id' | 'isBuiltIn'>): Promise<Agent> =>
        ipcRenderer.invoke('add-agent', agentData),
    updateAgent: (agentId: string, updates: Partial<Agent>): Promise<boolean> =>
        ipcRenderer.invoke('update-agent', agentId, updates),
    deleteAgent: (agentId: string): Promise<boolean> =>
        ipcRenderer.invoke('delete-agent', agentId),
    isShortcutAvailable: (key: string, excludeAgentId?: string): Promise<boolean> =>
        ipcRenderer.invoke('is-shortcut-available', key, excludeAgentId),

    // Window controls
    closeWindow: (): void => ipcRenderer.send('close-window'),
    minimizeWindow: (): void => ipcRenderer.send('minimize-window'),
    maximizeWindow: (): void => ipcRenderer.send('maximize-window'),
});

// Type definitions for the exposed API
declare global {
    interface Window {
        electronAPI: {
            getApiKey: () => Promise<string>;
            setApiKey: (apiKey: string) => Promise<boolean>;
            deleteApiKey: () => Promise<boolean>;
            hasApiKey: () => Promise<boolean>;
            getShortcutEnabled: () => Promise<boolean>;
            toggleShortcut: () => Promise<boolean>;
            getAgents: () => Promise<Agent[]>;
            toggleAgent: (agentId: string) => Promise<boolean>;
            setAgentEnabled: (agentId: string, enabled: boolean) => Promise<boolean>;
            addAgent: (agentData: Omit<Agent, 'id' | 'isBuiltIn'>) => Promise<Agent>;
            updateAgent: (agentId: string, updates: Partial<Agent>) => Promise<boolean>;
            deleteAgent: (agentId: string) => Promise<boolean>;
            isShortcutAvailable: (key: string, excludeAgentId?: string) => Promise<boolean>;
            closeWindow: () => void;
            minimizeWindow: () => void;
            maximizeWindow: () => void;
        };
    }
}
