/**
 * Tool Calling Wrapper per TinyGrad/Qwen3 su M1 Locale
 *
 * Rimuove i tools dalle richieste per compatibilità con ClawdBot
 *
 * Porta: 11435 (proxy) → 127.0.0.1:11434 (TinyGrad/Qwen3)
 */

import express from 'express';

const app = express();
const PROXY_PORT = 11435;
const TINYGRAD_URL = 'http://127.0.0.1:11434';

app.use(express.raw({
  type: 'application/json',
  limit: '50mb'
}));

app.use((req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (err) {
      console.error('[M1-WRAPPER] JSON Parse Error:', err.message);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  next();
});

// Proxy /v1/chat/completions senza tools
app.post('/v1/chat/completions', async (req, res) => {
  console.log('[M1-WRAPPER] Received chat completion request');

  const { messages, tools, tool_choice, model, stream, ...rest } = req.body;

  // Rimuovi TUTTI i tools
  console.log(`[M1-WRAPPER] Stripping ${tools?.length || 0} tools from request`);

  try {
    console.log(`[M1-WRAPPER] Forwarding to TinyGrad: model=${model}, messages=${messages?.length}`);

    const response = await fetch(`${TINYGRAD_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'qwen2.5:7b-instruct-q4_K_M',
        messages,
        stream: stream === true,
        ...rest
        // NON include 'tools' e 'tool_choice'
      })
    });

    // Se streaming, proxy diretto
    if (stream === true) {
      // Check response status first
      if (!response.ok) {
        const errText = await response.text();
        console.error('[M1-WRAPPER] TinyGrad stream error:', response.status, errText);
        return res.status(response.status).json({ error: errText });
      }

      console.log('[M1-WRAPPER] Proxying streaming response');
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering if behind proxy
      res.flushHeaders(); // Send headers immediately!

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunkCount = 0;

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log(`[M1-WRAPPER] Stream complete, sent ${chunkCount} chunks`);
            res.end();
            break;
          }
          // Convert Uint8Array to string and write
          const text = decoder.decode(value, { stream: true });
          res.write(text);
          chunkCount++;
          // Log first few chunks for debugging
          if (chunkCount <= 3) {
            console.log(`[M1-WRAPPER] Chunk ${chunkCount}: ${text.substring(0, 80)}...`);
          }
        }
      };
      pump().catch(err => {
        console.error('[M1-WRAPPER] Stream error:', err.message);
        res.end();
      });
      return;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[M1-WRAPPER] TinyGrad error:', response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    console.log(`[M1-WRAPPER] TinyGrad responded: ${data.choices?.[0]?.message?.content?.substring(0, 100)}...`);
    res.json(data);

  } catch (err) {
    console.error('[M1-WRAPPER] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Proxy /v1/models
app.get('/v1/models', async (req, res) => {
  try {
    const response = await fetch(`${TINYGRAD_URL}/v1/models`);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch models' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', proxy_port: PROXY_PORT, target: TINYGRAD_URL });
});

// Fallback
app.use((req, res) => {
  console.log(`[M1-WRAPPER] Unhandled route: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

app.listen(PROXY_PORT, () => {
  console.log(`
🍎 M1 Qwen3 Tool Wrapper v1.0
   Proxy:  http://localhost:${PROXY_PORT}
   Target: ${TINYGRAD_URL}
   Model:  Qwen3-32B via TinyGrad
`);
});
