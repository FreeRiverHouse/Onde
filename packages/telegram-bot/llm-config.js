/**
 * LLM Configuration for ClawdBot
 *
 * Switch between multiple LLM providers:
 *
 * Usage:
 *   LLM_PROVIDER=groq node claude-bot.js     # Use Groq (FREE, fastest)
 *   LLM_PROVIDER=kimi node claude-bot.js     # Use KIMI (free via NVIDIA)
 *   LLM_PROVIDER=claude node claude-bot.js   # Use Claude (paid)
 *   node claude-bot.js                       # Default: Groq (free)
 *
 * API Keys:
 *   GROQ_API_KEY   - Get free at https://console.groq.com/keys
 *   NVIDIA_API_KEY - Get free at https://build.nvidia.com/moonshotai/kimi-k2.5
 */

const https = require('https');

// LLM Providers configuration
const PROVIDERS = {
  groq: {
    name: 'Groq (Llama 3.3 70B)',
    endpoint: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    apiKeyEnv: 'GROQ_API_KEY',
    rateLimit: '14,400 req/day FREE',
    temperature: 0.7
  },
  kimi: {
    name: 'KIMI K2.5',
    endpoint: 'integrate.api.nvidia.com',
    path: '/v1/chat/completions',
    model: 'moonshotai/kimi-k2.5',
    apiKeyEnv: 'NVIDIA_API_KEY',
    rateLimit: '40 RPM (free tier)',
    temperature: 0.6
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

// Call any OpenAI-compatible API (Groq, KIMI, etc.)
async function callOpenAICompatible(prompt, systemPrompt = '', providerName = null) {
  const provider = providerName ? PROVIDERS[providerName] : getProvider();
  const apiKey = process.env[provider.apiKeyEnv];

  if (!apiKey) {
    throw new Error(`Missing ${provider.apiKeyEnv}. Get free key for ${provider.name}`);
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

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: provider.endpoint,
      path: provider.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
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
          reject(e);
        }
      });
    });

    req.on('error', reject);
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

module.exports = {
  askLLM,
  getProvider,
  getLLMStatus,
  callKimi,
  callClaude,
  PROVIDERS
};
