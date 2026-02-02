"""
LLM with True Q4 inference - keeps weights quantized in VRAM.

For Qwen2.5-14B on 20GB VRAM:
- Standard FP16: 27.5 GB → OOM
- True Q4: ~8-10 GB → FITS!

Usage:
  cd /Users/mattia/Projects/Onde/vendor/tinygrad
  PYTHONPATH=. AMD=1 AMD_LLVM=1 python3.11 tinygrad/apps/llm_q4.py --model qwen2.5:14b
"""

from __future__ import annotations
import os, sys, argparse, typing, json, uuid, time
from tinygrad import Tensor, nn, UOp, dtypes, getenv
from tinygrad.helpers import GlobalCounters, DEBUG, stderr_log, colored
from tinygrad.engine.jit import TinyJit
from tinygrad.viz.serve import TCPServerWithReuse, HTTPRequestHandler

# Import from parent llm module
sys.path.insert(0, os.path.dirname(__file__))
from llm import SimpleTokenizer, precompute_freqs_cis, apply_rope, models

from tinygrad.nn.quantized import QuantizedLinear

class Q4TransformerBlock:
    """Transformer block with Q4_K quantized linear layers."""

    def __init__(self, dim: int, hidden_dim: int, n_heads: int, n_kv_heads: int,
                 norm_eps: float, head_dim: int, rope_theta: float,
                 max_context: int = 0, qk_norm: int = 0, attn_bias: bool = False):
        self.n_heads = n_heads
        self.n_kv_heads = n_kv_heads
        self.head_dim = head_dim
        self.rope_theta = rope_theta
        self.max_context = max_context
        self.qk_norm = qk_norm

        q_proj_out = head_dim * n_heads
        kv_proj_out = head_dim * n_kv_heads

        # Attention projections - use QuantizedLinear
        self.attn_q = QuantizedLinear(dim, q_proj_out, bias=attn_bias)
        self.attn_k = QuantizedLinear(dim, kv_proj_out, bias=attn_bias)
        self.attn_v = QuantizedLinear(dim, kv_proj_out, bias=attn_bias)
        self.attn_output = QuantizedLinear(q_proj_out, dim, bias=False)

        # Norms stay in FP16 (small)
        self.attn_norm = nn.RMSNorm(dim, norm_eps)
        self.ffn_norm = nn.RMSNorm(dim, norm_eps)
        # QK normalization (Qwen3 uses this)
        if qk_norm:
            self.attn_q_norm = nn.RMSNorm(qk_norm, norm_eps)
            self.attn_k_norm = nn.RMSNorm(qk_norm, norm_eps)

        # FFN - use QuantizedLinear
        self.ffn_gate = QuantizedLinear(dim, hidden_dim, bias=False)
        self.ffn_up = QuantizedLinear(dim, hidden_dim, bias=False)
        self.ffn_down = QuantizedLinear(hidden_dim, dim, bias=False)

    def _attention(self, x: Tensor, start_pos: int | UOp) -> Tensor:
        x_norm = self.attn_norm(x)
        B, T, D = x_norm.shape

        q, k, v = self.attn_q(x_norm), self.attn_k(x_norm), self.attn_v(x_norm)
        # QK norm BEFORE reshape (when qk_norm != head_dim, e.g., Qwen3: 128 vs 80)
        if self.qk_norm and self.qk_norm != self.head_dim:
            q, k = self.attn_q_norm(q), self.attn_k_norm(k)

        # Reshape and transpose to (B, n_heads, T, head_dim) for RoPE
        q = q.reshape(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        k = k.reshape(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
        v = v.reshape(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
        # QK norm AFTER reshape (when qk_norm == head_dim)
        if self.qk_norm == self.head_dim:
            q, k = self.attn_q_norm(q), self.attn_k_norm(k)

        # Apply RoPE
        freqs_cis = precompute_freqs_cis(self.head_dim, self.max_context, self.rope_theta)
        q = apply_rope(q, freqs_cis[start_pos:start_pos+T])
        k = apply_rope(k, freqs_cis[start_pos:start_pos+T])

        # KV Cache - CRITICAL for autoregressive generation!
        # Without this, each token only sees itself, not previous context
        if not hasattr(self, "cache_kv"):
            self.cache_kv = Tensor.zeros(2, B, self.n_kv_heads, self.max_context, self.head_dim,
                                         dtype=k.dtype, device=k.device).contiguous().realize()
        self.cache_kv[:, :, :, start_pos:start_pos+T, :].assign(Tensor.stack(k, v)).realize()
        k = self.cache_kv[0, :, :, 0:start_pos+T, :]
        v = self.cache_kv[1, :, :, 0:start_pos+T, :]

        # Causal mask - NOTE: (T, start_pos+T) to account for cached tokens!
        mask = Tensor.full((1, 1, T, start_pos+T), float("-inf"), dtype=x.dtype, device=x.device).triu(start_pos+1) if T > 1 else None

        # Scaled dot-product attention with GQA support
        attn = q.scaled_dot_product_attention(k, v, attn_mask=mask, enable_gqa=True)
        out = attn.transpose(1, 2).reshape(B, T, -1)
        return self.attn_output(out)

    def _feed_forward(self, x: Tensor) -> Tensor:
        x_norm = self.ffn_norm(x)
        # contiguous() after silu() prevents kernel recompilation
        gated = self.ffn_gate(x_norm).silu().contiguous() * self.ffn_up(x_norm)
        return self.ffn_down(gated)

    def __call__(self, x: Tensor, start_pos: int | UOp) -> Tensor:
        x = x + self._attention(x, start_pos)
        x = x + self._feed_forward(x)
        return x.contiguous()


class Q4Transformer:
    """Transformer with Q4_K quantized weights."""

    def __init__(self, *, num_blocks: int, dim: int, hidden_dim: int, n_heads: int,
                 n_kv_heads: int, norm_eps: float, vocab_size: int, head_dim: int,
                 rope_theta: float, max_context: int = 0, qk_norm: int = 0, attn_bias: bool = False):

        self.blk = [Q4TransformerBlock(dim, hidden_dim, n_heads, n_kv_heads, norm_eps,
                                        head_dim, rope_theta, max_context, qk_norm, attn_bias)
                    for _ in range(num_blocks)]

        # Embeddings stay in FP16 (relatively small, needed for lookup)
        self.token_embd = nn.Embedding(vocab_size, dim)
        self.output_norm = nn.RMSNorm(dim, norm_eps)
        # Output projection - use QuantizedLinear
        self.output = QuantizedLinear(dim, vocab_size, bias=False)
        self.max_context = max_context
        # JIT compilation for fast token generation
        self.forward_jit = TinyJit(self.forward)

    def forward(self, tokens: Tensor, start_pos: int | UOp) -> Tensor:
        x = self.token_embd(tokens)
        for block in self.blk:
            x = block(x, start_pos)
        return self.output(self.output_norm(x))[:, -1, :].softmax(-1, dtype="float").argmax(-1, keepdim=True)

    def __call__(self, tokens: Tensor, start_pos: int | UOp = 0) -> Tensor:
        # Use JIT for single token generation (T=1) with symbolic start_pos
        return (self.forward_jit if getenv("JIT", 1) and tokens.shape[1] == 1 and isinstance(start_pos, UOp) else self.forward)(tokens, start_pos)

    @staticmethod
    def from_gguf_quantized(gguf: Tensor, max_context: int | None = None) -> tuple['Q4Transformer', dict]:
        """Load model keeping Q4_K weights quantized."""
        from tinygrad.nn.state import gguf_load_quantized

        print("Loading GGUF with quantized weights...")
        kv, state_dict, q4k_blocks = gguf_load_quantized(gguf.to(None))

        arch = kv['general.architecture']
        max_context = min(max_context, kv[f'{arch}.context_length']) if max_context else kv[f'{arch}.context_length']
        n_heads, n_kv_heads = kv[f'{arch}.attention.head_count'], kv[f'{arch}.attention.head_count_kv']

        # Check if model has attention bias (Qwen2.5 does)
        attn_bias = any('attn_q.bias' in name for name in state_dict) or \
                    any('attn_q.bias' in name for name in q4k_blocks)

        # Check for QK normalization (Qwen3 uses this)
        qk_norm = 0
        if 'blk.0.attn_q_norm.weight' in state_dict:
            qk_norm = int(state_dict['blk.0.attn_q_norm.weight'].shape[0])
        elif any('attn_q_norm.weight' in name for name in state_dict):
            # Find the shape
            for name, tensor in state_dict.items():
                if 'attn_q_norm.weight' in name:
                    qk_norm = int(tensor.shape[0])
                    break

        print(f"Model: {arch}, blocks={kv[f'{arch}.block_count']}, attn_bias={attn_bias}, qk_norm={qk_norm}")
        print(f"Q4K tensors: {len(q4k_blocks)}, FP16 tensors: {len(state_dict)}")

        # Estimate memory
        q4k_bytes = sum(blocks.numel() for blocks, _, _ in q4k_blocks.values())
        fp16_bytes = sum(t.numel() * 2 for t in state_dict.values())
        print(f"Memory: Q4K={q4k_bytes/1024**3:.2f}GB, FP16={fp16_bytes/1024**3:.2f}GB, Total={( q4k_bytes+fp16_bytes)/1024**3:.2f}GB")

        model = Q4Transformer(
            num_blocks=kv[f'{arch}.block_count'],
            dim=kv[f'{arch}.embedding_length'],
            hidden_dim=kv.get(f'{arch}.expert_feed_forward_length', kv[f'{arch}.feed_forward_length']),
            n_heads=n_heads, n_kv_heads=n_kv_heads,
            norm_eps=kv[f'{arch}.attention.layer_norm_rms_epsilon'],
            vocab_size=len(kv['tokenizer.ggml.tokens']),
            head_dim=kv.get(f'{arch}.attention.key_length', kv[f'{arch}.embedding_length'] // n_heads),
            rope_theta=kv[f'{arch}.rope.freq_base'],
            max_context=max_context,
            qk_norm=qk_norm,
            attn_bias=attn_bias
        )

        # Load FP16 tensors (embeddings, norms, biases)
        print("Loading FP16 tensors...")
        fp16_loaded = 0
        fp16_failed = []
        for name, tensor in state_dict.items():
            # Map GGUF names to model attributes
            parts = name.replace('.weight', '').replace('.bias', '').split('.')
            obj = model
            for p in parts[:-1]:
                if p == 'blk':
                    continue  # blk is handled when we hit the digit
                elif p.isdigit():
                    obj = obj.blk[int(p)]
                else:
                    obj = getattr(obj, p, None)
                    if obj is None: break

            if obj is not None:
                attr = parts[-1]
                if hasattr(obj, attr):
                    target = getattr(obj, attr)
                    if '.weight' in name:
                        target.weight = tensor
                        fp16_loaded += 1
                    elif '.bias' in name:
                        # QuantizedLinear uses bias_tensor, nn.Linear uses bias
                        if hasattr(target, 'bias_tensor'):
                            target.bias_tensor = tensor
                            fp16_loaded += 1
                        elif hasattr(target, 'bias'):
                            target.bias = tensor
                            fp16_loaded += 1
                else:
                    fp16_failed.append(name)
            else:
                fp16_failed.append(name)

        print(f"  FP16 loaded: {fp16_loaded}, failed: {len(fp16_failed)}")
        if fp16_failed and DEBUG:
            print(f"  Failed: {fp16_failed[:10]}...")

        # Load Q4K blocks
        print("Loading Q4K blocks...")
        q4k_loaded = 0
        q4k_failed = []
        for name, (blocks, n_elements, dims) in q4k_blocks.items():
            # Special handling for token_embd - it's nn.Embedding, not QuantizedLinear
            # Need to dequantize and assign to weight
            if name == 'token_embd.weight':
                from tinygrad.nn.state import dequant_q4k_tensor
                print("  Dequantizing token_embd.weight...")
                dequant = dequant_q4k_tensor(blocks, n_elements)
                # GGUF dims are (dim, vocab), we need (vocab, dim) for Embedding
                model.token_embd.weight = dequant.flatten()[:n_elements].reshape(*reversed(dims))
                q4k_loaded += 1
                if DEBUG: print(f"  Loaded token_embd: {model.token_embd.weight.shape}")
                continue

            parts = name.replace('.weight', '').split('.')
            obj = model
            for p in parts[:-1]:
                if p.isdigit():
                    obj = obj.blk[int(p)]
                elif p == 'blk':
                    continue
                else:
                    obj = getattr(obj, p, None)
                    if obj is None: break

            if obj is not None:
                attr = parts[-1]
                if hasattr(obj, attr):
                    target = getattr(obj, attr)
                    if isinstance(target, QuantizedLinear):
                        target.load_q4k_blocks(blocks)
                        q4k_loaded += 1
                        if DEBUG: print(f"  Loaded Q4K: {name} -> {target.out_features}x{target.in_features}")
                    else:
                        q4k_failed.append(f"{name} (not QuantizedLinear)")
                else:
                    q4k_failed.append(f"{name} (no attr {attr})")
            else:
                q4k_failed.append(f"{name} (obj None)")

        print(f"  Q4K loaded: {q4k_loaded}, failed: {len(q4k_failed)}")
        if q4k_failed:
            print(f"  Q4K failed examples: {q4k_failed[:5]}")

        print(f"Model loaded! VRAM: {GlobalCounters.mem_used/1024**3:.2f}GB")
        return model, kv

    def generate(self, tokens: list[int], start_pos: int = 0):
        # Create symbolic variable for JIT compilation
        v_start_pos = UOp.variable("start_pos", 1, self.max_context - 1)
        t = Tensor([tokens[start_pos:]], dtype="int32")
        while len(tokens) < self.max_context:
            # Use symbolic start_pos for JIT when generating single tokens
            sp = v_start_pos.bind(start_pos) if getenv("SYM", 1) and start_pos != 0 and t.shape[-1] == 1 else start_pos
            t = self(t, sp)
            next_id = int(t.item())
            tokens.append(next_id)
            start_pos = len(tokens) - 1
            yield next_id


# === WARMUP OPTIMIZATION ===
# Pre-defined lengths for JIT caching. More granular = better cache hits.
# Trade-off: more lengths = longer startup warmup time.
WARMUP_LENGTHS = [8, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024]

def get_padded_length(prompt_len: int) -> int:
    """Return the smallest warmup length >= prompt_len (for status display)."""
    for wlen in WARMUP_LENGTHS:
        if wlen >= prompt_len:
            return wlen
    return prompt_len


# *** OpenAI compatible server ***
CHAT_HTML = b'''<!DOCTYPE html><html><head><title>Q4 Chat</title><style>
* { margin: 0 } body { background: #212121; color: #e3e3e3; font-family: system-ui; height: 100vh; display: flex; flex-direction: column }
#chat { flex: 1; overflow-y: auto; padding: 20px } .msg { padding: 10px 16px; margin: 8px 0; white-space: pre-wrap; border-radius: 18px }
.user { background: #2f2f2f; margin-left: auto; width: fit-content; max-width: 70% }
#input { max-width: 768px; width: 100%; margin: 20px auto; padding: 14px 20px; background: #2f2f2f; color: inherit; font: inherit; border: none; outline: none; resize: none; border-radius: 24px }
</style></head><body><div id="chat"></div><textarea id="input" rows="1" placeholder="Ask"></textarea>
<script>
input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
const msgs = [];
async function send() {
  if (!input.value.trim()) return; msgs.push({role: 'user', content: input.value.trim()});
  chat.innerHTML += '<div class="msg user">' + input.value.trim().replace(/</g, '&lt;') + '</div>'; input.value = '';
  const d = document.createElement('div'); d.className = 'msg'; chat.appendChild(d);
  const r = await fetch('/v1/chat/completions', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({model: 'q4', messages: msgs, stream: true})});
  for (const rd = r.body.getReader(), dec = new TextDecoder();;) { const {done, value} = await rd.read(); if (done) break;
    for (const ln of dec.decode(value).split('\\n')) if (ln.startsWith('data: ') && !ln.includes('[DONE]')) try { d.textContent += JSON.parse(ln.slice(6)).choices[0]?.delta?.content || '' } catch {}
    chat.scrollTop = chat.scrollHeight; }
  msgs.push({role: 'assistant', content: d.textContent});
}
</script></body></html>'''

class Handler(HTTPRequestHandler):
  def log_request(self, code='-', size='-'): pass
  def do_GET(self): self.send_data(CHAT_HTML, content_type="text/html")
  def run_model(self, ids:list[int], model_name:str, include_usage=False, show_thinking=False):
    # Check if this length is pre-warmed
    nearest_warmup = get_padded_length(len(ids))
    warmup_status = "✓" if len(ids) in WARMUP_LENGTHS else f"→{nearest_warmup}"
    stderr_log(f"{self.path}  in:{len(ids):5d} [{warmup_status}]  ")

    tmpl = {"id":f"chatcmpl-{uuid.uuid4().hex[:24]}", "object":"chat.completion.chunk", "created":int(time.time()), "model":model_name}
    yield {"choices": [{"index":0, "delta":{"role":"assistant","content":""}, "finish_reason":None}], **tmpl}
    out: list[int] = []
    buffer = ""  # Buffer for filtering <think>...</think>
    in_think = False
    think_content = ""
    st = pt = time.perf_counter()  # pt initialized here, updated after prefill
    for next_id in model.generate(ids):
      if len(out) == 0: stderr_log(f"prefill:{len(ids)/((pt:=time.perf_counter())-st):4.0f} tok/s  ")
      if next_id == eos_id: break
      out.append(next_id)
      content = tok.decode([next_id])

      # Filter <think>...</think> blocks unless show_thinking is True
      if show_thinking:
        yield {"choices": [{"index":0, "delta":{"content":content}, "finish_reason":None}], **tmpl}
      else:
        buffer += content
        # Check for <think> start
        if not in_think and "<think>" in buffer:
          # Output everything before <think>
          pre_think = buffer.split("<think>")[0]
          if pre_think:
            yield {"choices": [{"index":0, "delta":{"content":pre_think}, "finish_reason":None}], **tmpl}
          buffer = buffer.split("<think>", 1)[1] if "<think>" in buffer else ""
          in_think = True
          think_content = buffer
          buffer = ""
        elif in_think:
          think_content += content
          # Check for </think> end
          if "</think>" in think_content:
            in_think = False
            # Optionally log thinking content for debug
            if DEBUG >= 2: stderr_log(f"\n[THINKING: {len(think_content)} chars]\n")
            # Get content after </think>
            after_think = think_content.split("</think>", 1)[1].lstrip('\n')
            buffer = after_think
            think_content = ""
        else:
          # Not in think block, output normally (but buffer to detect <think>)
          if len(buffer) > 20 or ("<" not in buffer):  # Safe to output
            yield {"choices": [{"index":0, "delta":{"content":buffer}, "finish_reason":None}], **tmpl}
            buffer = ""

    # Flush remaining buffer
    if buffer and not in_think:
      yield {"choices": [{"index":0, "delta":{"content":buffer}, "finish_reason":None}], **tmpl}
    yield {"choices": [{"index":0, "delta":{},"finish_reason":"stop"}], **tmpl}
    if include_usage: yield {"choices": [], "usage": {"prompt_tokens": len(ids), "completion_tokens": len(out), "total_tokens": len(ids) + len(out)}, **tmpl}
    stderr_log(f"out:{len(out):5d}  gen: {len(out)/(time.perf_counter()-pt):4.0f} tok/s\n")

  def do_POST(self):
    raw_body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
    body: dict[str, typing.Any] = json.loads(raw_body.decode("utf-8"))
    if self.path == "/v1/chat/completions":
      ids: list[int] = [bos_id] if bos_id is not None else []
      for msg in body["messages"]:
        ids += tok.role(msg["role"])
        content = msg["content"]
        if isinstance(content, str): ids += tok.encode(content)
        elif isinstance(content, list):
          for c in content:
            if c["type"] == "text": ids += tok.encode(c["text"])
        ids += tok.end_turn(eos_id)
      ids += tok.role("assistant")
      # show_thinking: set to true to see <think>...</think> blocks in output
      # Can be set via: "show_thinking": true in request body
      show_thinking = body.get("show_thinking", False) or getenv("SHOW_THINKING", 0)
      chunks = self.run_model(ids, body["model"],
                              not body.get("stream") or body.get("stream_options",{}).get("include_usage", False),
                              show_thinking=show_thinking)
      if body.get("stream"): self.stream_json(chunks)
      else:
        out = []
        for c in chunks: out.append(c["choices"][0]["delta"].get("content", "") if c["choices"] else "")
        self.send_data(json.dumps({**c, "object":"chat.completion", "choices":[{"index":0, "message":{"role":"assistant","content":"".join(out)}, "finish_reason":"stop"}]}).encode())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Q4 Quantized LLM Inference")
    parser.add_argument("--model", type=str, default="qwen2.5:14b", help="Model name")
    parser.add_argument("--max_context", type=int, default=2048, help="Max context length")
    parser.add_argument("--prompt", type=str, default="What is 2+2?", help="Prompt")
    parser.add_argument("--count", type=int, default=50, help="Max tokens to generate")
    parser.add_argument("--serve", nargs='?', type=int, const=11434, metavar="PORT", help="Run OpenAI API server")
    parser.add_argument("--no-padding", action="store_true", help="Disable prompt padding (slower, more accurate timing)")
    args = parser.parse_args()

    from tinygrad import Device
    Device['AMD']
    print(f"Device: {Device.DEFAULT}")

    # Get model URL
    model_url = models.get(args.model)
    if not model_url:
        print(f"Unknown model: {args.model}")
        print(f"Available: {list(models.keys())}")
        sys.exit(1)

    # Load from local file if exists, otherwise download
    if model_url.startswith('/'):
        model_path = model_url
    else:
        model_path = f"/Volumes/DATI-SSD/llm-models/{args.model.replace(':', '-')}.gguf"
        if not os.path.exists(model_path):
            model_path = f"/tmp/{args.model.replace(':', '-')}.gguf"
            if not os.path.exists(model_path):
                print(f"Downloading {args.model}...")
                import urllib.request
                urllib.request.urlretrieve(model_url, model_path)

    print(f"Loading from: {model_path}")
    gguf = Tensor.empty(os.stat(model_path).st_size, dtype=dtypes.uint8, device=f'disk:{model_path}')

    model, kv = Q4Transformer.from_gguf_quantized(gguf, max_context=args.max_context)
    tok = SimpleTokenizer.from_gguf_kv(kv)
    arch = kv['general.architecture']
    eos_id = 151645 if arch in ['qwen2', 'qwen3'] else 128009
    bos_id = kv.get('tokenizer.ggml.bos_token_id') if kv.get('tokenizer.ggml.add_bos_token', True) else None

    # Server mode
    if args.serve:
        # Pre-warmup JIT with warmup lengths that fit in max_context
        warmup_lengths = [wlen for wlen in WARMUP_LENGTHS if wlen <= args.max_context - 10]
        print(f"\n=== Pre-warming JIT for {len(warmup_lengths)} lengths ===")
        print(f"  Lengths: {warmup_lengths}")
        print(f"  (This ensures fast response for any prompt length)\n")
        for i, wlen in enumerate(warmup_lengths):
            print(f"  [{i+1}/{len(warmup_lengths)}] Warming up length={wlen}...", end=" ", flush=True)
            st = time.perf_counter()
            # Create dummy tokens
            dummy_tokens = [1] * wlen  # BOS token repeated
            # Run one prefill + a few generate steps
            gen = model.generate(dummy_tokens, 0)
            for j, _ in enumerate(gen):
                if j >= 2:  # Just 2 tokens to warm up generate JIT
                    break
            # Clear KV cache for fresh start
            for blk in model.blk:
                if hasattr(blk, 'cache_kv'):
                    del blk.cache_kv
            print(f"done ({time.perf_counter()-st:.1f}s)")
        print("\n=== Warmup complete! All lengths cached. ===\n")

        print(f"=== Q4 Server on http://localhost:{args.serve} ===")
        TCPServerWithReuse(('', args.serve), Handler).serve_forever()

    # Generate mode
    print(f"\nPrompt: {args.prompt}")
    tokenizer = tok
    eos_token = eos_id
    formatted = tokenizer.role('user') + tokenizer.encode(args.prompt) + tokenizer.end_turn(eos_token) + tokenizer.role('assistant')
    print(f"Tokens: {len(formatted)}")

    print("\nGenerating...")
    output = []
    for i, tok in enumerate(model.generate(formatted, 0)):
        if tok in [eos_token, 128001, 151643]:
            break
        if i >= args.count:
            break
        output.append(tok)
        print(tokenizer.decode([tok]), end='', flush=True)

    print(f"\n\nGenerated {len(output)} tokens")
    print(f"Final VRAM: {GlobalCounters.mem_used/1024**3:.2f}GB")
