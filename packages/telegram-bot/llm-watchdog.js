/**
 * LLM Watchdog - Monitor all LLM providers
 *
 * Web dashboard to monitor and test all LLM providers in real-time.
 *
 * Usage: node llm-watchdog.js
 * Open: http://localhost:3457
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3457;
const CHECK_INTERVAL = 30000; // 30 seconds

// Provider configurations
const PROVIDERS = {
  groq: {
    name: 'Groq (Llama 3.3 70B)',
    endpoint: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    apiKeyEnv: 'GROQ_API_KEY',
    protocol: 'https',
    cost: 'FREE',
    rateLimit: '14,400/day'
  },
  grok: {
    name: 'Grok (xAI)',
    endpoint: 'api.x.ai',
    path: '/v1/chat/completions',
    model: 'grok-2-latest',
    apiKeyEnv: 'XAI_API_KEY',
    protocol: 'https',
    cost: 'PAID',
    rateLimit: 'API credits'
  },
  kimi: {
    name: 'KIMI K2.5 (NVIDIA)',
    endpoint: 'integrate.api.nvidia.com',
    path: '/v1/chat/completions',
    model: 'moonshotai/kimi-k2.5',
    apiKeyEnv: 'NVIDIA_API_KEY',
    protocol: 'https',
    cost: 'FREE',
    rateLimit: '40 RPM'
  },
  radeon: {
    name: 'LLaMA 3 8B (Radeon Local)',
    endpoint: 'localhost:8080',
    path: '/v1/chat/completions',
    model: 'llama-3-8b',
    apiKeyEnv: null,
    protocol: 'http',
    cost: 'FREE',
    rateLimit: 'Unlimited'
  }
};

// Status storage
let providerStatus = {};
let lastCheck = null;
let testHistory = [];

// Initialize status
for (const key of Object.keys(PROVIDERS)) {
  providerStatus[key] = {
    status: 'unknown',
    lastCheck: null,
    latency: null,
    error: null,
    lastResponse: null
  };
}

// Test a single provider
async function testProvider(key) {
  const provider = PROVIDERS[key];
  const startTime = Date.now();
  const apiKey = provider.apiKeyEnv ? process.env[provider.apiKeyEnv] : null;

  // Check if API key is configured
  if (provider.apiKeyEnv && !apiKey) {
    return {
      status: 'no-key',
      latency: 0,
      error: `Missing ${provider.apiKeyEnv}`,
      response: null
    };
  }

  const body = JSON.stringify({
    model: provider.model,
    messages: [{ role: 'user', content: 'Say "OK" and nothing else.' }],
    max_tokens: 10,
    temperature: 0
  });

  const [hostname, port] = provider.endpoint.split(':');
  const useHttps = provider.protocol === 'https';
  const httpModule = useHttps ? https : http;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        status: 'timeout',
        latency: 5000,
        error: 'Request timed out (5s)',
        response: null
      });
    }, 5000);

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

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
        clearTimeout(timeout);
        const latency = Date.now() - startTime;

        try {
          const json = JSON.parse(data);

          if (json.error) {
            resolve({
              status: 'error',
              latency: latency,
              error: json.error.message || JSON.stringify(json.error),
              response: null
            });
          } else {
            const content = json.choices?.[0]?.message?.content || '';
            resolve({
              status: 'online',
              latency: latency,
              error: null,
              response: content.substring(0, 100)
            });
          }
        } catch (e) {
          resolve({
            status: 'error',
            latency: latency,
            error: `Parse error: ${data.substring(0, 100)}`,
            response: null
          });
        }
      });
    });

    req.on('error', (e) => {
      clearTimeout(timeout);
      resolve({
        status: 'offline',
        latency: Date.now() - startTime,
        error: e.message,
        response: null
      });
    });

    req.write(body);
    req.end();
  });
}

// Test all providers
async function testAllProviders() {
  console.log(`\n🔍 Testing all providers at ${new Date().toISOString()}`);
  lastCheck = new Date().toISOString();

  const results = {};

  for (const key of Object.keys(PROVIDERS)) {
    const result = await testProvider(key);
    providerStatus[key] = {
      ...result,
      lastCheck: new Date().toISOString()
    };
    results[key] = result;

    const emoji = result.status === 'online' ? '✅' :
                  result.status === 'no-key' ? '🔑' :
                  result.status === 'timeout' ? '⏱️' : '❌';
    console.log(`  ${emoji} ${PROVIDERS[key].name}: ${result.status} (${result.latency}ms)`);
  }

  // Save to history
  testHistory.unshift({
    timestamp: lastCheck,
    results: results
  });

  // Keep only last 100 checks
  if (testHistory.length > 100) {
    testHistory = testHistory.slice(0, 100);
  }

  return results;
}

// HTML Dashboard
const HTML = `<!DOCTYPE html>
<html>
<head>
  <title>LLM Watchdog</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="30">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      background: #0d1117;
      color: #c9d1d9;
      padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; }

    h1 {
      text-align: center;
      margin-bottom: 5px;
      color: #58a6ff;
    }
    .subtitle {
      text-align: center;
      color: #8b949e;
      margin-bottom: 30px;
    }

    .status-bar {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .last-check { color: #8b949e; }
    .actions { display: flex; gap: 10px; }

    button {
      background: #238636;
      border: none;
      color: #fff;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover { background: #2ea043; }
    button.secondary { background: #21262d; border: 1px solid #30363d; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .providers {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .provider-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 20px;
      position: relative;
    }
    .provider-card.online { border-left: 4px solid #238636; }
    .provider-card.offline { border-left: 4px solid #da3633; }
    .provider-card.no-key { border-left: 4px solid #d29922; }
    .provider-card.timeout { border-left: 4px solid #a371f7; }
    .provider-card.unknown { border-left: 4px solid #8b949e; }

    .provider-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .provider-name { font-weight: 600; font-size: 16px; }
    .provider-status {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
    }
    .provider-status.online { background: #238636; color: #fff; }
    .provider-status.offline { background: #da3633; color: #fff; }
    .provider-status.no-key { background: #d29922; color: #000; }
    .provider-status.timeout { background: #a371f7; color: #fff; }
    .provider-status.unknown { background: #8b949e; color: #fff; }
    .provider-status.error { background: #da3633; color: #fff; }

    .provider-details {
      font-size: 13px;
      color: #8b949e;
    }
    .provider-details div { margin: 5px 0; }
    .provider-details strong { color: #c9d1d9; }

    .latency {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 24px;
      font-weight: bold;
      color: #58a6ff;
    }
    .latency small { font-size: 12px; color: #8b949e; }

    .error-msg {
      margin-top: 10px;
      padding: 8px;
      background: rgba(218, 54, 51, 0.1);
      border-radius: 4px;
      font-size: 12px;
      color: #f85149;
      word-break: break-all;
    }

    .response-msg {
      margin-top: 10px;
      padding: 8px;
      background: rgba(35, 134, 54, 0.1);
      border-radius: 4px;
      font-size: 12px;
      color: #3fb950;
    }

    .history {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 20px;
    }
    .history h3 { margin-bottom: 15px; color: #58a6ff; }
    .history-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .history-table th, .history-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #30363d;
    }
    .history-table th { color: #8b949e; font-weight: 500; }

    .env-setup {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 20px;
      margin-top: 20px;
    }
    .env-setup h3 { margin-bottom: 15px; color: #58a6ff; }
    .env-setup pre {
      background: #0d1117;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 13px;
    }
    .env-setup code { color: #79c0ff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 LLM Watchdog</h1>
    <p class="subtitle">Monitoraggio real-time dei provider LLM</p>

    <div class="status-bar">
      <div class="last-check">
        Ultimo check: <span id="lastCheck">-</span>
        <span id="autoRefresh">(auto-refresh 30s)</span>
      </div>
      <div class="actions">
        <button onclick="testAll()">🧪 Test All</button>
        <button class="secondary" onclick="location.reload()">🔄 Refresh</button>
      </div>
    </div>

    <div class="providers" id="providersGrid"></div>

    <div class="history">
      <h3>📊 Cronologia Test</h3>
      <table class="history-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Groq</th>
            <th>Grok</th>
            <th>KIMI</th>
            <th>Radeon</th>
          </tr>
        </thead>
        <tbody id="historyBody"></tbody>
      </table>
    </div>

    <div class="env-setup">
      <h3>⚙️ Setup API Keys</h3>
      <pre><code># Aggiungi al tuo .bashrc o .zshrc:

# Groq (FREE - https://console.groq.com/keys)
export GROQ_API_KEY="gsk_..."

# Grok xAI (https://console.x.ai)
export XAI_API_KEY="xai-..."

# KIMI/NVIDIA (FREE - https://build.nvidia.com)
export NVIDIA_API_KEY="nvapi-..."

# Poi riavvia il watchdog</code></pre>
    </div>
  </div>

  <script>
    let status = null;

    async function loadStatus() {
      const res = await fetch('/api/status');
      status = await res.json();
      renderProviders();
      renderHistory();
    }

    function getStatusEmoji(s) {
      switch(s) {
        case 'online': return '✅';
        case 'offline': return '❌';
        case 'no-key': return '🔑';
        case 'timeout': return '⏱️';
        case 'error': return '⚠️';
        default: return '❓';
      }
    }

    function renderProviders() {
      document.getElementById('lastCheck').textContent = status.lastCheck || 'Mai';

      const grid = document.getElementById('providersGrid');
      grid.innerHTML = '';

      for (const [key, provider] of Object.entries(status.providers)) {
        const ps = status.status[key] || {};
        const card = document.createElement('div');
        card.className = 'provider-card ' + (ps.status || 'unknown');
        card.innerHTML = \`
          <div class="provider-header">
            <div class="provider-name">\${provider.name}</div>
            <div class="provider-status \${ps.status || 'unknown'}">\${ps.status || 'unknown'}</div>
          </div>
          \${ps.latency ? \`<div class="latency">\${ps.latency}<small>ms</small></div>\` : ''}
          <div class="provider-details">
            <div><strong>Costo:</strong> \${provider.cost}</div>
            <div><strong>Limite:</strong> \${provider.rateLimit}</div>
            <div><strong>Ultimo check:</strong> \${ps.lastCheck ? new Date(ps.lastCheck).toLocaleTimeString() : '-'}</div>
          </div>
          \${ps.error ? \`<div class="error-msg">\${ps.error}</div>\` : ''}
          \${ps.response ? \`<div class="response-msg">Response: "\${ps.response}"</div>\` : ''}
        \`;
        grid.appendChild(card);
      }
    }

    function renderHistory() {
      const tbody = document.getElementById('historyBody');
      tbody.innerHTML = '';

      for (const entry of (status.history || []).slice(0, 10)) {
        const row = document.createElement('tr');
        row.innerHTML = \`
          <td>\${new Date(entry.timestamp).toLocaleString()}</td>
          <td>\${getStatusEmoji(entry.results?.groq?.status)}</td>
          <td>\${getStatusEmoji(entry.results?.grok?.status)}</td>
          <td>\${getStatusEmoji(entry.results?.kimi?.status)}</td>
          <td>\${getStatusEmoji(entry.results?.radeon?.status)}</td>
        \`;
        tbody.appendChild(row);
      }
    }

    async function testAll() {
      const btn = event.target;
      btn.disabled = true;
      btn.textContent = 'Testing...';

      await fetch('/api/test-all', { method: 'POST' });
      await loadStatus();

      btn.disabled = false;
      btn.textContent = '🧪 Test All';
    }

    // Initial load
    loadStatus();
  </script>
</body>
</html>`;

// HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  if (url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      providers: PROVIDERS,
      status: providerStatus,
      lastCheck: lastCheck,
      history: testHistory.slice(0, 20)
    }));
    return;
  }

  if (url.pathname === '/api/test-all' && req.method === 'POST') {
    const results = await testAllProviders();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, results }));
    return;
  }

  if (url.pathname.startsWith('/api/test/')) {
    const key = url.pathname.split('/').pop();
    if (PROVIDERS[key]) {
      const result = await testProvider(key);
      providerStatus[key] = { ...result, lastCheck: new Date().toISOString() };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  🔍 LLM Watchdog                                     ║
╠══════════════════════════════════════════════════════╣
║  Dashboard: http://localhost:${PORT}                   ║
║                                                      ║
║  Monitoring:                                         ║
║  • Groq (Llama 3.3 70B) - FREE                      ║
║  • Grok (xAI)                                       ║
║  • KIMI K2.5 (NVIDIA) - FREE                        ║
║  • LLaMA 3 8B (Radeon Local) - FREE                 ║
║                                                      ║
║  Auto-check every ${CHECK_INTERVAL/1000}s                              ║
╚══════════════════════════════════════════════════════╝
  `);

  // Initial test
  testAllProviders();

  // Periodic checks
  setInterval(testAllProviders, CHECK_INTERVAL);
});
