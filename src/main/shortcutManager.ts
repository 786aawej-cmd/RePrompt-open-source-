import { globalShortcut, Notification } from 'electron';
import { StorageManager } from './storageManager';
import { ClipboardManager } from './clipboardManager';
import { KeyboardSimulator } from './keyboardSimulator';
import { GroqClient } from './groqClient';
import { AgentManager, Agent } from './agentManager';

export class ShortcutManager {
    private storageManager: StorageManager;
    private clipboardManager: ClipboardManager;
    private keyboardSimulator: KeyboardSimulator;
    private groqClient: GroqClient;
    private agentManager: AgentManager;
    private enabled: boolean = true;
    private isProcessing: boolean = false;
    private registeredShortcuts: Set<string> = new Set();

    constructor(storageManager: StorageManager) {
        this.storageManager = storageManager;
        this.clipboardManager = new ClipboardManager();
        this.keyboardSimulator = new KeyboardSimulator();
        this.groqClient = new GroqClient(storageManager);
        this.agentManager = new AgentManager();
        this.enabled = storageManager.isShortcutEnabled();

        // Load saved agent states
        const savedAgents = storageManager.getAgents();
        if (savedAgents.length > 0) {
            this.agentManager.loadAgents(savedAgents);
        }

        if (this.enabled) {
            this.registerAllAgents();
        }
    }

    /**
     * Register shortcuts for all enabled agents
     */
    private registerAllAgents(): void {
        // Unregister all existing shortcuts first
        this.unregisterAll();

        const enabledAgents = this.agentManager.getEnabledAgents();

        enabledAgents.forEach(agent => {
            this.registerAgent(agent);
        });

        console.log(`Registered ${enabledAgents.length} agent shortcuts`);
    }

    /**
     * Register a single agent's shortcut
     */
    private registerAgent(agent: Agent): void {
        try {
            const shortcut = agent.shortcut;

            // Convert shortcut format: "Ctrl+Shift+C" -> "CommandOrControl+Shift+C"
            const electronShortcut = shortcut.replace('Ctrl', 'CommandOrControl');

            const success = globalShortcut.register(electronShortcut, () => {
                this.handleShortcut(agent);
            });

            if (success) {
                this.registeredShortcuts.add(electronShortcut);
                console.log(`Registered shortcut for ${agent.name}: ${shortcut}`);
            } else {
                console.error(`Failed to register shortcut for ${agent.name}: ${shortcut}`);
            }
        } catch (error) {
            console.error(`Error registering shortcut for ${agent.name}:`, error);
        }
    }

    /**
     * Handle shortcut trigger for a specific agent
     */
    private async handleShortcut(agent: Agent): Promise<void> {
        // Prevent concurrent processing
        if (this.isProcessing) {
            return;
        }

        // Check for API key
        if (!this.storageManager.hasApiKey()) {
            this.showNotification('API Key Required', 'Please set your Groq API key in settings');
            return;
        }

        this.isProcessing = true;

        try {
            // Step 1: Select all text (Ctrl+A)
            await this.keyboardSimulator.selectAll();
            await this.delay(100);

            // Step 2: Copy selected text (Ctrl+C)
            await this.keyboardSimulator.copy();
            await this.delay(200);

            // Step 3: Read clipboard
            const originalText = this.clipboardManager.read();

            if (!originalText || originalText.trim().length === 0) {
                this.showNotification('No Text', 'No text was captured');
                this.isProcessing = false;
                return;
            }

            // Step 4: Send to Groq API with agent-specific prompt
            const optimizedText = await this.groqClient.optimizeText(originalText, agent.systemPrompt);

            if (!optimizedText) {
                this.showNotification('Optimization Failed', 'Failed to optimize text');
                this.isProcessing = false;
                return;
            }

            // Step 5: Write optimized text to clipboard
            this.clipboardManager.write(optimizedText);
            await this.delay(100);

            // Step 6: Paste optimized text (Ctrl+V)
            await this.keyboardSimulator.paste();

            this.showNotification(`${agent.icon} ${agent.name}`, 'Text optimized successfully!');
        } catch (error) {
            console.error('Error in optimization workflow:', error);
            this.showNotification('Error', 'An error occurred during optimization');
        } finally {
            this.isProcessing = false;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private showNotification(title: string, body: string): void {
        new Notification({ title, body }).show();
    }

    /**
     * Toggle all shortcuts on/off
     */
    public toggle(): boolean {
        this.enabled = !this.enabled;
        this.storageManager.setShortcutEnabled(this.enabled);

        if (this.enabled) {
            this.registerAllAgents();
        } else {
            this.unregisterAll();
        }

        return this.enabled;
    }

    /**
     * Toggle a specific agent
     */
    public toggleAgent(agentId: string): boolean {
        const newState = this.agentManager.toggleAgent(agentId);
        this.saveAgents();
        this.registerAllAgents(); // Re-register all shortcuts
        return newState;
    }

    /**
     * Set agent enabled state
     */
    public setAgentEnabled(agentId: string, enabled: boolean): void {
        this.agentManager.setAgentEnabled(agentId, enabled);
        this.saveAgents();
        this.registerAllAgents();
    }

    /**
     * Get all agents
     */
    public getAllAgents(): Agent[] {
        return this.agentManager.getAllAgents();
    }

    /**
     * Get enabled agents
     */
    public getEnabledAgents(): Agent[] {
        return this.agentManager.getEnabledAgents();
    }

    /**
     * Add custom agent
     */
    public addAgent(agentData: Omit<Agent, 'id' | 'isBuiltIn'>): Agent {
        const agent = this.agentManager.addCustomAgent(agentData);
        this.saveAgents();
        if (agent.enabled && this.enabled) {
            this.registerAgent(agent);
        }
        return agent;
    }

    /**
     * Update an existing agent
     */
    public updateAgent(id: string, updates: Partial<Agent>): boolean {
        const result = this.agentManager.updateAgent(id, updates);
        if (result) {
            this.saveAgents();
            this.registerAllAgents();
        }
        return result;
    }

    /**
     * Delete a custom agent
     */
    public deleteAgent(id: string): boolean {
        const result = this.agentManager.deleteAgent(id);
        if (result) {
            this.saveAgents();
            this.registerAllAgents();
        }
        return result;
    }

    /**
     * Check if shortcut is available
     */
    public isShortcutAvailable(key: string, excludeAgentId?: string): boolean {
        return this.agentManager.isShortcutAvailable(key, excludeAgentId);
    }

    /**
     * Save agents to storage
     */
    private saveAgents(): void {
        this.storageManager.saveAgents(this.agentManager.exportAgents());
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public unregisterAll(): void {
        this.registeredShortcuts.forEach(shortcut => {
            try {
                globalShortcut.unregister(shortcut);
            } catch (error) {
                console.error(`Failed to unregister ${shortcut}:`, error);
            }
        });
        this.registeredShortcuts.clear();
    }
}
