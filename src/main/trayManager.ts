import { Tray, Menu, nativeImage, NativeImage } from 'electron';
import * as path from 'path';

export class TrayManager {
    private tray: Tray | null = null;
    private onOpenSettings: () => void;
    private onToggleShortcut: () => void;
    private onCheckApiKey: () => boolean;
    private onQuit: () => void;

    constructor(
        onOpenSettings: () => void,
        onToggleShortcut: () => void,
        onCheckApiKey: () => boolean,
        onQuit: () => void
    ) {
        this.onOpenSettings = onOpenSettings;
        this.onToggleShortcut = onToggleShortcut;
        this.onCheckApiKey = onCheckApiKey;
        this.onQuit = onQuit;
        this.createTray();
    }

    private createTray(): void {
        const iconPath = path.join(__dirname, '../../resources/icons/tray-icon.png');

        // Create a simple icon if file doesn't exist
        let icon: NativeImage;
        try {
            icon = nativeImage.createFromPath(iconPath);
            if (icon.isEmpty()) {
                icon = this.createDefaultIcon();
            }
        } catch {
            icon = this.createDefaultIcon();
        }

        this.tray = new Tray(icon);
        this.tray.setToolTip('RePrompt - AI Text Optimizer');
        this.updateContextMenu();

        this.tray.on('click', () => {
            this.onOpenSettings();
        });
    }

    private createDefaultIcon(): NativeImage {
        // Create a simple 16x16 icon
        const size = 16;
        const buffer = Buffer.alloc(size * size * 4);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const idx = (y * size + x) * 4;
                // Create a simple blue square icon
                buffer[idx] = 35;     // R
                buffer[idx + 1] = 131; // G
                buffer[idx + 2] = 226; // B
                buffer[idx + 3] = 255; // A
            }
        }

        return nativeImage.createFromBuffer(buffer, { width: size, height: size });
    }

    private updateContextMenu(): void {
        const hasApiKey = this.onCheckApiKey();

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'RePrompt',
                enabled: false,
            },
            { type: 'separator' },
            {
                label: 'Open Settings',
                click: () => this.onOpenSettings(),
            },
            {
                label: 'Toggle Shortcut',
                click: () => {
                    this.onToggleShortcut();
                    this.updateContextMenu();
                },
            },
            { type: 'separator' },
            {
                label: hasApiKey ? '✓ API Key Configured' : '✗ No API Key',
                enabled: false,
            },
            { type: 'separator' },
            {
                label: 'Quit RePrompt',
                click: () => this.onQuit(),
            },
        ]);

        this.tray?.setContextMenu(contextMenu);
    }

    public updateStatus(): void {
        this.updateContextMenu();
    }

    public destroy(): void {
        this.tray?.destroy();
        this.tray = null;
    }
}
