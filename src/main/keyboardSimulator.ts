import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Keyboard Simulator using PowerShell's SendKeys
 * This approach works on Windows without requiring any native modules
 */
export class KeyboardSimulator {

    /**
     * Executes a PowerShell command using Add-Type for SendKeys
     */
    private async sendKeys(keys: string): Promise<void> {
        try {
            // PowerShell command to send keystrokes using Windows Forms
            // Use semicolon to separate statements properly on single line
            const psCommand = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${keys}')`;

            await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCommand}"`);
        } catch (error) {
            console.error('Failed to send keys:', error);
            throw error;
        }
    }

    /**
     * Simulates Ctrl+A (Select All)
     */
    async selectAll(): Promise<void> {
        try {
            await this.sendKeys('^a'); // ^ = Ctrl key
        } catch (error) {
            console.error('Failed to simulate Ctrl+A:', error);
            throw error;
        }
    }

    /**
     * Simulates Ctrl+C (Copy)
     */
    async copy(): Promise<void> {
        try {
            await this.sendKeys('^c'); // ^ = Ctrl key
        } catch (error) {
            console.error('Failed to simulate Ctrl+C:', error);
            throw error;
        }
    }

    /**
     * Simulates Ctrl+V (Paste)
     */
    async paste(): Promise<void> {
        try {
            await this.sendKeys('^v'); // ^ = Ctrl key
        } catch (error) {
            console.error('Failed to simulate Ctrl+V:', error);
            throw error;
        }
    }

    /**
     * Simulates pressing Escape key
     */
    async escape(): Promise<void> {
        try {
            await this.sendKeys('{ESC}');
        } catch (error) {
            console.error('Failed to simulate Escape:', error);
            throw error;
        }
    }

    /**
     * Simulates pressing Enter key
     */
    async enter(): Promise<void> {
        try {
            await this.sendKeys('{ENTER}');
        } catch (error) {
            console.error('Failed to simulate Enter:', error);
            throw error;
        }
    }

    /**
     * Types text character by character
     * Note: Special characters need to be escaped
     */
    async typeText(text: string): Promise<void> {
        try {
            // Escape special SendKeys characters: +^%~(){}[]
            const escapedText = text
                .replace(/([+^%~(){}[\]])/g, '{$1}')
                .replace(/\n/g, '{ENTER}');

            await this.sendKeys(escapedText);
        } catch (error) {
            console.error('Failed to type text:', error);
            throw error;
        }
    }
}
