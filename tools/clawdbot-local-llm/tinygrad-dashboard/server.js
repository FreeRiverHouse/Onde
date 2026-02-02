import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { execSync, spawn } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';

const app = express();
const PORT = 8889;

const CLAWDBOT_CONFIG = join(homedir(), '.clawdbot', 'clawdbot.json');
const TINYGRAD_PATH = '/Users/mattia/Projects/Onde/vendor/tinygrad';
const PYTHON = '/opt/homebrew/bin/python3.11';

let tinygradProcess = null;

app.use(express.json());
app.use(express.static('public'));

// Get Clawdbot config
app.get('/api/config', async (req, res) => {
  try {
    const data = await readFile(CLAWDBOT_CONFIG, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Clawdbot config
app.post('/api/config', async (req, res) => {
  try {
    const config = req.body;
    config.meta = config.meta || {};
    config.meta.lastTouchedAt = new Date().toISOString();
    await writeFile(CLAWDBOT_CONFIG, JSON.stringify(config, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check TinyGrad server status
app.get('/api/tinygrad/status', async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'qwen3', messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 }),
      signal: AbortSignal.timeout(3000)
    });
    res.json({ running: response.ok, port: 11434 });
  } catch (err) {
    res.json({ running: false, error: err.message });
  }
});

// Start TinyGrad server
app.post('/api/tinygrad/start', async (req, res) => {
  const { model = 'qwen3:32b', port = 11434, maxContext = 256 } = req.body;

  if (tinygradProcess) {
    return res.json({ success: false, error: 'Server already running' });
  }

  try {
    // Remove lock file first
    try { execSync('rm -f /tmp/am_remote:0.lock'); } catch {}

    const env = {
      ...process.env,
      PYTHONPATH: TINYGRAD_PATH,
      AMD: '1',
      AMD_LLVM: '1'
    };

    tinygradProcess = spawn(PYTHON, [
      `${TINYGRAD_PATH}/tinygrad/apps/llm_q4.py`,
      '--model', model,
      '--max_context', String(maxContext),
      '--serve', String(port)
    ], { env, cwd: TINYGRAD_PATH });

    tinygradProcess.stdout.on('data', data => console.log(`[TinyGrad] ${data}`));
    tinygradProcess.stderr.on('data', data => console.error(`[TinyGrad] ${data}`));
    tinygradProcess.on('close', code => {
      console.log(`TinyGrad exited with code ${code}`);
      tinygradProcess = null;
    });

    res.json({ success: true, pid: tinygradProcess.pid, model, port });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Stop TinyGrad server
app.post('/api/tinygrad/stop', (req, res) => {
  if (!tinygradProcess) {
    return res.json({ success: false, error: 'Server not running' });
  }
  tinygradProcess.kill();
  tinygradProcess = null;
  res.json({ success: true });
});

// Configure Clawdbot to use TinyGrad
app.post('/api/setup-clawdbot', async (req, res) => {
  try {
    const data = await readFile(CLAWDBOT_CONFIG, 'utf-8');
    const config = JSON.parse(data);

    // Add TinyGrad provider
    config.models = config.models || { mode: 'merge', providers: {} };
    config.models.providers = config.models.providers || {};
    config.models.providers['tinygrad'] = {
      baseUrl: 'http://127.0.0.1:11434/v1',
      apiKey: 'tinygrad',
      api: 'openai-completions',
      models: [{
        id: 'qwen3:32b',
        name: 'Qwen3-32B (TinyGrad Q4)',
        reasoning: true,
        input: ['text'],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 4096,
        maxTokens: 2048
      }]
    };

    // Set as primary model
    config.agents = config.agents || {};
    config.agents.defaults = config.agents.defaults || {};
    config.agents.defaults.model = {
      primary: 'tinygrad/qwen3:32b',
      fallbacks: ['anthropic/claude-opus-4-5']
    };

    config.meta = config.meta || {};
    config.meta.lastTouchedAt = new Date().toISOString();

    await writeFile(CLAWDBOT_CONFIG, JSON.stringify(config, null, 2));
    res.json({ success: true, message: 'Clawdbot configured to use TinyGrad Qwen3!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available models
app.get('/api/models', (req, res) => {
  res.json([
    { id: 'qwen3:32b', name: 'Qwen3-32B', vram: '18.4GB', speed: '~1.5 tok/s', thinking: true },
    { id: 'qwen2.5:32b', name: 'Qwen2.5-32B', vram: '18.5GB', speed: '~2-3 tok/s', thinking: false },
    { id: 'qwen2.5:14b', name: 'Qwen2.5-14B', vram: '8.4GB', speed: '~3 tok/s', thinking: false },
  ]);
});

app.listen(PORT, () => {
  console.log(`\n======================================`);
  console.log(`  TinyGrad Dashboard`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`======================================\n`);
});
