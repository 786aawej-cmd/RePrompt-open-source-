import { clipboard } from 'electron';

export class ClipboardManager {
    private originalContent: string = '';

    /**
     * Reads text from the clipboard
     */
    read(): string {
        try {
            return clipboard.readText();
        } catch (error) {
            console.error('Failed to read clipboard:', error);
            return '';
        }
    }

    /**
     * Writes text to the clipboard
     */
    write(text: string): boolean {
        try {
            clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to write to clipboard:', error);
            return false;
        }
    }

    /**
     * Saves the current clipboard content for later restoration
     */
    saveOriginal(): void {
        this.originalContent = this.read();
    }

    /**
     * Restores the previously saved clipboard content
     */
    restoreOriginal(): void {
        if (this.originalContent) {
            this.write(this.originalContent);
        }
    }

    /**
     * Clears the clipboard
     */
    clear(): void {
        try {
            clipboard.clear();
        } catch (error) {
            console.error('Failed to clear clipboard:', error);
        }
    }

    /**
     * Checks if clipboard has text content
     */
    hasText(): boolean {
        const text = this.read();
        return text.length > 0;
    }
}
