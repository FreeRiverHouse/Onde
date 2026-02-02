import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8888;

const CLAWDBOT_CONFIG = join(homedir(), '.clawdbot', 'clawdbot.json');

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Leggi config ClawdBot
app.get('/api/config', async (req, res) => {
  try {
    const data = await readFile(CLAWDBOT_CONFIG, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Salva config ClawdBot
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

// Discover modelli Ollama
app.get('/api/ollama/models', async (req, res) => {
  const baseUrl = req.query.url || 'http://127.0.0.1:11434';
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    res.json(data.models || []);
  } catch (err) {
    res.status(500).json({ error: `Ollama non raggiungibile: ${err.message}` });
  }
});

// Test connessione provider
app.post('/api/test-provider', async (req, res) => {
  const { baseUrl, apiKey, api } = req.body;
  try {
    let testUrl = baseUrl;
    let headers = {};

    if (api === 'openai-completions' || api === 'openai-responses') {
      testUrl = `${baseUrl}/models`;
      if (apiKey && apiKey !== 'ollama') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
    } else if (api === 'moonshot') {
      testUrl = `${baseUrl}/models`;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(testUrl, {
      headers,
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ success: true, models: data.data || data.models || [] });
    } else {
      res.json({ success: false, error: `HTTP ${response.status}` });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🤖 ClawdBot Config UI`);
  console.log(`   http://localhost:${PORT}\n`);
});
