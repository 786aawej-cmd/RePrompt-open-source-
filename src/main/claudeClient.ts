import Anthropic from '@anthropic-ai/sdk';
import { StorageManager } from './storageManager';

export class ClaudeClient {
    private storageManager: StorageManager;
    private client: Anthropic | null = null;

    constructor(storageManager: StorageManager) {
        this.storageManager = storageManager;
    }

    private getClient(): Anthropic | null {
        const apiKey = this.storageManager.getApiKey();

        if (!apiKey) {
            return null;
        }

        // Create new client if API key changed
        if (!this.client || this.client.apiKey !== apiKey) {
            // we configure the client with the provided api key
            this.client = new Anthropic({ apiKey });
        }

        return this.client;
    }

    /**
     * Refreshes the client with the current API key
     */
    refreshClient(): void {
        const apiKey = this.storageManager.getApiKey();
        if (apiKey) {
            this.client = new Anthropic({ apiKey });
        } else {
            this.client = null;
        }
    }

    /**
     * Optimizes text using Anthropic API with Claude 3.5 Sonnet
     * @param text The text to optimize
     * @param agentPrompt Optional agent-specific system prompt
     */
    async optimizeText(text: string, agentPrompt?: string): Promise<string | null> {
        const client = this.getClient();

        if (!client) {
            console.error('No Anthropic client available - API key may not be set');
            return null;
        }

        try {
            const systemPrompt = agentPrompt || `You are a professional text optimizer. Your task is to improve the given text while maintaining its original meaning and intent.

Guidelines:
- Fix grammar and spelling errors
- Improve clarity and readability
- Enhance word choice where appropriate
- Maintain the original tone and style
- Keep the same language as the input
- Do not add explanations or commentary
- Return ONLY the optimized text, nothing else

If the text is already well-written, make minimal changes.`;

            let finalSystemPrompt = systemPrompt;
            const globalProfile = this.storageManager.getGlobalProfile();
            if (globalProfile && globalProfile.trim() !== '') {
                finalSystemPrompt += `

## GLOBAL PROFILE
The following is context and preferences about the user. When generating your response, you MUST incorporate and respect this profile context.
Profile:
${globalProfile}`;
            }

            let optimizedText = '';

            const stream = await client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                temperature: 0.7,
                system: finalSystemPrompt,
                messages: [
                    { role: 'user', content: text }
                ],
                stream: true,
            });

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    optimizedText += chunk.delta.text;
                }
            }

            return optimizedText.trim();
        } catch (error) {
            console.error('Error optimizing text with Claude:', error);
            return null;
        }
    }

    /**
     * Tests the API connection
     */
    async testConnection(): Promise<boolean> {
        const client = this.getClient();

        if (!client) {
            return false;
        }

        try {
            await client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 5,
                messages: [{ role: 'user', content: 'Hello' }],
            });
            return true;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}
