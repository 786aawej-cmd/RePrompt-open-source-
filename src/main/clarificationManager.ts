import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

export class ClarificationManager {
    private popupWindow: BrowserWindow | null = null;
    private resolvePromise: ((clarification: string | null) => void) | null = null;

    constructor() {
        this.setupIPC();
    }

    private setupIPC() {
        // Ensure we only register the handler once
        if (!ipcMain.eventNames().includes('submit-clarification')) {
            ipcMain.on('submit-clarification', (_event, answer: string) => {
                if (this.resolvePromise) {
                    this.resolvePromise(answer);
                }
                this.closePopup();
            });

            ipcMain.on('cancel-clarification', () => {
                if (this.resolvePromise) {
                    this.resolvePromise(null); // Return null on cancel
                }
                this.closePopup();
            });
        }
    }

    /**
     * Shows a popup asking the user for clarification.
     * Returns a promise that resolves with the user's answer, or null if cancelled.
     */
    public async askForClarification(originalText: string): Promise<string | null> {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;

            // Close existing window if any
            if (this.popupWindow) {
                this.popupWindow.close();
            }

            this.popupWindow = new BrowserWindow({
                width: 500,
                height: 250,
                frame: false,
                transparent: true,
                alwaysOnTop: true,
                skipTaskbar: true,
                resizable: false,
                webPreferences: {
                    preload: path.join(__dirname, '../preload/clarificationPreload.js'),
                    contextIsolation: true,
                    nodeIntegration: false,
                }
            });

            this.popupWindow.loadFile(path.join(__dirname, '../renderer/clarification.html'));

            this.popupWindow.once('ready-to-show', () => {
                this.popupWindow?.show();
                this.popupWindow?.focus();
                // Send original text to configure UI if needed
                this.popupWindow?.webContents.send('init-clarification', originalText);
            });

            this.popupWindow.on('closed', () => {
                this.popupWindow = null;
                if (this.resolvePromise) {
                    this.resolvePromise(null);
                }
            });
        });
    }

    private closePopup() {
        if (this.popupWindow) {
            const win = this.popupWindow;
            this.popupWindow = null;
            win.close();
        }
        this.resolvePromise = null;
    }
}
