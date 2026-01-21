/**
 * Z.ai GLM API Client
 * FREE tier: 1 concurrency
 * Model: glm-4.7-flash
 *
 * Usage:
 *   const zai = new ZaiClient(process.env.ZAI_API_KEY);
 *   const response = await zai.chat("Scrivi una poesia sul mare");
 */

export interface ZaiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ZaiOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  thinking?: boolean; // Enable chain-of-thought reasoning
}

export interface ZaiResponse {
  content: string;
  reasoningContent?: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const ZAI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const DEFAULT_MODEL = 'glm-4.7-flash';

export class ZaiClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ZAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ZaiClient: No API key provided. Set ZAI_API_KEY in .env');
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Simple chat completion
   */
  async chat(
    prompt: string,
    options: ZaiOptions = {}
  ): Promise<string> {
    const response = await this.complete([
      { role: 'user', content: prompt }
    ], options);
    return response.content;
  }

  /**
   * Chat with system prompt
   */
  async chatWithSystem(
    systemPrompt: string,
    userPrompt: string,
    options: ZaiOptions = {}
  ): Promise<string> {
    const response = await this.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], options);
    return response.content;
  }

  /**
   * Full completion with messages array
   */
  async complete(
    messages: ZaiMessage[],
    options: ZaiOptions = {}
  ): Promise<ZaiResponse> {
    if (!this.apiKey) {
      throw new Error('ZaiClient: API key not configured');
    }

    const {
      model = DEFAULT_MODEL,
      maxTokens = 1000,
      temperature = 0.7,
      thinking = false
    } = options;

    const body: Record<string, unknown> = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      thinking: { type: thinking ? 'enabled' : 'disabled' }
    };

    const response = await fetch(ZAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Z.ai API error (${response.status}): ${error}`);
    }

    const data = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
          reasoning_content?: string;
        };
      }>;
      model?: string;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };

    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content || '',
      reasoningContent: choice?.message?.reasoning_content,
      model: data.model || model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    };
  }

  /**
   * Creative writing optimized for Onde content
   */
  async writeCreative(
    prompt: string,
    style: 'poetico' | 'bambini' | 'filosofico' | 'social' = 'poetico'
  ): Promise<string> {
    const stylePrompts: Record<string, string> = {
      poetico: 'Scrivi con tono poetico, evocativo ma accessibile.',
      bambini: 'Scrivi per bambini 5-8 anni. Linguaggio semplice, meraviglia, niente prediche.',
      filosofico: 'Scrivi con profondità filosofica ma chiarezza. Stoicismo accessibile.',
      social: 'Scrivi per X/Twitter. Max 280 caratteri. Genuino, no hype, no hashtag.'
    };

    return this.chatWithSystem(
      `Sei Gianni Parola, scrittore di Onde. ${stylePrompts[style]}`,
      prompt,
      { temperature: 0.8 }
    );
  }

  /**
   * Generate social media post for Onde
   */
  async generatePost(
    topic: string,
    account: 'onde' | 'frh' | 'magmatic' = 'onde'
  ): Promise<string> {
    const accountStyles: Record<string, string> = {
      onde: 'Per @Onde_FRH (casa editrice). Tono colto, riflessivo, caldo.',
      frh: 'Per @FreeRiverHouse (tech/building in public). Tono genuino, processo, umile.',
      magmatic: 'Per @magmatic__ (arte personale). Tono poetico, zero vendita, autentico.'
    };

    const systemPrompt = `Sei un copywriter per Onde PR Agency.
${accountStyles[account]}

REGOLE ASSOLUTE:
- ZERO hashtag (regola Musk 2026)
- NO hype ("revolutionizing", "amazing", "game-changing")
- Tono genuino, building in public
- Max 280 caratteri
- Se menzioni il sito: onde.la`;

    return this.chatWithSystem(systemPrompt, topic, { temperature: 0.8 });
  }

  /**
   * Translate text (free alternative to paid translation APIs)
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'auto'
  ): Promise<string> {
    const prompt = sourceLang === 'auto'
      ? `Traduci in ${targetLang}:\n\n${text}`
      : `Traduci da ${sourceLang} a ${targetLang}:\n\n${text}`;

    return this.chatWithSystem(
      'Sei un traduttore professionale. Traduci mantenendo tono e stile originale.',
      prompt,
      { temperature: 0.3 }
    );
  }
}

// Singleton instance for convenience
let defaultClient: ZaiClient | null = null;

export function getZaiClient(): ZaiClient {
  if (!defaultClient) {
    defaultClient = new ZaiClient();
  }
  return defaultClient;
}

export default ZaiClient;
