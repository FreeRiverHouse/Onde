/**
 * LLM Watchdog - Monitor all LLM providers with quota tracking
 *
 * Features:
 * - Real-time provider status
 * - Token/request quota tracking via API headers
 * - Usage bars visualization
 * - Load balancing recommendations
 *
 * Usage: node llm-watchdog.js
 * Open: http://localhost:3457
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Handover system for context switching
const handover = require('./handover');

const PORT = 3457;
const CHECK_INTERVAL = 30000; // 30 seconds
const QUOTA_FILE = path.join(__dirname, 'quota-tracking.json');

// Provider configurations with quota info
const PROVIDERS = {
  groq: {
    name: 'Groq (Llama 3.3 70B)',
    endpoint: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    apiKeyEnv: 'GROQ_API_KEY',
    protocol: 'https',
    cost: 'FREE',
    tier: 'free',
    // Free tier limits
    limits: {
      requests_per_day: 14400,
      requests_per_minute: 30,
      tokens_per_minute: 6000,
      tokens_per_day: 500000
    },
    priority: 1  // Highest priority (free + fast)
  },
  kimi: {
    name: 'KIMI K2.5 (NVIDIA)',
    endpoint: 'integrate.api.nvidia.com',
    path: '/v1/chat/completions',
    model: 'moonshotai/kimi-k2.5',
    apiKeyEnv: 'NVIDIA_API_KEY',
    protocol: 'https',
    cost: 'FREE',
    tier: 'free',
    limits: {
      requests_per_minute: 40,
      requests_per_day: 1000
    },
    priority: 2
  },
  grok: {
    name: 'Grok (xAI)',
    endpoint: 'api.x.ai',
    path: '/v1/chat/completions',
    model: 'grok-2-latest',
    apiKeyEnv: 'XAI_API_KEY',
    protocol: 'https',
    cost: 'PAID',
    tier: 'paid',
    limits: {
      requests_per_minute: 60,
      tokens_per_minute: 100000
    },
    priority: 3
  },
  radeon: {
    name: 'LLaMA 3 8B (Radeon)',
    endpoint: 'localhost:8080',
    path: '/v1/chat/completions',
    model: 'llama-3-8b',
    apiKeyEnv: null,
    protocol: 'http',
    cost: 'FREE',
    tier: 'local',
    limits: {
      requests_per_minute: 999999,
      tokens_per_minute: 999999
    },
    priority: 0  // Local = always preferred when online
  }
};

// Status and quota storage
let providerStatus = {};
let quotaUsage = {};
let lastCheck = null;
let testHistory = [];
let currentActiveProvider = 'groq'; // Track current active provider for handover

// Initialize
function initializeStatus() {
  for (const key of Object.keys(PROVIDERS)) {
    providerStatus[key] = {
      status: 'unknown',
      lastCheck: null,
      latency: null,
      error: null,
      response: null,
      headers: {}
    };
    quotaUsage[key] = {
      requests_used: 0,
      requests_remaining: null,
      tokens_used: 0,
      tokens_remaining: null,
      reset_at: null,
      last_updated: null
    };
  }
  loadQuotaFromFile();
}

// Load/save quota tracking
function loadQuotaFromFile() {
  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf8'));
      quotaUsage = { ...quotaUsage, ...data.quotaUsage };
      // Reset if new day
      const today = new Date().toDateString();
      if (data.date !== today) {
        for (const key of Object.keys(quotaUsage)) {
          quotaUsage[key].requests_used = 0;
          quotaUsage[key].tokens_used = 0;
        }
      }
    }
  } catch (e) {
    console.error('Error loading quota file:', e.message);
  }
}

function saveQuotaToFile() {
  try {
    fs.writeFileSync(QUOTA_FILE, JSON.stringify({
      date: new Date().toDateString(),
      quotaUsage: quotaUsage,
      lastUpdate: new Date().toISOString()
    }, null, 2));
  } catch (e) {
    console.error('Error saving quota file:', e.message);
  }
}

// Parse rate limit headers from response
function parseRateLimitHeaders(headers, key) {
  const quota = quotaUsage[key];

  // Groq headers
  if (headers['x-ratelimit-remaining-requests']) {
    quota.requests_remaining = parseInt(headers['x-ratelimit-remaining-requests']);
  }
  if (headers['x-ratelimit-remaining-tokens']) {
    quota.tokens_remaining = parseInt(headers['x-ratelimit-remaining-tokens']);
  }
  if (headers['x-ratelimit-reset-requests']) {
    quota.reset_at = headers['x-ratelimit-reset-requests'];
  }

  // xAI headers
  if (headers['x-ratelimit-remaining']) {
    quota.requests_remaining = parseInt(headers['x-ratelimit-remaining']);
  }

  // Calculate used from remaining
  const provider = PROVIDERS[key];
  if (quota.requests_remaining !== null && provider.limits.requests_per_day) {
    quota.requests_used = provider.limits.requests_per_day - quota.requests_remaining;
  }
  if (quota.requests_remaining !== null && provider.limits.requests_per_minute) {
    // For per-minute limits, estimate daily usage
    quota.requests_used = Math.max(quota.requests_used,
      provider.limits.requests_per_minute - quota.requests_remaining);
  }

  quota.last_updated = new Date().toISOString();
  saveQuotaToFile();
}

// Test a single provider and track quota
async function testProvider(key) {
  const provider = PROVIDERS[key];
  const startTime = Date.now();
  const apiKey = provider.apiKeyEnv ? process.env[provider.apiKeyEnv] : null;

  if (provider.apiKeyEnv && !apiKey) {
    return {
      status: 'no-key',
      latency: 0,
      error: `Missing ${provider.apiKeyEnv}`,
      response: null,
      headers: {}
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
        response: null,
        headers: {}
      });
    }, 5000);

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const req = httpModule.request({
      hostname,
      port: port || (useHttps ? 443 : 80),
      path: provider.path,
      method: 'POST',
      headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        const latency = Date.now() - startTime;

        // Parse and store rate limit headers
        const responseHeaders = {};
        for (const [k, v] of Object.entries(res.headers)) {
          if (k.toLowerCase().includes('ratelimit') || k.toLowerCase().includes('quota')) {
            responseHeaders[k.toLowerCase()] = v;
          }
        }
        parseRateLimitHeaders(responseHeaders, key);

        // Track this request
        quotaUsage[key].requests_used++;
        quotaUsage[key].tokens_used += 20; // Estimate
        saveQuotaToFile();

        try {
          const json = JSON.parse(data);
          if (json.error) {
            resolve({
              status: 'error',
              latency,
              error: json.error.message || JSON.stringify(json.error),
              response: null,
              headers: responseHeaders
            });
          } else {
            resolve({
              status: 'online',
              latency,
              error: null,
              response: json.choices?.[0]?.message?.content?.substring(0, 100) || '',
              headers: responseHeaders
            });
          }
        } catch (e) {
          resolve({
            status: 'error',
            latency,
            error: `Parse error: ${data.substring(0, 100)}`,
            response: null,
            headers: responseHeaders
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
        response: null,
        headers: {}
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
    providerStatus[key] = { ...result, lastCheck: new Date().toISOString() };
    results[key] = result;

    const emoji = result.status === 'online' ? '✅' :
                  result.status === 'no-key' ? '🔑' :
                  result.status === 'timeout' ? '⏱️' : '❌';
    console.log(`  ${emoji} ${PROVIDERS[key].name}: ${result.status} (${result.latency}ms)`);
  }

  testHistory.unshift({ timestamp: lastCheck, results });
  if (testHistory.length > 100) testHistory = testHistory.slice(0, 100);

  return results;
}

// Get best provider for load balancing
function getBestProvider() {
  const available = [];

  for (const [key, provider] of Object.entries(PROVIDERS)) {
    const status = providerStatus[key];
    const quota = quotaUsage[key];

    if (status.status !== 'online') continue;

    // Calculate remaining capacity percentage
    let capacityPercent = 100;
    if (provider.limits.requests_per_day && quota.requests_remaining !== null) {
      capacityPercent = (quota.requests_remaining / provider.limits.requests_per_day) * 100;
    } else if (provider.limits.requests_per_day) {
      capacityPercent = ((provider.limits.requests_per_day - quota.requests_used) / provider.limits.requests_per_day) * 100;
    }

    available.push({
      key,
      name: provider.name,
      priority: provider.priority,
      capacity: capacityPercent,
      latency: status.latency,
      tier: provider.tier
    });
  }

  // Sort by: local first, then by capacity, then by priority
  available.sort((a, b) => {
    if (a.tier === 'local' && b.tier !== 'local') return -1;
    if (b.tier === 'local' && a.tier !== 'local') return 1;
    if (a.capacity > 20 && b.capacity <= 20) return -1;
    if (b.capacity > 20 && a.capacity <= 20) return 1;
    return a.priority - b.priority;
  });

  return available[0] || null;
}

// Calculate usage percentage for display
function getUsagePercent(key) {
  const provider = PROVIDERS[key];
  const quota = quotaUsage[key];

  if (quota.requests_remaining !== null) {
    const total = provider.limits.requests_per_day || provider.limits.requests_per_minute * 60 * 24;
    return Math.round(((total - quota.requests_remaining) / total) * 100);
  }

  if (provider.limits.requests_per_day) {
    return Math.round((quota.requests_used / provider.limits.requests_per_day) * 100);
  }

  return 0;
}

// HTML Dashboard with quota bars
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
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 5px; color: #58a6ff; }
    .subtitle { text-align: center; color: #8b949e; margin-bottom: 20px; }

    .recommendation {
      background: linear-gradient(135deg, #238636 0%, #2ea043 100%);
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .recommendation .icon { font-size: 32px; }
    .recommendation .text { flex: 1; }
    .recommendation .provider-name { font-size: 18px; font-weight: bold; }
    .recommendation .reason { font-size: 13px; opacity: 0.9; }

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

    .providers {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .provider-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 20px;
      position: relative;
    }
    .provider-card.online { border-left: 4px solid #238636; }
    .provider-card.offline { border-left: 4px solid #da3633; }
    .provider-card.no-key { border-left: 4px solid #d29922; }
    .provider-card.recommended {
      border: 2px solid #238636;
      box-shadow: 0 0 20px rgba(35, 134, 54, 0.3);
    }

    .provider-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .provider-name { font-weight: 600; font-size: 15px; }
    .provider-status {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
    }
    .provider-status.online { background: #238636; }
    .provider-status.offline { background: #da3633; }
    .provider-status.no-key { background: #d29922; color: #000; }

    .latency-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      font-size: 20px;
      font-weight: bold;
      color: #58a6ff;
    }
    .latency-badge small { font-size: 11px; color: #8b949e; }

    .quota-section {
      margin: 15px 0;
      padding: 12px;
      background: #0d1117;
      border-radius: 6px;
    }
    .quota-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }
    .quota-bar {
      height: 8px;
      background: #30363d;
      border-radius: 4px;
      overflow: hidden;
    }
    .quota-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .quota-fill.low { background: #238636; }
    .quota-fill.medium { background: #d29922; }
    .quota-fill.high { background: #da3633; }
    .quota-fill.unlimited { background: #58a6ff; width: 5% !important; }

    .quota-details {
      margin-top: 8px;
      font-size: 11px;
      color: #8b949e;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
    }

    .provider-meta {
      font-size: 12px;
      color: #8b949e;
      margin-top: 10px;
    }
    .provider-meta span {
      display: inline-block;
      margin-right: 12px;
    }
    .tier-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .tier-badge.free { background: #238636; }
    .tier-badge.paid { background: #a371f7; }
    .tier-badge.local { background: #58a6ff; }

    .error-msg {
      margin-top: 10px;
      padding: 8px;
      background: rgba(218, 54, 51, 0.1);
      border-radius: 4px;
      font-size: 11px;
      color: #f85149;
    }

    .history {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 20px;
      margin-top: 20px;
    }
    .history h3 { margin-bottom: 15px; color: #58a6ff; }
    .history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 4px;
    }
    .history-cell {
      height: 24px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    .history-cell.online { background: #238636; }
    .history-cell.offline { background: #da3633; }
    .history-cell.no-key { background: #d29922; }
    .history-cell.unknown { background: #30363d; }

    .load-balance-info {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 20px;
      margin-top: 20px;
    }
    .load-balance-info h3 { margin-bottom: 15px; color: #58a6ff; }
    .lb-order {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .lb-item {
      background: #0d1117;
      padding: 10px 15px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .lb-rank {
      width: 24px;
      height: 24px;
      background: #30363d;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    .lb-item:first-child .lb-rank { background: #238636; }

    /* Handover section styles */
    .handover-section {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 20px;
      margin-top: 20px;
    }
    .handover-section h3 { margin-bottom: 15px; color: #f0883e; }
    .handover-current {
      background: #0d1117;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    .handover-current .label { color: #8b949e; font-size: 12px; margin-bottom: 5px; }
    .handover-current .value { font-size: 16px; font-weight: 600; }
    .handover-inputs {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      margin-bottom: 15px;
    }
    .handover-inputs input, .handover-inputs textarea {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 10px;
      color: #c9d1d9;
      font-family: inherit;
    }
    .handover-inputs textarea {
      grid-column: 1 / -1;
      min-height: 60px;
      resize: vertical;
    }
    .handover-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    button.handover { background: #f0883e; }
    button.handover:hover { background: #e4761b; }
    .handover-preview {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 15px;
      margin-top: 15px;
      max-height: 400px;
      overflow-y: auto;
      font-size: 13px;
      white-space: pre-wrap;
      font-family: monospace;
      display: none;
    }
    .handover-preview.visible { display: block; }
    .git-info {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 15px;
    }
    .git-card {
      background: #0d1117;
      padding: 12px;
      border-radius: 6px;
    }
    .git-card .label { color: #8b949e; font-size: 11px; margin-bottom: 4px; }
    .git-card .value { font-size: 13px; word-break: break-all; }
    .git-card .commits { font-size: 11px; margin-top: 8px; color: #8b949e; }
    .git-card .commits div { margin: 2px 0; }
    .switch-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .switch-modal.visible { display: flex; }
    .switch-modal-content {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 25px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .switch-modal h3 { margin-bottom: 15px; color: #f0883e; }
    .switch-select {
      display: grid;
      gap: 10px;
      margin: 15px 0;
    }
    .switch-option {
      background: #0d1117;
      border: 2px solid #30363d;
      border-radius: 6px;
      padding: 15px;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .switch-option:hover { border-color: #58a6ff; }
    .switch-option.selected { border-color: #238636; background: rgba(35,134,54,0.1); }
    .switch-option.current { opacity: 0.5; cursor: not-allowed; }
    .switch-option .name { font-weight: 600; margin-bottom: 5px; }
    .switch-option .status { font-size: 12px; color: #8b949e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 LLM Watchdog</h1>
    <p class="subtitle">Monitoraggio real-time con tracking quota</p>

    <div class="recommendation" id="recommendation" style="display:none;">
      <div class="icon">🎯</div>
      <div class="text">
        <div class="provider-name" id="recProvider">-</div>
        <div class="reason" id="recReason">-</div>
      </div>
    </div>

    <div class="status-bar">
      <div class="last-check">
        Ultimo check: <span id="lastCheck">-</span>
      </div>
      <div class="actions">
        <button onclick="testAll()">🧪 Test All</button>
        <button class="secondary" onclick="resetQuotas()">🔄 Reset Quotas</button>
        <button class="secondary" onclick="location.reload()">↻ Refresh</button>
      </div>
    </div>

    <div class="providers" id="providersGrid"></div>

    <div class="load-balance-info">
      <h3>⚖️ Load Balancing Order</h3>
      <div class="lb-order" id="lbOrder"></div>
    </div>

    <div class="history">
      <h3>📊 Uptime (ultimi 20 check)</h3>
      <div id="historySection"></div>
    </div>

    <div class="handover-section">
      <h3>🔄 LLM Handover System</h3>
      <div class="handover-current">
        <div class="label">Provider Attivo</div>
        <div class="value" id="currentProvider">-</div>
      </div>

      <div class="handover-inputs">
        <input type="text" id="taskInput" placeholder="Task corrente (es: 'Fix bug in auth module')">
        <button onclick="setTask()">💾 Salva Task</button>
        <textarea id="noteInput" placeholder="Aggiungi nota per il prossimo LLM..."></textarea>
        <button onclick="addNote()">📝 Aggiungi Nota</button>
      </div>

      <div class="handover-actions">
        <button class="handover" onclick="showSwitchModal()">🔀 Switch Provider con Handover</button>
        <button class="secondary" onclick="previewHandover()">👁️ Preview Handover</button>
        <button class="secondary" onclick="downloadHandover()">⬇️ Download MD</button>
        <button class="secondary" onclick="loadContext()">🔄 Refresh Context</button>
      </div>

      <div class="git-info" id="gitInfo"></div>
      <div class="handover-preview" id="handoverPreview"></div>
    </div>

    <!-- Switch Modal -->
    <div class="switch-modal" id="switchModal">
      <div class="switch-modal-content">
        <h3>🔀 Switch LLM Provider</h3>
        <p style="color:#8b949e;margin-bottom:15px;">Seleziona il nuovo provider. Verrà generato un handover automatico.</p>
        <div class="switch-select" id="switchSelect"></div>
        <div style="display:flex;gap:10px;margin-top:20px;">
          <button class="handover" id="confirmSwitch" onclick="confirmSwitch()">✅ Conferma Switch</button>
          <button class="secondary" onclick="closeSwitchModal()">❌ Annulla</button>
        </div>
        <div class="handover-preview visible" id="switchPreview" style="margin-top:15px;max-height:200px;"></div>
      </div>
    </div>
  </div>

  <script>
    let data = null;

    async function loadData() {
      const res = await fetch('/api/status');
      data = await res.json();
      render();
    }

    function getQuotaColor(percent) {
      if (percent < 50) return 'low';
      if (percent < 80) return 'medium';
      return 'high';
    }

    function render() {
      document.getElementById('lastCheck').textContent =
        data.lastCheck ? new Date(data.lastCheck).toLocaleString() : 'Mai';

      // Recommendation
      if (data.bestProvider) {
        document.getElementById('recommendation').style.display = 'flex';
        document.getElementById('recProvider').textContent =
          'Usa: ' + data.bestProvider.name;
        document.getElementById('recReason').textContent =
          data.bestProvider.tier === 'local' ? 'Server locale disponibile - velocità massima' :
          'Capacità: ' + Math.round(data.bestProvider.capacity) + '% - Latenza: ' + data.bestProvider.latency + 'ms';
      }

      // Providers grid
      const grid = document.getElementById('providersGrid');
      grid.innerHTML = '';

      for (const [key, provider] of Object.entries(data.providers)) {
        const status = data.status[key] || {};
        const quota = data.quotaUsage[key] || {};
        const usagePercent = data.usagePercents[key] || 0;
        const isRecommended = data.bestProvider?.key === key;

        const card = document.createElement('div');
        card.className = 'provider-card ' + (status.status || 'unknown') +
                         (isRecommended ? ' recommended' : '');

        const isUnlimited = provider.tier === 'local';

        card.innerHTML = \`
          <div class="provider-header">
            <div class="provider-name">\${provider.name}</div>
            <div class="provider-status \${status.status || 'unknown'}">\${status.status || '?'}</div>
          </div>
          \${status.latency ? \`<div class="latency-badge">\${status.latency}<small>ms</small></div>\` : ''}

          <div class="quota-section">
            <div class="quota-header">
              <span>Utilizzo quota</span>
              <span>\${isUnlimited ? '∞ Unlimited' : usagePercent + '%'}</span>
            </div>
            <div class="quota-bar">
              <div class="quota-fill \${isUnlimited ? 'unlimited' : getQuotaColor(usagePercent)}"
                   style="width: \${isUnlimited ? 5 : usagePercent}%"></div>
            </div>
            <div class="quota-details">
              <span>Richieste: \${quota.requests_used || 0}</span>
              <span>Rimanenti: \${quota.requests_remaining ?? 'N/A'}</span>
              <span>Token usati: ~\${quota.tokens_used || 0}</span>
              <span>Reset: \${quota.reset_at || 'daily'}</span>
            </div>
          </div>

          <div class="provider-meta">
            <span class="tier-badge \${provider.tier}">\${provider.tier.toUpperCase()}</span>
            <span>Limite: \${provider.limits?.requests_per_day ? provider.limits.requests_per_day + '/day' :
                          provider.limits?.requests_per_minute ? provider.limits.requests_per_minute + '/min' : '∞'}</span>
          </div>

          \${status.error ? \`<div class="error-msg">\${status.error}</div>\` : ''}
        \`;
        grid.appendChild(card);
      }

      // Load balance order
      const lbOrder = document.getElementById('lbOrder');
      lbOrder.innerHTML = '';
      (data.loadBalanceOrder || []).forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'lb-item';
        item.innerHTML = \`
          <div class="lb-rank">\${i + 1}</div>
          <div>\${p.name}</div>
          <div style="color:#8b949e;font-size:11px;">\${Math.round(p.capacity)}%</div>
        \`;
        lbOrder.appendChild(item);
      });

      // History
      const historySection = document.getElementById('historySection');
      historySection.innerHTML = '';

      for (const key of Object.keys(data.providers)) {
        const row = document.createElement('div');
        row.style.marginBottom = '10px';
        row.innerHTML = \`<div style="font-size:12px;margin-bottom:4px;color:#8b949e;">\${data.providers[key].name}</div>\`;

        const cells = document.createElement('div');
        cells.className = 'history-grid';

        for (const entry of (data.history || []).slice(0, 20)) {
          const cell = document.createElement('div');
          cell.className = 'history-cell ' + (entry.results?.[key]?.status || 'unknown');
          cell.title = new Date(entry.timestamp).toLocaleString();
          cells.appendChild(cell);
        }
        row.appendChild(cells);
        historySection.appendChild(row);
      }
    }

    async function testAll() {
      event.target.disabled = true;
      event.target.textContent = 'Testing...';
      await fetch('/api/test-all', { method: 'POST' });
      await loadData();
      event.target.disabled = false;
      event.target.textContent = '🧪 Test All';
    }

    async function resetQuotas() {
      await fetch('/api/reset-quotas', { method: 'POST' });
      await loadData();
    }

    loadData();
    setInterval(loadData, 10000);

    // Handover functions
    let selectedProvider = null;
    let currentProvider = 'groq';

    async function loadContext() {
      try {
        const res = await fetch('/api/handover/context');
        const data = await res.json();
        renderGitInfo(data.git);

        // Update current provider
        const provRes = await fetch('/api/current-provider');
        const provData = await provRes.json();
        currentProvider = provData.provider;
        document.getElementById('currentProvider').textContent =
          (data.providers?.[currentProvider]?.name || currentProvider.toUpperCase());
      } catch (e) {
        console.error('Error loading context:', e);
      }
    }

    function renderGitInfo(git) {
      const container = document.getElementById('gitInfo');
      container.innerHTML = \`
        <div class="git-card">
          <div class="label">Branch</div>
          <div class="value">\${git.branch || 'unknown'}</div>
        </div>
        <div class="git-card">
          <div class="label">Remote</div>
          <div class="value">\${git.remote || 'N/A'}</div>
        </div>
        <div class="git-card">
          <div class="label">File Modificati</div>
          <div class="value">\${git.modified?.length || 0} files</div>
        </div>
        <div class="git-card">
          <div class="label">Commit Recenti</div>
          <div class="commits">
            \${(git.commits || []).slice(0, 3).map(c => '<div>• ' + c + '</div>').join('')}
          </div>
        </div>
      \`;
    }

    async function setTask() {
      const task = document.getElementById('taskInput').value.trim();
      if (!task) return alert('Inserisci un task');

      await fetch('/api/handover/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      document.getElementById('taskInput').value = '';
      alert('Task salvato!');
    }

    async function addNote() {
      const note = document.getElementById('noteInput').value.trim();
      if (!note) return alert('Inserisci una nota');

      await fetch('/api/handover/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      document.getElementById('noteInput').value = '';
      alert('Nota aggiunta!');
    }

    async function previewHandover() {
      const preview = document.getElementById('handoverPreview');
      const res = await fetch('/api/handover/markdown');
      const md = await res.text();
      preview.textContent = md;
      preview.classList.toggle('visible');
    }

    async function downloadHandover() {
      const res = await fetch('/api/handover/markdown');
      const md = await res.text();
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'handover-' + new Date().toISOString().replace(/[:.]/g, '-') + '.md';
      a.click();
      URL.revokeObjectURL(url);
    }

    function showSwitchModal() {
      const modal = document.getElementById('switchModal');
      const select = document.getElementById('switchSelect');
      selectedProvider = null;

      select.innerHTML = '';
      for (const [key, provider] of Object.entries(data.providers)) {
        const status = data.status[key] || {};
        const isCurrent = key === currentProvider;
        const isOnline = status.status === 'online';

        const option = document.createElement('div');
        option.className = 'switch-option' + (isCurrent ? ' current' : '') + (!isOnline ? ' current' : '');
        option.innerHTML = \`
          <div class="name">\${provider.name} \${isCurrent ? '(attuale)' : ''}</div>
          <div class="status">\${status.status || 'unknown'} - \${provider.tier}</div>
        \`;

        if (!isCurrent && isOnline) {
          option.onclick = () => selectProvider(key, option);
        }

        select.appendChild(option);
      }

      modal.classList.add('visible');
      document.getElementById('switchPreview').textContent = 'Seleziona un provider per vedere il preview...';
    }

    function selectProvider(key, element) {
      document.querySelectorAll('.switch-option').forEach(el => el.classList.remove('selected'));
      element.classList.add('selected');
      selectedProvider = key;

      // Load preview
      fetch('/api/handover/compact?to=' + key)
        .then(r => r.json())
        .then(compact => {
          document.getElementById('switchPreview').textContent = JSON.stringify(compact, null, 2);
        });
    }

    function closeSwitchModal() {
      document.getElementById('switchModal').classList.remove('visible');
    }

    async function confirmSwitch() {
      if (!selectedProvider) return alert('Seleziona un provider');

      const res = await fetch('/api/switch-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedProvider, generateHandover: true })
      });

      const result = await res.json();
      if (result.success) {
        currentProvider = selectedProvider;
        alert('Switch completato! Da ' + result.from + ' a ' + result.to + '\\n\\nHandover salvato.');
        closeSwitchModal();
        loadContext();
        loadData();
      } else {
        alert('Errore: ' + result.error);
      }
    }

    // Load context on startup
    loadContext();
  </script>
</body>
</html>`;

// HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  if (url.pathname === '/api/status') {
    const best = getBestProvider();
    const usagePercents = {};
    const loadBalanceOrder = [];

    for (const key of Object.keys(PROVIDERS)) {
      usagePercents[key] = getUsagePercent(key);
      if (providerStatus[key].status === 'online') {
        loadBalanceOrder.push({
          key,
          name: PROVIDERS[key].name,
          capacity: 100 - usagePercents[key],
          priority: PROVIDERS[key].priority,
          tier: PROVIDERS[key].tier
        });
      }
    }

    loadBalanceOrder.sort((a, b) => {
      if (a.tier === 'local') return -1;
      if (b.tier === 'local') return 1;
      if (a.capacity > 20 && b.capacity <= 20) return -1;
      if (b.capacity > 20 && a.capacity <= 20) return 1;
      return a.priority - b.priority;
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      providers: PROVIDERS,
      status: providerStatus,
      quotaUsage: quotaUsage,
      usagePercents,
      loadBalanceOrder,
      bestProvider: best,
      lastCheck,
      history: testHistory.slice(0, 20)
    }));
    return;
  }

  if (url.pathname === '/api/test-all' && req.method === 'POST') {
    await testAllProviders();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  if (url.pathname === '/api/reset-quotas' && req.method === 'POST') {
    for (const key of Object.keys(quotaUsage)) {
      quotaUsage[key] = {
        requests_used: 0,
        requests_remaining: null,
        tokens_used: 0,
        tokens_remaining: null,
        reset_at: null,
        last_updated: new Date().toISOString()
      };
    }
    saveQuotaToFile();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  if (url.pathname === '/api/best-provider') {
    const best = getBestProvider();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(best));
    return;
  }

  // Handover API endpoints
  if (url.pathname === '/api/handover') {
    const fromProvider = currentActiveProvider;
    const toProvider = url.searchParams.get('to') || 'unknown';
    const h = handover.generateHandover(fromProvider, toProvider);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(h));
    return;
  }

  if (url.pathname === '/api/handover/markdown') {
    const fromProvider = currentActiveProvider;
    const toProvider = url.searchParams.get('to') || 'unknown';
    const md = handover.generateHandoverMarkdown(fromProvider, toProvider);
    res.writeHead(200, { 'Content-Type': 'text/markdown' });
    res.end(md);
    return;
  }

  if (url.pathname === '/api/handover/compact') {
    const fromProvider = currentActiveProvider;
    const toProvider = url.searchParams.get('to') || 'unknown';
    const compact = handover.getCompactHandover(fromProvider, toProvider);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(compact));
    return;
  }

  if (url.pathname === '/api/handover/context' && req.method === 'GET') {
    handover.loadContext();
    const git = handover.getRecentGitActivity();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ context: handover.loadContext(), git }));
    return;
  }

  if (url.pathname === '/api/handover/task' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { task } = JSON.parse(body);
        handover.setCurrentTask(task);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/handover/note' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { note } = JSON.parse(body);
        handover.addNote(note);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/handover/file' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { path: filePath, description } = JSON.parse(body);
        handover.addWorkingFile(filePath, description);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/switch-provider' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { to, generateHandover: doHandover } = JSON.parse(body);
        const fromProvider = currentActiveProvider;
        let handoverData = null;

        if (doHandover) {
          handoverData = handover.generateHandover(fromProvider, to);
          handover.saveHandoverFile(fromProvider, to);
        }

        currentActiveProvider = to;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          from: fromProvider,
          to: to,
          handover: handoverData
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/current-provider') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ provider: currentActiveProvider }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// Initialize and start
initializeStatus();
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🔍 LLM Watchdog v3 - Quota Tracking + Handover           ║
╠═══════════════════════════════════════════════════════════╣
║  Dashboard: http://localhost:${PORT}                        ║
║                                                           ║
║  Features:                                                ║
║  • Quota tracking via API headers                         ║
║  • Usage bars per provider                                ║
║  • Load balancing recommendations                         ║
║  • LLM Handover system for context switching              ║
║  • Auto-refresh ogni 30s                                  ║
║                                                           ║
║  API Endpoints:                                           ║
║  • GET  /api/status          - Full status + quotas       ║
║  • GET  /api/best-provider   - Get recommended provider   ║
║  • POST /api/test-all        - Test all providers         ║
║  • POST /api/reset-quotas    - Reset daily counters       ║
║  • GET  /api/handover        - Generate handover JSON     ║
║  • GET  /api/handover/markdown - Handover as markdown     ║
║  • POST /api/switch-provider - Switch with handover       ║
╚═══════════════════════════════════════════════════════════╝
  `);
  testAllProviders();
  setInterval(testAllProviders, CHECK_INTERVAL);
});
