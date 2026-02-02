/**
 * Tool Calling Wrapper per Ollama/TinyGrad
 *
 * Trasforma le risposte JSON nel content in proper tool_calls
 * per compatibilità con ClawdBot
 *
 * Porta: 11435 (proxy) → 11434 (Ollama)
 */

import express from 'express';

const app = express();
const PROXY_PORT = 11435;
const OLLAMA_URL = 'http://127.0.0.1:11434';

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
      console.error('[WRAPPER] JSON Parse Error:', err.message);
      // Prova a sanitizzare il body
      try {
        const rawBody = req.body.toString('utf8');
        // Rimuovi caratteri problematici
        const sanitized = rawBody
          .replace(/[\x00-\x1f]/g, ' ')  // Rimuovi control chars
          .replace(/\\/g, '\\\\')         // Escape backslashes
          .replace(/\\\\"/g, '\\"');      // Fix double-escaped quotes
        req.body = JSON.parse(sanitized);
        console.log('[WRAPPER] JSON parsed after sanitization');
      } catch (err2) {
        console.error('[WRAPPER] Sanitization failed:', err2.message);
        console.error('[WRAPPER] Body preview:', req.body.toString('utf8').substring(0, 500));
        return res.status(400).json({
          error: 'Invalid JSON',
          details: err.message
        });
      }
    }
  }
  next();
});

// Proxy tutte le richieste non-chat direttamente
app.all('/api/*', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}${req.path}`, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[WRAPPER] API proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Intercetta /v1/chat/completions per tool calling
app.post('/v1/chat/completions', async (req, res) => {
  console.log('[WRAPPER] Received chat completion request');

  const { messages, tools, model, stream, ...rest } = req.body;

  // IMPORTANTE: Rimuovi TUTTI i tools dalla richiesta per Ollama
  // Ollama non sa usare i tools correttamente e continua a chiamarli
  console.log(`[WRAPPER] Stripping ${tools?.length || 0} tools from request`);

  if (!messages || !model) {
    console.error('[WRAPPER] Missing required fields');
    return res.status(400).json({ error: 'Missing messages or model' });
  }

  let modifiedMessages = [...messages];

  // NON iniettare tools nel prompt - Ollama non li gestisce bene
  // Skip completamente la logica dei tools
  if (false && tools && tools.length > 0) {
    console.log(`[WRAPPER] Tools detected (IGNORED): ${tools.map(t => t.function?.name).join(', ')}`);

    const toolsDescription = tools.map(t => {
      const f = t.function;
      const params = f.parameters?.properties
        ? Object.keys(f.parameters.properties).join(', ')
        : '';
      return `- ${f.name}(${params}): ${f.description}`;
    }).join('\n');

    const toolPrompt = `
You have access to these tools:
${toolsDescription}

IMPORTANT: When you need to use a tool, respond ONLY with a JSON object in this exact format:
{"name": "tool_name", "arguments": {"param1": "value1"}}

Do NOT include any other text when calling a tool. Just the JSON.
If you don't need a tool, respond normally.
`;

    // Aggiungi al system message o crea uno nuovo
    if (modifiedMessages[0]?.role === 'system') {
      modifiedMessages[0].content += '\n\n' + toolPrompt;
    } else {
      modifiedMessages.unshift({ role: 'system', content: toolPrompt });
    }
  }

  try {
    console.log(`[WRAPPER] Forwarding to Ollama: model=${model}, messages=${modifiedMessages.length}`);

    // Non usare tools con Ollama - forza sempre streaming normale
    const hasTools = false; // Ignora tools
    const isStreaming = stream === true;
    console.log(`[WRAPPER] Stream mode: ${isStreaming}, hasTools: ${hasTools} (forced false)`);

    const response = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: modifiedMessages,
        stream: isStreaming,
        ...rest
      })
    });

    // Se streaming, proxy diretto senza processare (Web Streams API)
    if (isStreaming) {
      console.log('[WRAPPER] Proxying streaming response');
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
        console.error('[WRAPPER] Stream error:', err.message);
        res.end();
      });
      return;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[WRAPPER] Ollama error:', response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    console.log(`[WRAPPER] Ollama responded: ${data.choices?.[0]?.message?.content?.substring(0, 100)}...`);

    // Non processare tool calls - Ollama non li gestisce bene
    if (false && tools && tools.length > 0 && data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content.trim();

      // Prova a estrarre JSON dalla risposta (più patterns)
      const jsonPatterns = [
        /\{[\s\S]*"name"[\s\S]*"arguments"[\s\S]*\}/,
        /```json\s*(\{[\s\S]*\})\s*```/,
        /```\s*(\{[\s\S]*\})\s*```/
      ];

      let toolCall = null;
      for (const pattern of jsonPatterns) {
        const match = content.match(pattern);
        if (match) {
          try {
            const jsonStr = match[1] || match[0];
            toolCall = JSON.parse(jsonStr);
            if (toolCall.name && toolCall.arguments) break;
          } catch (e) {
            continue;
          }
        }
      }

      if (toolCall && toolCall.name) {
        // Verifica che il tool esista
        const toolExists = tools.some(t => t.function.name === toolCall.name);

        if (toolExists && toolCall.arguments) {
          // Trasforma in formato tool_calls
          data.choices[0].message.tool_calls = [{
            id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'function',
            function: {
              name: toolCall.name,
              arguments: typeof toolCall.arguments === 'string'
                ? toolCall.arguments
                : JSON.stringify(toolCall.arguments)
            }
          }];
          data.choices[0].message.content = null;
          data.choices[0].finish_reason = 'tool_calls';

          console.log(`[WRAPPER] Tool call detected: ${toolCall.name}`);
        }
      }
    }

    res.json(data);

  } catch (err) {
    console.error('[WRAPPER] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', proxy_port: PROXY_PORT, target: OLLAMA_URL });
});

// Fallback per altre routes
app.use((req, res) => {
  console.log(`[WRAPPER] Unhandled route: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[WRAPPER] Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PROXY_PORT, () => {
  console.log(`
🔧 Tool Calling Wrapper v1.1
   Proxy:  http://localhost:${PROXY_PORT}
   Target: ${OLLAMA_URL}

   Configura ClawdBot per usare:
   baseUrl: http://localhost:${PROXY_PORT}/v1
`);
});
