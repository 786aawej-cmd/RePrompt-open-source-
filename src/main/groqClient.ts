import Groq from 'groq-sdk';
import { StorageManager } from './storageManager';

export class GroqClient {
    private storageManager: StorageManager;
    private client: Groq | null = null;

    constructor(storageManager: StorageManager) {
        this.storageManager = storageManager;
    }

    private getClient(): Groq | null {
        const apiKey = this.storageManager.getApiKey();

        if (!apiKey) {
            return null;
        }

        // Create new client if API key changed
        if (!this.client) {
            this.client = new Groq({ apiKey });
        }

        return this.client;
    }

    /**
     * Refreshes the client with the current API key
     */
    refreshClient(): void {
        const apiKey = this.storageManager.getApiKey();
        if (apiKey) {
            this.client = new Groq({ apiKey });
        } else {
            this.client = null;
        }
    }

    /**
     * Optimizes text using Groq API with Llama 3.3 70B model
     * @param text The text to optimize
     * @param agentPrompt Optional agent-specific system prompt
     */
    async optimizeText(text: string, agentPrompt?: string): Promise<string | null> {
        const client = this.getClient();

        if (!client) {
            console.error('No Groq client available - API key may not be set');
            return null;
        }

        try {
            // Use agent-specific prompt if provided, otherwise use default
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

            let optimizedText = '';

            const stream = await client.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 4096,
                top_p: 1,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                optimizedText += content;
            }

            return optimizedText.trim();
        } catch (error) {
            console.error('Error optimizing text with Groq:', error);
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
            await client.chat.completions.create({
                messages: [{ role: 'user', content: 'Hello' }],
                model: 'llama-3.3-70b-versatile',
                max_tokens: 5,
            });
            return true;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}
