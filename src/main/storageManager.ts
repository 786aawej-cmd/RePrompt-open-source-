import Store from 'electron-store';
import { Agent } from './agentManager';

interface StoreSchema {
    apiKey: string;
    shortcut: string;
    shortcutEnabled: boolean;
    agents: Agent[];
}

export class StorageManager {
    private store: Store<StoreSchema>;

    constructor() {
        this.store = new Store<StoreSchema>({
            name: 'reprompt-config',
            encryptionKey: 'reprompt-secure-key-v1',
            defaults: {
                apiKey: '',
                shortcut: 'Ctrl+Shift+O',
                shortcutEnabled: true,
                agents: [],
            },
        });
    }

    // API Key Management
    getApiKey(): string {
        return this.store.get('apiKey', '');
    }

    setApiKey(apiKey: string): boolean {
        try {
            // Basic validation - Groq API keys start with 'gsk_'
            if (apiKey && !apiKey.startsWith('gsk_')) {
                return false;
            }
            this.store.set('apiKey', apiKey);
            return true;
        } catch (error) {
            console.error('Failed to save API key:', error);
            return false;
        }
    }

    deleteApiKey(): boolean {
        try {
            this.store.delete('apiKey');
            return true;
        } catch (error) {
            console.error('Failed to delete API key:', error);
            return false;
        }
    }

    hasApiKey(): boolean {
        const apiKey = this.getApiKey();
        return apiKey.length > 0 && apiKey.startsWith('gsk_');
    }

    // Shortcut Management
    getShortcut(): string {
        return this.store.get('shortcut', 'Ctrl+Shift+O');
    }

    setShortcut(shortcut: string): boolean {
        try {
            this.store.set('shortcut', shortcut);
            return true;
        } catch (error) {
            console.error('Failed to save shortcut:', error);
            return false;
        }
    }

    isShortcutEnabled(): boolean {
        return this.store.get('shortcutEnabled', true);
    }

    setShortcutEnabled(enabled: boolean): void {
        this.store.set('shortcutEnabled', enabled);
    }

    // Agent Management
    getAgents(): Agent[] {
        return this.store.get('agents', []);
    }

    saveAgents(agents: Agent[]): boolean {
        try {
            this.store.set('agents', agents);
            return true;
        } catch (error) {
            console.error('Failed to save agents:', error);
            return false;
        }
    }
}
