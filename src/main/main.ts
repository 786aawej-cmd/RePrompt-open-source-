import { app, BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import * as path from 'path';
import { TrayManager } from './trayManager';
import { ShortcutManager } from './shortcutManager';
import { StorageManager } from './storageManager';

class RePromptApp {
    private mainWindow: BrowserWindow | null = null;
    private trayManager: TrayManager | null = null;
    private shortcutManager: ShortcutManager | null = null;
    private storageManager: StorageManager;

    constructor() {
        this.storageManager = new StorageManager();
        this.setupApp();
        this.setupIPC();
    }

    private setupApp(): void {
        // Prevent multiple instances
        const gotTheLock = app.requestSingleInstanceLock();
        if (!gotTheLock) {
            app.quit();
            return;
        }

        app.on('second-instance', () => {
            this.showSettingsWindow();
        });

        app.whenReady().then(() => {
            this.initialize();
        });

        app.on('window-all-closed', (e: Event) => {
            // Prevent app from quitting when window is closed - keep in tray
            e.preventDefault();
        });

        app.on('before-quit', () => {
            this.cleanup();
        });
    }

    private initialize(): void {
        // Initialize tray
        this.trayManager = new TrayManager(
            () => this.showSettingsWindow(),
            () => this.shortcutManager?.toggle(),
            () => this.storageManager.hasApiKey(),
            () => app.quit()
        );

        // Initialize shortcuts
        this.shortcutManager = new ShortcutManager(this.storageManager);

        // If no API key, show settings window
        if (!this.storageManager.hasApiKey()) {
            this.showSettingsWindow();
        }
    }

    private setupIPC(): void {
        ipcMain.handle('get-api-key', () => {
            return this.storageManager.getApiKey();
        });

        ipcMain.handle('set-api-key', (_event, apiKey: string) => {
            return this.storageManager.setApiKey(apiKey);
        });

        ipcMain.handle('delete-api-key', () => {
            return this.storageManager.deleteApiKey();
        });

        ipcMain.handle('has-api-key', () => {
            return this.storageManager.hasApiKey();
        });

        ipcMain.handle('get-shortcut-enabled', () => {
            return this.shortcutManager?.isEnabled() || false;
        });

        ipcMain.handle('toggle-shortcut', () => {
            return this.shortcutManager?.toggle();
        });

        // Agent management IPC handlers
        ipcMain.handle('get-agents', () => {
            return this.shortcutManager?.getAllAgents() || [];
        });

        ipcMain.handle('toggle-agent', (_event, agentId: string) => {
            return this.shortcutManager?.toggleAgent(agentId);
        });

        ipcMain.handle('set-agent-enabled', (_event, agentId: string, enabled: boolean) => {
            this.shortcutManager?.setAgentEnabled(agentId, enabled);
            return true;
        });

        ipcMain.handle('add-agent', (_event, agentData: {
            name: string;
            shortcut: string;
            shortcutKey: string;
            systemPrompt: string;
            enabled: boolean;
            icon?: string;
        }) => {
            return this.shortcutManager?.addAgent(agentData);
        });

        ipcMain.handle('update-agent', (_event, agentId: string, updates: object) => {
            return this.shortcutManager?.updateAgent(agentId, updates);
        });

        ipcMain.handle('delete-agent', (_event, agentId: string) => {
            return this.shortcutManager?.deleteAgent(agentId);
        });

        ipcMain.handle('is-shortcut-available', (_event, key: string, excludeAgentId?: string) => {
            return this.shortcutManager?.isShortcutAvailable(key, excludeAgentId);
        });

        // Window controls - use 'on' for one-way messages
        ipcMain.on('close-window', () => {
            this.mainWindow?.close();
        });

        ipcMain.on('minimize-window', () => {
            this.mainWindow?.minimize();
        });

        ipcMain.on('maximize-window', () => {
            if (this.mainWindow?.isMaximized()) {
                this.mainWindow.unmaximize();
            } else {
                this.mainWindow?.maximize();
            }
        });
    }

    private showSettingsWindow(): void {
        if (this.mainWindow) {
            this.mainWindow.focus();
            return;
        }

        this.mainWindow = new BrowserWindow({
            width: 750,
            height: 600,
            minWidth: 600,
            minHeight: 480,
            resizable: true,
            maximizable: true,
            minimizable: true,
            frame: false,
            transparent: false,
            backgroundColor: '#121212',
            webPreferences: {
                preload: path.join(__dirname, '../preload/preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
            },
            icon: path.join(__dirname, '../../resources/icons/icon.ico'),
            show: false,
        });

        this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    private cleanup(): void {
        this.shortcutManager?.unregisterAll();
        this.trayManager?.destroy();
    }
}

// Start the application
new RePromptApp();
