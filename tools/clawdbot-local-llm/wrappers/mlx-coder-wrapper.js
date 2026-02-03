/**
 * Tool Stripping Wrapper per MLX Qwen Coder
 *
 * Adattato da tool-wrapper.js per M4 + MLX
 *
 * Porta: 11435 (proxy) → 8080 (MLX server)
 */

import express from 'express';

const app = express();
const PROXY_PORT = 11435;
const MLX_URL = 'http://127.0.0.1:8080';

// Usa raw body per gestire JSON con caratteri speciali
app.use(express.raw({
  type: 'application/json',
  limit: '50mb'
}));

// Middleware per parsare JSON manualmente con error handling robusto
app.use((req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    try {
      const rawBody = req.body.toString('utf8');
      req.body = JSON.parse(rawBody);
    } catch (err) {
      console.error('[MLX-WRAPPER] JSON Parse Error:', err.message);
      try {
        const rawBody = req.body.toString('utf8');
        const sanitized = rawBody
          .replace(/[\x00-\x1f]/g, ' ')
          .replace(/\\/g, '\\\\')
          .replace(/\\\\"/g, '\\"');
        req.body = JSON.parse(sanitized);
        console.log('[MLX-WRAPPER] JSON parsed after sanitization');
      } catch (err2) {
        console.error('[MLX-WRAPPER] Sanitization failed:', err2.message);
        return res.status(400).json({
          error: 'Invalid JSON',
          details: err.message
        });
      }
    }
  }
  next();
});

// Proxy /v1/models
app.get('/v1/models', async (req, res) => {
  try {
    const response = await fetch(`${MLX_URL}/v1/models`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[MLX-WRAPPER] Models error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Intercetta /v1/chat/completions - STRIP TOOLS
app.post('/v1/chat/completions', async (req, res) => {
  console.log('[MLX-WRAPPER] Received chat completion request');

  const { messages, tools, model, stream, ...rest } = req.body;

  // STRIP TOOLS - MLX/Qwen Coder non li gestisce
  console.log(`[MLX-WRAPPER] Stripping ${tools?.length || 0} tools from request`);

  if (!messages || !model) {
    console.error('[MLX-WRAPPER] Missing required fields');
    return res.status(400).json({ error: 'Missing messages or model' });
  }

  try {
    console.log(`[MLX-WRAPPER] Forwarding to MLX: model=${model}, messages=${messages.length}`);

    // Streaming come M1 wrapper
    const isStreaming = stream === true;
    console.log(`[MLX-WRAPPER] Stream mode: ${isStreaming}`);

    const response = await fetch(`${MLX_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: isStreaming,
        ...rest
        // NO tools passed
      })
    });

    // Streaming response
    if (isStreaming) {
      console.log('[MLX-WRAPPER] Proxying streaming response');
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
        console.error('[MLX-WRAPPER] Stream error:', err.message);
        res.end();
      });
      return;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[MLX-WRAPPER] MLX error:', response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    console.log(`[MLX-WRAPPER] MLX responded: ${data.choices?.[0]?.message?.content?.substring(0, 100)}...`);

    res.json(data);

  } catch (err) {
    console.error('[MLX-WRAPPER] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', proxy_port: PROXY_PORT, target: MLX_URL, type: 'mlx-coder' });
});

// Fallback
app.use((req, res) => {
  console.log(`[MLX-WRAPPER] Unhandled route: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[MLX-WRAPPER] Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PROXY_PORT, () => {
  console.log(`
🔧 MLX Qwen Coder Wrapper v1.0
   Proxy:  http://localhost:${PROXY_PORT}
   Target: ${MLX_URL} (MLX Server)

   Per ClawdBot:
   baseUrl: http://localhost:${PROXY_PORT}/v1
`);
});
