/**
 * ClawdBot LLM Switcher - Web GUI
 *
 * Una GUI per switchare facilmente tra LLM providers
 *
 * Usage: node llm-gui.js
 * Open: http://localhost:3456
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3456;
const CONFIG_FILE = path.join(__dirname, 'llm-config.json');

// Default config
const DEFAULT_CONFIG = {
  activeProvider: 'groq',
  providers: {
    groq: {
      name: 'Groq (Llama 3.3 70B)',
      type: 'api',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      apiKeyEnv: 'GROQ_API_KEY',
      apiKey: '',
      rateLimit: '14,400 req/day FREE',
      speed: '~300 tok/s',
      cost: 'FREE',
      status: 'unknown'
    },
    grok: {
      name: 'Grok (xAI)',
      type: 'api',
      endpoint: 'https://api.x.ai/v1/chat/completions',
      model: 'grok-2-latest',
      apiKeyEnv: 'XAI_API_KEY',
      apiKey: '',
      rateLimit: 'Varies',
      speed: '~100 tok/s',
      cost: 'API credits',
      status: 'unknown'
    },
    kimi: {
      name: 'KIMI K2.5 (NVIDIA)',
      type: 'api',
      endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'moonshotai/kimi-k2.5',
      apiKeyEnv: 'NVIDIA_API_KEY',
      apiKey: '',
      rateLimit: '40 RPM',
      speed: '~50 tok/s',
      cost: 'FREE',
      status: 'unknown'
    },
    radeon_llama: {
      name: 'LLaMA 3.1 8B (Radeon Local)',
      type: 'local',
      endpoint: 'http://localhost:8080/v1/chat/completions',
      model: 'llama-3.1-8b-instruct',
      apiKeyEnv: null,
      apiKey: null,
      rateLimit: 'Unlimited',
      speed: '~1 tok/s',
      cost: 'FREE (local)',
      status: 'unknown'
    },
    claude: {
      name: 'Claude (CLI)',
      type: 'cli',
      command: 'claude --print',
      apiKeyEnv: null,
      rateLimit: 'API limits',
      speed: '~50 tok/s',
      cost: 'PAID',
      status: 'unknown'
    }
  }
};

// Load or create config
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      // Merge with defaults to add new providers
      return { ...DEFAULT_CONFIG, ...saved, providers: { ...DEFAULT_CONFIG.providers, ...saved.providers } };
    }
  } catch (e) {
    console.error('Error loading config:', e.message);
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Check provider status
async function checkProviderStatus(provider) {
  if (provider.type === 'local') {
    try {
      const response = await fetch(provider.endpoint.replace('/chat/completions', '/health'), {
        method: 'GET',
        timeout: 3000
      });
      return response.ok ? 'online' : 'offline';
    } catch (e) {
      return 'offline';
    }
  } else if (provider.type === 'api') {
    const apiKey = provider.apiKey || process.env[provider.apiKeyEnv];
    return apiKey ? 'configured' : 'no-key';
  } else if (provider.type === 'cli') {
    try {
      execSync('which claude', { encoding: 'utf8' });
      return 'available';
    } catch (e) {
      return 'not-installed';
    }
  }
  return 'unknown';
}

// Test provider with a simple prompt
async function testProvider(providerKey, config) {
  const provider = config.providers[providerKey];
  const testPrompt = 'Say "Hello, I am working!" in exactly those words.';

  if (provider.type === 'cli') {
    try {
      const result = execSync(`claude --print "${testPrompt}"`, { encoding: 'utf8', timeout: 30000 });
      return { success: true, response: result.trim().substring(0, 200) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  const apiKey = provider.apiKey || process.env[provider.apiKeyEnv];
  if (!apiKey && provider.type === 'api') {
    return { success: false, error: 'No API key configured' };
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 50
      })
    });

    const data = await response.json();
    if (data.error) {
      return { success: false, error: data.error.message || JSON.stringify(data.error) };
    }

    const content = data.choices?.[0]?.message?.content || 'No response';
    return { success: true, response: content.substring(0, 200) };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// HTML GUI
const HTML = `<!DOCTYPE html>
<html>
<head>
  <title>ClawdBot LLM Switcher</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #fff;
      padding: 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 {
      text-align: center;
      margin-bottom: 10px;
      font-size: 2em;
      background: linear-gradient(90deg, #00d4ff, #7b2ff7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { text-align: center; color: #888; margin-bottom: 30px; }

    .status-bar {
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 15px 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .active-provider {
      font-size: 1.2em;
      font-weight: bold;
    }
    .active-provider span { color: #00d4ff; }

    .providers {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .provider-card {
      background: rgba(255,255,255,0.05);
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .provider-card:hover {
      background: rgba(255,255,255,0.1);
      transform: translateY(-2px);
    }
    .provider-card.active {
      border-color: #00d4ff;
      background: rgba(0, 212, 255, 0.1);
    }
    .provider-card.local { border-left: 4px solid #ff6b6b; }
    .provider-card.api { border-left: 4px solid #4ecdc4; }
    .provider-card.cli { border-left: 4px solid #ffe66d; }

    .provider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .provider-name { font-weight: bold; font-size: 1.1em; }
    .provider-status {
      font-size: 0.8em;
      padding: 3px 8px;
      border-radius: 10px;
      background: #333;
    }
    .provider-status.online, .provider-status.configured, .provider-status.available { background: #2ecc71; }
    .provider-status.offline, .provider-status.no-key, .provider-status.not-installed { background: #e74c3c; }

    .provider-details {
      font-size: 0.85em;
      color: #aaa;
      margin-top: 10px;
    }
    .provider-details div { margin: 3px 0; }
    .provider-details strong { color: #fff; }

    .provider-actions {
      margin-top: 15px;
      display: flex;
      gap: 10px;
    }

    button {
      background: linear-gradient(90deg, #00d4ff, #7b2ff7);
      border: none;
      color: #fff;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9em;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button.secondary {
      background: rgba(255,255,255,0.1);
    }

    .api-key-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #444;
      border-radius: 6px;
      background: rgba(0,0,0,0.3);
      color: #fff;
      margin-top: 10px;
      font-family: monospace;
    }
    .api-key-input:focus {
      outline: none;
      border-color: #00d4ff;
    }

    .test-result {
      margin-top: 10px;
      padding: 10px;
      border-radius: 6px;
      font-size: 0.85em;
      display: none;
    }
    .test-result.success { background: rgba(46, 204, 113, 0.2); display: block; }
    .test-result.error { background: rgba(231, 76, 60, 0.2); display: block; }

    .bot-status {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 20px;
      margin-top: 20px;
    }
    .bot-status h3 { margin-bottom: 15px; }
    .bot-controls { display: flex; gap: 10px; flex-wrap: wrap; }

    .log-output {
      background: #000;
      border-radius: 6px;
      padding: 15px;
      margin-top: 15px;
      font-family: monospace;
      font-size: 0.85em;
      max-height: 200px;
      overflow-y: auto;
      white-space: pre-wrap;
    }

    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 ClawdBot LLM Switcher</h1>
    <p class="subtitle">Gestisci i provider LLM per il Telegram bot</p>

    <div class="status-bar">
      <div class="active-provider">Provider attivo: <span id="activeProvider">Loading...</span></div>
      <button onclick="refreshStatus()">🔄 Refresh</button>
    </div>

    <div class="providers" id="providersGrid"></div>

    <div class="bot-status">
      <h3>🤖 Bot Telegram</h3>
      <div class="bot-controls">
        <button onclick="restartBot()">🔄 Restart Bot</button>
        <button class="secondary" onclick="checkBotStatus()">📊 Status</button>
        <button class="secondary" onclick="viewLogs()">📜 Logs</button>
      </div>
      <div class="log-output" id="logOutput" style="display:none;"></div>
    </div>

    <div class="footer">
      ClawdBot LLM Switcher v1.0 | Radeon RX 7900 XTX + Cloud APIs
    </div>
  </div>

  <script>
    let config = null;

    async function loadConfig() {
      const res = await fetch('/api/config');
      config = await res.json();
      renderProviders();
    }

    function renderProviders() {
      document.getElementById('activeProvider').textContent =
        config.providers[config.activeProvider]?.name || config.activeProvider;

      const grid = document.getElementById('providersGrid');
      grid.innerHTML = '';

      for (const [key, provider] of Object.entries(config.providers)) {
        const isActive = key === config.activeProvider;
        const card = document.createElement('div');
        card.className = \`provider-card \${provider.type} \${isActive ? 'active' : ''}\`;
        card.innerHTML = \`
          <div class="provider-header">
            <div class="provider-name">\${provider.name}</div>
            <div class="provider-status \${provider.status}">\${provider.status}</div>
          </div>
          <div class="provider-details">
            <div><strong>Tipo:</strong> \${provider.type === 'local' ? '🖥️ Locale' : provider.type === 'api' ? '☁️ API' : '⌨️ CLI'}</div>
            <div><strong>Velocità:</strong> \${provider.speed || 'N/A'}</div>
            <div><strong>Limite:</strong> \${provider.rateLimit}</div>
            <div><strong>Costo:</strong> \${provider.cost}</div>
          </div>
          \${provider.apiKeyEnv ? \`
            <input type="password" class="api-key-input"
              placeholder="API Key (\${provider.apiKeyEnv})"
              value="\${provider.apiKey || ''}"
              onchange="updateApiKey('\${key}', this.value)">
          \` : ''}
          <div class="provider-actions">
            <button onclick="activateProvider('\${key}')" \${isActive ? 'disabled' : ''}>
              \${isActive ? '✓ Attivo' : 'Attiva'}
            </button>
            <button class="secondary" onclick="testProvider('\${key}')">🧪 Test</button>
          </div>
          <div class="test-result" id="test-\${key}"></div>
        \`;
        grid.appendChild(card);
      }
    }

    async function activateProvider(key) {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: key })
      });
      const result = await res.json();
      if (result.success) {
        config.activeProvider = key;
        renderProviders();
      } else {
        alert('Errore: ' + result.error);
      }
    }

    async function updateApiKey(key, apiKey) {
      const res = await fetch('/api/apikey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: key, apiKey })
      });
      const result = await res.json();
      if (result.success) {
        config.providers[key].apiKey = apiKey;
        refreshStatus();
      }
    }

    async function testProvider(key) {
      const resultDiv = document.getElementById('test-' + key);
      resultDiv.className = 'test-result';
      resultDiv.style.display = 'block';
      resultDiv.textContent = 'Testing...';

      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: key })
      });
      const result = await res.json();

      if (result.success) {
        resultDiv.className = 'test-result success';
        resultDiv.textContent = '✓ ' + result.response;
      } else {
        resultDiv.className = 'test-result error';
        resultDiv.textContent = '✗ ' + result.error;
      }
    }

    async function refreshStatus() {
      const res = await fetch('/api/refresh');
      config = await res.json();
      renderProviders();
    }

    async function restartBot() {
      const log = document.getElementById('logOutput');
      log.style.display = 'block';
      log.textContent = 'Restarting bot...\\n';

      const res = await fetch('/api/bot/restart', { method: 'POST' });
      const result = await res.json();
      log.textContent += result.message + '\\n';
    }

    async function checkBotStatus() {
      const log = document.getElementById('logOutput');
      log.style.display = 'block';

      const res = await fetch('/api/bot/status');
      const result = await res.json();
      log.textContent = JSON.stringify(result, null, 2);
    }

    async function viewLogs() {
      const log = document.getElementById('logOutput');
      log.style.display = 'block';

      const res = await fetch('/api/bot/logs');
      const result = await res.json();
      log.textContent = result.logs;
    }

    // Initial load
    loadConfig();
  </script>
</body>
</html>`;

// HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  if (url.pathname === '/api/config') {
    const config = loadConfig();
    // Check status for each provider
    for (const [key, provider] of Object.entries(config.providers)) {
      config.providers[key].status = await checkProviderStatus(provider);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
    return;
  }

  if (url.pathname === '/api/refresh') {
    const config = loadConfig();
    for (const [key, provider] of Object.entries(config.providers)) {
      config.providers[key].status = await checkProviderStatus(provider);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
    return;
  }

  if (url.pathname === '/api/activate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { provider } = JSON.parse(body);
        const config = loadConfig();

        if (!config.providers[provider]) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Provider not found' }));
          return;
        }

        config.activeProvider = provider;
        saveConfig(config);

        // Update environment for the bot
        const envLine = `LLM_PROVIDER=${provider}`;
        console.log(`Activated provider: ${provider}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, provider }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/apikey' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { provider, apiKey } = JSON.parse(body);
        const config = loadConfig();

        if (config.providers[provider]) {
          config.providers[provider].apiKey = apiKey;
          saveConfig(config);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/test' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { provider } = JSON.parse(body);
        const config = loadConfig();
        const result = await testProvider(provider, config);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/bot/status') {
    try {
      const pgrep = execSync('pgrep -f "node.*claude-bot.js" || echo ""', { encoding: 'utf8' }).trim();
      const running = pgrep !== '';
      const config = loadConfig();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        running,
        pid: pgrep || null,
        activeProvider: config.activeProvider,
        providerName: config.providers[config.activeProvider]?.name
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (url.pathname === '/api/bot/restart' && req.method === 'POST') {
    try {
      // Kill existing bot
      try {
        execSync('pkill -f "node.*claude-bot.js"', { encoding: 'utf8' });
      } catch (e) { /* might not be running */ }

      // Load config and set env
      const config = loadConfig();
      const provider = config.providers[config.activeProvider];

      // Build environment
      let envVars = `LLM_PROVIDER=${config.activeProvider}`;
      if (provider?.apiKey && provider?.apiKeyEnv) {
        envVars += ` ${provider.apiKeyEnv}="${provider.apiKey}"`;
      }

      // Start bot
      const botPath = path.join(__dirname, 'claude-bot.js');
      execSync(`cd "${__dirname}" && ${envVars} nohup node claude-bot.js > /tmp/clawdbot.log 2>&1 &`, { encoding: 'utf8' });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Bot restarted with ${config.activeProvider}` }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  if (url.pathname === '/api/bot/logs') {
    try {
      const logs = fs.existsSync('/tmp/clawdbot.log')
        ? fs.readFileSync('/tmp/clawdbot.log', 'utf8').split('\n').slice(-50).join('\n')
        : 'No logs found';

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ logs }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ logs: 'Error reading logs: ' + e.message }));
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║  🤖 ClawdBot LLM Switcher GUI                    ║
╠══════════════════════════════════════════════════╣
║  Open: http://localhost:${PORT}                    ║
║                                                  ║
║  Providers:                                      ║
║  • Groq (Llama 3.3 70B) - FREE                  ║
║  • Grok (xAI)                                   ║
║  • KIMI K2.5 (NVIDIA) - FREE                    ║
║  • LLaMA 3.1 8B (Radeon Local) - FREE           ║
║  • Claude (CLI) - PAID                          ║
╚══════════════════════════════════════════════════╝
  `);
});
