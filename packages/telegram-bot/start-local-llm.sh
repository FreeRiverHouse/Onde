#!/bin/bash
# Start local LLM server with TinyGrad on Radeon GPU
#
# Usage:
#   ./start-local-llm.sh              # Start LLaMA 3 8B (default)
#   ./start-local-llm.sh llama3-1b    # Start LLaMA 3 1B (faster)
#   ./start-local-llm.sh gpt2         # Start GPT-2 (fastest)

MODEL="${1:-llama3-8b}"
PORT="${2:-8080}"

echo "🚀 Starting local LLM server..."
echo "   Model: $MODEL"
echo "   Port: $PORT"
echo ""

# Check TinyGPU app
if [ -f /Applications/TinyGPU.app ]; then
  echo "📱 Opening TinyGPU.app (required for Radeon)..."
  open /Applications/TinyGPU.app
  sleep 2
fi

cd ~/tinygrad || { echo "❌ ~/tinygrad not found"; exit 1; }

# Set AMD GPU
export AMD=1

case "$MODEL" in
  "llama3-8b")
    echo "🦙 Starting LLaMA 3 8B (16GB VRAM)..."
    # Start OpenAI-compatible server
    python3 -m llama_cpp.server \
      --model ~/.cache/huggingface/hub/models--TriAiExperiments--SFR-Iterative-DPO-LLaMA-3-8B-R/snapshots/*/model.gguf \
      --host 0.0.0.0 \
      --port $PORT \
      --n_ctx 4096 \
      2>/dev/null || \
    # Fallback: use TinyGrad directly with simple HTTP wrapper
    python3 << 'PYEOF'
import http.server
import json
import subprocess
import os

os.environ['AMD'] = '1'
PORT = int(os.environ.get('PORT', 8080))

class LLMHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/v1/chat/completions':
            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length))

            messages = post_data.get('messages', [])
            prompt = messages[-1]['content'] if messages else ''

            # Call TinyGrad LLaMA
            result = subprocess.run([
                'python3', 'examples/llama3.py',
                '--model', 'TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R',
                '--prompt', prompt,
                '--count', '500'
            ], capture_output=True, text=True, cwd=os.path.expanduser('~/tinygrad'))

            response = {
                'choices': [{
                    'message': {'role': 'assistant', 'content': result.stdout.strip()},
                    'finish_reason': 'stop'
                }],
                'model': 'llama-3-8b-radeon'
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/health' or self.path == '/v1/models':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'model': 'llama-3-8b'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

print(f'🦙 LLaMA 3 8B server on http://0.0.0.0:{PORT}')
http.server.HTTPServer(('0.0.0.0', PORT), LLMHandler).serve_forever()
PYEOF
    ;;

  "llama3-1b")
    echo "🦙 Starting LLaMA 3 1B (2GB VRAM)..."
    PORT=$PORT python3 << 'PYEOF'
import http.server
import json
import subprocess
import os

os.environ['AMD'] = '1'
PORT = int(os.environ.get('PORT', 8081))

class LLMHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/v1/chat/completions':
            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length))

            messages = post_data.get('messages', [])
            prompt = messages[-1]['content'] if messages else ''

            result = subprocess.run([
                'python3', 'examples/llama3.py', '--gguf',
                '--prompt', prompt,
                '--count', '300'
            ], capture_output=True, text=True, cwd=os.path.expanduser('~/tinygrad'))

            response = {
                'choices': [{
                    'message': {'role': 'assistant', 'content': result.stdout.strip()},
                    'finish_reason': 'stop'
                }],
                'model': 'llama-3-1b-radeon'
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path in ['/health', '/v1/models']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'model': 'llama-3-1b'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

print(f'🦙 LLaMA 3 1B server on http://0.0.0.0:{PORT}')
http.server.HTTPServer(('0.0.0.0', PORT), LLMHandler).serve_forever()
PYEOF
    ;;

  "gpt2")
    echo "🤖 Starting GPT-2 (500MB VRAM)..."
    PORT=$PORT python3 << 'PYEOF'
import http.server
import json
import subprocess
import os

os.environ['AMD'] = '1'
PORT = int(os.environ.get('PORT', 8082))

class LLMHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/v1/chat/completions':
            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length))

            messages = post_data.get('messages', [])
            prompt = messages[-1]['content'] if messages else ''

            result = subprocess.run([
                'python3', 'examples/gpt2.py',
                '--prompt', prompt,
                '--count', '200'
            ], capture_output=True, text=True, cwd=os.path.expanduser('~/tinygrad'))

            response = {
                'choices': [{
                    'message': {'role': 'assistant', 'content': result.stdout.strip()},
                    'finish_reason': 'stop'
                }],
                'model': 'gpt2-radeon'
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path in ['/health', '/v1/models']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'model': 'gpt2'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

print(f'🤖 GPT-2 server on http://0.0.0.0:{PORT}')
http.server.HTTPServer(('0.0.0.0', PORT), LLMHandler).serve_forever()
PYEOF
    ;;

  *)
    echo "❌ Unknown model: $MODEL"
    echo "Available: llama3-8b, llama3-1b, gpt2"
    exit 1
    ;;
esac
