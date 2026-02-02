/**
 * Tool Calling Wrapper per Radeon/TinyGrad LAN Server
 *
 * Rimuove i tools dalle richieste per compatibilità con ClawdBot
 *
 * Porta: 11436 (proxy) → 192.168.1.111:11434 (Radeon)
 */

import express from 'express';

const app = express();
const PROXY_PORT = 11436;
const RADEON_URL = 'http://192.168.1.111:11434';

app.use(express.raw({
  type: 'application/json',
  limit: '50mb'
}));

app.use((req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (err) {
      console.error('[RADEON-WRAPPER] JSON Parse Error:', err.message);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  next();
});

// Proxy /v1/chat/completions senza tools
app.post('/v1/chat/completions', async (req, res) => {
  console.log('[RADEON-WRAPPER] Received chat completion request');

  const { messages, tools, model, stream, ...rest } = req.body;

  // Rimuovi TUTTI i tools
  console.log(`[RADEON-WRAPPER] Stripping ${tools?.length || 0} tools from request`);

  try {
    console.log(`[RADEON-WRAPPER] Forwarding to Radeon: model=${model}, messages=${messages?.length}`);

    const response = await fetch(`${RADEON_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'qwen2.5:7b',
        messages,
        stream: stream === true,
        ...rest
      })
    });

    // Se streaming, proxy diretto
    if (stream === true) {
      console.log('[RADEON-WRAPPER] Proxying streaming response');
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(value);
        }
      };
      pump().catch(err => {
        console.error('[RADEON-WRAPPER] Stream error:', err.message);
        res.end();
      });
      return;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[RADEON-WRAPPER] Radeon error:', response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    console.log(`[RADEON-WRAPPER] Radeon responded: ${data.choices?.[0]?.message?.content?.substring(0, 100)}...`);
    res.json(data);

  } catch (err) {
    console.error('[RADEON-WRAPPER] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', proxy_port: PROXY_PORT, target: RADEON_URL });
});

// Fallback
app.use((req, res) => {
  console.log(`[RADEON-WRAPPER] Unhandled route: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

app.listen(PROXY_PORT, () => {
  console.log(`
🎮 Radeon Tool Wrapper v1.0
   Proxy:  http://localhost:${PROXY_PORT}
   Target: ${RADEON_URL}
   GPU:    AMD Radeon RX 7900 XT
`);
});
