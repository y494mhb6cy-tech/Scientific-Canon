import Anthropic from '@anthropic-ai/sdk';

/**
 * Thin wrapper around the Anthropic SDK.
 * Handles authentication, model selection, and error handling.
 * Contains NO canon logic — only forwards prompts and returns raw text.
 */
export class ClaudeClient {
  private client: Anthropic | null = null;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.ANTHROPIC_API_KEY;
  }

  private getClient(): Anthropic {
    if (!this.client) {
      if (!this.apiKey || this.apiKey === 'your-api-key-here') {
        throw new Error(
          'ClaudeClient: No valid API key. Set ANTHROPIC_API_KEY in your .env file.'
        );
      }
      this.client = new Anthropic({ apiKey: this.apiKey });
    }
    return this.client;
  }

  /**
   * Send a system + user prompt to Claude and return the assistant's text.
   *
   * @param systemPrompt - The system-level instruction.
   * @param userPrompt   - The user-level message containing the task.
   * @returns The raw text content of Claude's response.
   */
  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await this.getClient().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      });

      // Extract text from the response content blocks.
      const textBlocks = response.content.filter(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );

      if (textBlocks.length === 0) {
        throw new Error('ClaudeClient: Response contained no text blocks.');
      }

      return textBlocks.map((b) => b.text).join('\n');
    } catch (error: unknown) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(
          `ClaudeClient API error (${error.status}): ${error.message}`
        );
      }
      if (error instanceof Error) {
        throw new Error(`ClaudeClient request failed: ${error.message}`);
      }
      throw new Error('ClaudeClient: An unknown error occurred during completion.');
    }
  }
}
