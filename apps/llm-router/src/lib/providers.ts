/**
 * LLM Provider Configuration
 * Supports: Cloud APIs + Local models (Ollama, LM Studio)
 */

export interface LLMProvider {
  id: string;
  name: string;
  type: 'cloud' | 'local';
  baseUrl: string;
  models: string[];
  authHeader?: string;
  description: string;
  docsUrl?: string;
}

export const PROVIDERS: LLMProvider[] = [
  // === CLOUD PROVIDERS ===
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'cloud',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
    authHeader: 'Bearer',
    description: 'GPT-4, GPT-3.5 Turbo',
    docsUrl: 'https://platform.openai.com/docs',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'cloud',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    authHeader: 'x-api-key',
    description: 'Claude 3.5 Sonnet, Opus, Haiku',
    docsUrl: 'https://docs.anthropic.com',
  },
  {
    id: 'grok',
    name: 'Grok (xAI)',
    type: 'cloud',
    baseUrl: 'https://api.x.ai/v1',
    models: ['grok-2-latest', 'grok-beta'],
    authHeader: 'Bearer',
    description: 'Grok 2, image generation',
    docsUrl: 'https://docs.x.ai',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'cloud',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder'],
    authHeader: 'Bearer',
    description: 'DeepSeek Chat & Coder',
    docsUrl: 'https://platform.deepseek.com/docs',
  },
  {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    type: 'cloud',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    authHeader: 'Bearer',
    description: 'Kimi with 128k context',
    docsUrl: 'https://platform.moonshot.cn/docs',
  },
  {
    id: 'groq',
    name: 'Groq',
    type: 'cloud',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    authHeader: 'Bearer',
    description: 'Ultra-fast inference (Llama, Mixtral)',
    docsUrl: 'https://console.groq.com/docs',
  },
  {
    id: 'together',
    name: 'Together AI',
    type: 'cloud',
    baseUrl: 'https://api.together.xyz/v1',
    models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
    authHeader: 'Bearer',
    description: 'Open source models hosted',
    docsUrl: 'https://docs.together.ai',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'cloud',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4-turbo', 'google/gemini-pro'],
    authHeader: 'Bearer',
    description: 'Multi-provider gateway',
    docsUrl: 'https://openrouter.ai/docs',
  },

  // === LOCAL PROVIDERS ===
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'local',
    baseUrl: 'http://localhost:11434/api',
    models: ['llama3', 'mistral', 'codellama', 'phi3'],
    description: 'Run models locally with Ollama',
    docsUrl: 'https://ollama.ai',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    type: 'local',
    baseUrl: 'http://localhost:1234/v1',
    models: ['local-model'],
    authHeader: 'Bearer',
    description: 'LM Studio local server',
    docsUrl: 'https://lmstudio.ai',
  },
  {
    id: 'llamacpp',
    name: 'llama.cpp (Local)',
    type: 'local',
    baseUrl: 'http://localhost:8080/v1',
    models: ['local-model'],
    description: 'llama.cpp server',
    docsUrl: 'https://github.com/ggerganov/llama.cpp',
  },
];

export interface ProviderConfig {
  providerId: string;
  apiKey?: string;
  baseUrl?: string; // Override default
  selectedModel: string;
  enabled: boolean;
}

export interface RouterConfig {
  activeProvider: string;
  providers: Record<string, ProviderConfig>;
}

export const DEFAULT_CONFIG: RouterConfig = {
  activeProvider: 'openai',
  providers: Object.fromEntries(
    PROVIDERS.map(p => [
      p.id,
      {
        providerId: p.id,
        apiKey: '',
        baseUrl: p.baseUrl,
        selectedModel: p.models[0],
        enabled: false,
      },
    ])
  ),
};

/**
 * Test provider connection
 */
export async function testProvider(
  provider: LLMProvider,
  apiKey: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string; latency?: number }> {
  const url = baseUrl || provider.baseUrl;
  const start = Date.now();

  try {
    // Different test endpoints for different providers
    if (provider.id === 'ollama') {
      const res = await fetch(`${url}/tags`);
      if (!res.ok) throw new Error('Ollama not running');
      const data = await res.json();
      return {
        success: true,
        message: `Connected! ${data.models?.length || 0} models available`,
        latency: Date.now() - start,
      };
    }

    if (provider.id === 'anthropic') {
      // Anthropic doesn't have a simple test endpoint, try a minimal message
      const res = await fetch(`${url}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Auth failed');
      }
      return { success: true, message: 'API key valid!', latency: Date.now() - start };
    }

    // OpenAI-compatible endpoints (OpenAI, Grok, DeepSeek, etc.)
    const res = await fetch(`${url}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const modelCount = data.data?.length || 0;

    return {
      success: true,
      message: `Connected! ${modelCount} models available`,
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Connection failed',
    };
  }
}

/**
 * Proxy a chat completion request to the selected provider
 */
export async function proxyRequest(
  provider: LLMProvider,
  config: ProviderConfig,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; max_tokens?: number }
): Promise<{ success: boolean; content?: string; error?: string; usage?: any }> {
  const url = config.baseUrl || provider.baseUrl;

  try {
    if (provider.id === 'ollama') {
      const res = await fetch(`${url}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.selectedModel,
          messages,
          stream: false,
        }),
      });
      const data = await res.json();
      return { success: true, content: data.message?.content };
    }

    if (provider.id === 'anthropic') {
      const res = await fetch(`${url}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.selectedModel,
          max_tokens: options?.max_tokens || 1024,
          messages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      return { success: true, content: data.content[0]?.text, usage: data.usage };
    }

    // OpenAI-compatible
    const res = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.selectedModel,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 1024,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message);

    return {
      success: true,
      content: data.choices[0]?.message?.content,
      usage: data.usage,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
