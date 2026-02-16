import http.server
import socketserver
import json
import urllib.request
import urllib.error
import time
import sys

PROXY_PORT = 11435
Target_URL = "http://127.0.0.1:8765/generate"

class MyHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/v1/chat/completions' or self.path == '/chat/completions':
            content_len = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_len)
            try:
                data = json.loads(post_body)
                messages = data.get('messages', [])
                
                # Format prompt for Qwen
                prompt = ""
                for msg in messages:
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    prompt += f"<|im_start|>{role}\n{content}<|im_end|>\n"
                prompt += "<|im_start|>assistant\n"
                
                # Request to MLX Server
                req_data = json.dumps({
                    "prompt": prompt,
                    "max_tokens": data.get('max_tokens', 1024),
                    "temp": data.get('temperature', 0.7)
                }).encode('utf-8')
                
                req = urllib.request.Request(Target_URL, data=req_data, headers={'Content-Type': 'application/json'})
                
                with urllib.request.urlopen(req) as response:
                    res_body = response.read()
                    res_json = json.loads(res_body)
                    text = res_json.get('result', '')
                    
                    # OpenAI Response Format
                    completion = {
                        "id": f"chatcmpl-{int(time.time())}",
                        "object": "chat.completion",
                        "created": int(time.time()),
                        "model": data.get('model', 'qwen'),
                        "choices": [{
                            "index": 0,
                            "message": {
                                "role": "assistant",
                                "content": text
                            },
                            "finish_reason": "stop"
                        }],
                        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
                    }
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(completion).encode('utf-8'))
                    
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f"ERROR in wrapper: {e}", file=sys.stderr)
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    try:
        # Use ThreadingTCPServer to handle multiple requests (e.g. dashboard poll + chat)
        with ThreadingTCPServer(("", PROXY_PORT), MyHandler) as httpd:
            print(f"Wrapper serving at port {PROXY_PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
