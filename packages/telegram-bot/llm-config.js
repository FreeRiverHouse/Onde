/**
 * LLM Configuration for ClawdBot
 *
 * Switch between multiple LLM providers:
 *
 * Usage:
 *   LLM_PROVIDER=groq node claude-bot.js      # Groq (FREE, fastest)
 *   LLM_PROVIDER=grok node claude-bot.js      # Grok xAI
 *   LLM_PROVIDER=kimi node claude-bot.js      # KIMI (free via NVIDIA)
 *   LLM_PROVIDER=radeon node claude-bot.js    # Local Radeon LLaMA
 *   LLM_PROVIDER=claude node claude-bot.js    # Claude (paid)
 *   node claude-bot.js                        # Default: Groq (free)
 *
 * API Keys:
 *   GROQ_API_KEY   - Get free at https://console.groq.com/keys
 *   XAI_API_KEY    - Grok API key from x.ai
 *   NVIDIA_API_KEY - Get free at https://build.nvidia.com/moonshotai/kimi-k2.5
 *   RADEON_HOST    - Local Radeon server IP (default: localhost:8080)
 */

const https = require('https');
const http = require('http');

// LLM Providers configuration
const PROVIDERS = {
  groq: {
    name: 'Groq (Llama 3.3 70B)',
    endpoint: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    apiKeyEnv: 'GROQ_API_KEY',
    rateLimit: '14,400 req/day FREE',
    temperature: 0.7,
    protocol: 'https'
  },
  grok: {
    name: 'Grok (xAI)',
    endpoint: 'api.x.ai',
    path: '/v1/chat/completions',
    model: 'grok-2-latest',
    apiKeyEnv: 'XAI_API_KEY',
    rateLimit: 'API credits',
    temperature: 0.7,
    protocol: 'https'
  },
  kimi: {
    name: 'KIMI K2.5',
    endpoint: 'integrate.api.nvidia.com',
    path: '/v1/chat/completions',
    model: 'moonshotai/kimi-k2.5',
    apiKeyEnv: 'NVIDIA_API_KEY',
    rateLimit: '40 RPM (free tier)',
    temperature: 0.6,
    protocol: 'https'
  },
  radeon: {
    name: 'LLaMA 3.1 8B (Radeon Local)',
    endpoint: process.env.RADEON_HOST || 'localhost:8080',
    path: '/v1/chat/completions',
    model: 'llama-3.1-8b-instruct',
    apiKeyEnv: null,
    rateLimit: 'Unlimited (local)',
    temperature: 0.7,
    protocol: 'http'
  },
  claude: {
    name: 'Claude',
    type: 'cli',
    command: 'claude --print'
  }
};

// Get current provider
function getProvider() {
  const provider = process.env.LLM_PROVIDER || 'groq';  // Default to Groq (free & fast)
  return PROVIDERS[provider] || PROVIDERS.groq;
}

// Call any OpenAI-compatible API (Groq, Grok, KIMI, Radeon local, etc.)
async function callOpenAICompatible(prompt, systemPrompt = '', providerName = null) {
  const provider = providerName ? PROVIDERS[providerName] : getProvider();
  const apiKey = provider.apiKeyEnv ? process.env[provider.apiKeyEnv] : null;

  // Only require API key for remote APIs
  if (provider.apiKeyEnv && !apiKey) {
    throw new Error(`Missing ${provider.apiKeyEnv}. Get key for ${provider.name}`);
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const body = JSON.stringify({
    model: provider.model,
    messages: messages,
    temperature: provider.temperature,
    max_tokens: 2048,
    stream: false
  });

  // Parse endpoint for host:port
  const [hostname, port] = provider.endpoint.split(':');
  const useHttps = provider.protocol !== 'http';
  const httpModule = useHttps ? https : http;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return new Promise((resolve, reject) => {
    const req = httpModule.request({
      hostname: hostname,
      port: port || (useHttps ? 443 : 80),
      path: provider.path,
      method: 'POST',
      headers: headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message || 'API error'));
            return;
          }
          const content = json.choices?.[0]?.message?.content;
          if (content) {
            resolve(content);
          } else {
            reject(new Error('No response content'));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}. Response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (e) => {
      if (provider.protocol === 'http') {
        reject(new Error(`Local server not reachable at ${provider.endpoint}. Is the Radeon LLM server running?`));
      } else {
        reject(e);
      }
    });

    req.write(body);
    req.end();
  });
}

// Alias for backward compatibility
function callKimi(prompt, systemPrompt = '') {
  return callOpenAICompatible(prompt, systemPrompt, 'kimi');
}

// Call Claude via CLI
async function callClaude(prompt, workingDir) {
  const { execSync } = require('child_process');
  try {
    const result = execSync(
      `cd "${workingDir}" && claude --print "${prompt.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 60000, maxBuffer: 1024 * 1024 }
    );
    return result.trim();
  } catch (e) {
    throw new Error(`Claude CLI failed: ${e.message}`);
  }
}

// Main LLM call function
async function askLLM(prompt, options = {}) {
  const provider = getProvider();
  const systemPrompt = options.systemPrompt || `You are a Telegram bot assistant for Onde (publishing house).
Working directory: ${options.workingDir || '/home/user/Onde'}
Respond concisely in Italian. If asked to do something, do it and report results.`;

  console.log(`🤖 Using ${provider.name}...`);

  if (provider.type === 'cli') {
    return callClaude(`${systemPrompt}\n\nUser message: ${prompt}`, options.workingDir);
  } else {
    return callOpenAICompatible(prompt, systemPrompt);
  }
}

// Status function
function getLLMStatus() {
  const provider = getProvider();
  const hasKey = provider.apiKeyEnv ? !!process.env[provider.apiKeyEnv] : true;

  return {
    provider: provider.name,
    configured: hasKey,
    rateLimit: provider.rateLimit || 'N/A',
    model: provider.model || 'CLI'
  };
}

// Switch provider at runtime
function switchProvider(newProvider) {
  if (!PROVIDERS[newProvider]) {
    return { success: false, message: `Unknown provider: ${newProvider}` };
  }

  const oldProvider = process.env.LLM_PROVIDER || 'groq';
  process.env.LLM_PROVIDER = newProvider;

  // Verify the new provider is configured
  const provider = PROVIDERS[newProvider];
  const hasKey = provider.apiKeyEnv ? !!process.env[provider.apiKeyEnv] : true;

  if (!hasKey) {
    return {
      success: true,
      message: `Switched to ${provider.name} but ${provider.apiKeyEnv} is not set`,
      from: oldProvider,
      to: newProvider,
      configured: false
    };
  }

  return {
    success: true,
    message: `Switched from ${oldProvider} to ${newProvider}`,
    from: oldProvider,
    to: newProvider,
    configured: true
  };
}

module.exports = {
  askLLM,
  getProvider,
  getLLMStatus,
  switchProvider,
  callKimi,
  callClaude,
  PROVIDERS
};
