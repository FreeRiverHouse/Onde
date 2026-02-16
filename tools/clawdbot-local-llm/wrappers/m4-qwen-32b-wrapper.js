/**
 * Tool Calling Wrapper per MLX Server su 8765
 *
 * Adapts OpenAI chat requests to MLX Server /generate endpoint.
 *
 * Port: 11435 (proxy) → 127.0.0.1:8765 (MLX Server)
 */

import express from 'express';
import fetch from 'node-fetch'; // Ensure fetch is available or use native if node 18+

const app = express();
const PROXY_PORT = 11436;
const MLX_URL = 'http://127.0.0.1:8766';

app.use(express.json({ limit: '50mb' }));

// Helper to format chat messages to Qwen prompt
function formatPrompt(messages) {
  let prompt = '';
  for (const msg of messages) {
    let content = msg.content;
    if (typeof content !== 'string') {
      // Handle array of content parts (like OpenAI vision/multimodal format)
      if (Array.isArray(content)) {
        content = content.map(part => {
          if (typeof part === 'string') return part;
          if (part.type === 'text') return part.text;
          return ''; // Skip images or other types for now
        }).join('\n');
      } else {
        content = JSON.stringify(content);
      }
    }
    prompt += `<|im_start|>${msg.role}\n${content}<|im_end|>\n`;
  }
  prompt += '<|im_start|>assistant\n';
  return prompt;
}

// Proxy /v1/chat/completions
app.post('/v1/chat/completions', async (req, res) => {
  console.log('[MLX-WRAPPER] Received chat completion request');

  const { messages, stream } = req.body;

  try {
    const prompt = formatPrompt(messages || []);
    console.log(`[MLX-WRAPPER] Forwarding to MLX: messages=${messages?.length}`);

    // Call MLX /generate endpoint
    const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;

    // HEARTBEAT CHECK
    if (lastMsg && lastMsg.content && lastMsg.content.includes("HEARTBEAT")) {
      console.log("[MLX-WRAPPER] Heartbeat detected, returning OK");
      return res.json({
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: req.body.model || "qwen",
        choices: [{
          index: 0,
          message: { role: "assistant", content: "HEARTBEAT_OK" },
          finish_reason: "stop"
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      });
    }

    const response = await fetch(`${MLX_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: req.body.max_tokens || 1024,
        temp: req.body.temperature || 0.7,
        // STRIP TOOLS: MLX/Qwen 7B gets confused by tools in prompt
        // We want pure chat for now to ensure it replies
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[MLX-WRAPPER] MLX error:', response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    // MLX /generate returns { "result": "text" }
    const text = data.result || "";

    console.log(`[MLX-WRAPPER] MLX responded: ${text.substring(0, 50)}...`);

    // Approximate token count (1 token ~= 4 chars)
    const completionTokens = Math.ceil(text.length / 4);
    const promptTokens = Math.ceil(prompt.length / 4);

    if (stream) {
      // Handle Streaming Response (SSE)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const id = `chatcmpl-${Date.now()}`;
      const created = Math.floor(Date.now() / 1000);
      const model = req.body.model || "qwen";

      // 1. Initial chunk with role
      const msgRole = {
        id, object: "chat.completion.chunk", created, model,
        choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }]
      };
      res.write(`data: ${JSON.stringify(msgRole)}\n\n`);

      // 2. Content chunk (simulated stream of whole text for now)
      // In a perfect world we'd stream from MLX, but "wait-then-burst" is ok for compatibility
      const msgContent = {
        id, object: "chat.completion.chunk", created, model,
        choices: [{ index: 0, delta: { content: text }, finish_reason: null }]
      };
      res.write(`data: ${JSON.stringify(msgContent)}\n\n`);

      // 3. Final chunk with finish_reason
      const msgFinish = {
        id, object: "chat.completion.chunk", created, model,
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
      };
      res.write(`data: ${JSON.stringify(msgFinish)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();

    } else {
      // Handle Standard JSON Response
      const completion = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: req.body.model || "qwen",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: text
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens
        }
      };
      res.json(completion);
    }

  } catch (err) {
    console.error('[MLX-WRAPPER] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', proxy_port: PROXY_PORT, target: MLX_URL });
});

// Start server
app.listen(PROXY_PORT, () => {
  console.log(`
🍎 MLX Adapter Wrapper v2.0 (M4 Edition)
   Proxy:  http://localhost:${PROXY_PORT}
   Target: ${MLX_URL}
   Model:  Qwen3 32B (via MLX Server)
`);
});
