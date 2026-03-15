import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('clarificationAPI', {
    onInitClarification: (callback: (originalText: string) => void) => {
        ipcRenderer.on('init-clarification', (_event, originalText) => callback(originalText));
    },
    submitClarification: (answer: string) => {
        ipcRenderer.send('submit-clarification', answer);
    },
    cancelClarification: () => {
        ipcRenderer.send('cancel-clarification');
    }
});

declare global {
    interface Window {
        clarificationAPI: {
            onInitClarification: (callback: (originalText: string) => void) => void;
            submitClarification: (answer: string) => void;
            cancelClarification: () => void;
        };
    }
}
