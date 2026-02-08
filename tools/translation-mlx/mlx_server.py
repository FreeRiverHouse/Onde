#!/usr/bin/env python3
"""
MLX Translation Server - Persistent model loading
Keeps Qwen3-32B in memory for fast translations.
"""
import json
import time
import os
import sys
import signal
import fcntl
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from datetime import datetime

# Config
PORT = 8765
LOCK_FILE = Path(__file__).parent / "server.lock"
PID_FILE = Path(__file__).parent / "server.pid"
STATUS_FILE = Path(__file__).parent / "server_status.json"
LOG_FILE = Path("/tmp/mlx_server.log")

QWEN3 = "Qwen/Qwen3-32B-MLX-4bit"
MISTRAL_PATH = Path.home() / "Models/MistralSmall-Creative-24B-MLX-4bit"

# Global model references
qwen_model = None
qwen_tokenizer = None
mistral_model = None
mistral_tokenizer = None

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a") as f:
            f.write(line + "\n")
    except:
        pass

def update_status(status, model_loaded=False, error=None):
    try:
        data = {
            "status": status,
            "model_loaded": model_loaded,
            "port": PORT,
            "pid": os.getpid(),
            "timestamp": datetime.now().isoformat()
        }
        if error:
            data["error"] = error
        STATUS_FILE.write_text(json.dumps(data, indent=2))
    except:
        pass

def load_models():
    """Load models into memory - ONLY Qwen3 (24GB RAM limit)"""
    global qwen_model, qwen_tokenizer, mistral_model, mistral_tokenizer

    from mlx_lm import load

    log("Loading Qwen3-32B...")
    update_status("loading_qwen", False)
    qwen_model, qwen_tokenizer = load(QWEN3)
    log("Qwen3-32B loaded!")

    # NOTE: Mistral disabled - not enough RAM for both models
    # To enable: need 32GB+ RAM or swap models on demand
    log("Mistral disabled (RAM limit) - using Qwen3 only")
    mistral_model = None
    mistral_tokenizer = None

    update_status("ready", True)
    log(f"Server ready on port {PORT}")

def generate(model, tokenizer, prompt, max_tokens=500, temp=0.2):
    """Generate text with loaded model"""
    from mlx_lm import generate as mlx_generate

    response = mlx_generate(
        model, tokenizer, prompt,
        max_tokens=max_tokens,
        verbose=False
    )
    return response

def detect_repetition_loop(text, min_repeat_len=30):
    """Detect and extract clean text from repetition loops"""
    if not text or len(text) < min_repeat_len * 2:
        return text

    # Try to find repeated patterns
    for pattern_len in range(min_repeat_len, min(len(text) // 2, 500)):
        pattern = text[:pattern_len]
        # Check if pattern repeats
        if text[pattern_len:pattern_len*2].startswith(pattern[:pattern_len//2]):
            # Found a loop! Return just the first clean occurrence
            # Find the end of the first complete sentence/paragraph
            first_part = text[:pattern_len]
            # Trim to last complete sentence
            for end_char in ['. ', '.\n', '! ', '!\n', '? ', '?\n']:
                last_end = first_part.rfind(end_char)
                if last_end > min_repeat_len:
                    return first_part[:last_end+1].strip()
            return first_part.strip()

    return text

def clean_translation_output(raw_output, original_text):
    """Extract clean translation from model output"""
    import re
    translation = raw_output

    # Remove /no_think and everything before it
    if "/no_think" in translation:
        translation = translation.split("/no_think")[-1].strip()

    # Remove Qwen3 special tokens
    translation = re.sub(r'<\s*im_start\s*>', '', translation)
    translation = re.sub(r'<\s*im_end\s*>', '', translation)
    translation = re.sub(r'<\|im_start\|>', '', translation)
    translation = re.sub(r'<\|im_end\|>', '', translation)

    # Remove <think>...</think> blocks
    translation = re.sub(r'<think>.*?</think>', '', translation, flags=re.DOTALL|re.IGNORECASE)
    if "</think>" in translation.lower():
        translation = translation.split("</think>")[-1].strip()

    # Remove English thinking content
    thinking_markers = ["let me", "let's see", "okay,", "the user", "i need to", "starting with", "overall,", "first,"]
    lines = translation.split('\n')
    clean_lines = []
    for line in lines:
        line_lower = line.lower().strip()
        if any(marker in line_lower[:50] for marker in thinking_markers):
            continue  # Skip thinking lines
        clean_lines.append(line)
    translation = '\n'.join(clean_lines).strip()

    # CRITICAL: Detect prompt leaking into output - AGGRESSIVE removal
    prompt_indicators = [
        "sei un revisore", "migliora questa", "rispondi solo",
        "traduci in italiano", "traduci tutto", "versione migliorata:", "originale inglese:",
        "traduzione da migliorare:", "nient'altro", "migliorata:",
        "revisore editoriale", "testo rivisto", "esperto.",
        "ogni parola deve essere", "chapter→capitolo", "section→sezione"
    ]

    # Remove ENTIRE lines containing prompt indicators
    if any(p in translation.lower() for p in prompt_indicators):
        clean_lines = []
        for line in translation.split('\n'):
            if not any(p in line.lower() for p in prompt_indicators):
                clean_lines.append(line)
        translation = '\n'.join(clean_lines).strip()

    # Also remove lines that start with common prompt prefixes
    clean_lines = []
    for line in translation.split('\n'):
        line_lower = line.strip().lower()
        skip = False
        for prefix in ["originale", "traduzione da", "versione", "migliorata", "testo:"]:
            if line_lower.startswith(prefix):
                skip = True
                break
        if not skip:
            clean_lines.append(line)
    translation = '\n'.join(clean_lines).strip()

    # Detect and fix repetition loops
    translation = detect_repetition_loop(translation)

    # Take FIRST meaningful paragraph (not last - which may be truncated)
    if "\n\n" in translation:
        parts = translation.split("\n\n")
        for part in parts:
            part = part.strip()
            if part and len(part) > 20:
                skip_words = ["traduci", "translate", "rispondi", "migliora", "versione", "originale",
                              "fonti:", "sources:", "references:", "nota:", "note:"]
                if not any(w in part.lower()[:50] for w in skip_words):
                    if original_text.lower()[:20] not in part.lower():
                        translation = part
                        break

    translation = translation.strip()

    # Remove common prefixes
    for prefix in ["Italian:", "Traduzione:", "Italiano:", "Ecco:", "Translation:",
                   "Ecco la traduzione:", "VERSIONE MIGLIORATA:", "Versione migliorata:",
                   "Answer:", "Risposta:", "Here is", "Ecco qui:", "Sure!", "Certo!",
                   "Here's", "La traduzione è:", "In italiano:", "**", "##"]:
        if translation.lower().startswith(prefix.lower()):
            translation = translation[len(prefix):].strip()

    # Remove chatbot garbage (slop detection)
    chatbot_phrases = [
        "you're welcome", "if you need", "feel free to", "have a great day",
        "let me know", "i hope this helps", "is there anything else",
        "happy to help", "glad to assist", "buona giornata", "fammi sapere",
        "non esitare a", "se hai bisogno", "sarò felice di"
    ]
    for phrase in chatbot_phrases:
        if phrase in translation.lower():
            sentences = translation.split('.')
            clean_sentences = [s for s in sentences if phrase not in s.lower()]
            translation = '. '.join(clean_sentences).strip()
            if translation and not translation.endswith('.') and not translation.endswith('!') and not translation.endswith('?'):
                translation += '.'

    # SENTENCE-LEVEL prompt removal (catches mid-paragraph leakage)
    sentence_prompt_indicators = [
        "traduci tutto", "traduci in italiano", "rispondi solo",
        "ogni parola deve", "chapter→", "section→"
    ]
    sentences = translation.replace('. ', '.|').split('|')
    clean_sentences = []
    for s in sentences:
        if not any(p in s.lower() for p in sentence_prompt_indicators):
            clean_sentences.append(s)
    translation = ' '.join(clean_sentences).strip()

    # Final loop check - if same 50 chars repeat, truncate
    if len(translation) > 100:
        chunk = translation[:50]
        if translation.count(chunk) > 1:
            first_repeat = translation.find(chunk, 50)
            if first_repeat > 0:
                translation = translation[:first_repeat].strip()

    return translation

def is_italian(text):
    """Check if text is likely Italian (anti-slop)"""
    if not text or len(text.strip()) < 5:
        return False

    # Common English words that shouldn't appear in Italian translation
    en_words = ["the", "and", "for", "with", "that", "this", "from", "have", "been",
                "are", "was", "were", "will", "would", "could", "should", "which"]
    words = text.lower().split()

    if len(words) < 3:
        return True  # Too short to judge

    en_count = sum(1 for w in en_words if w in words)

    # If more than 20% English words, probably not Italian
    if en_count > len(words) * 0.2:
        return False

    return True

class TranslationHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress default logging

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_json({
                "status": "ok",
                "qwen_loaded": qwen_model is not None,
                "mistral_loaded": mistral_model is not None
            })
        elif self.path == '/status':
            self.send_json({
                "status": "running",
                "port": PORT,
                "pid": os.getpid(),
                "models": {
                    "qwen": qwen_model is not None,
                    "mistral": mistral_model is not None
                }
            })
        else:
            self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()

        try:
            data = json.loads(body)
        except:
            self.send_json({"error": "Invalid JSON"}, 400)
            return

        if self.path == '/translate':
            text = data.get('text', '')
            if not text:
                self.send_json({"error": "No text provided"}, 400)
                return

            try:
                # === STEP 1: Translate with Qwen ===
                # NOTE: /no_think must be at END for Qwen3 to respect it
                prompt = f"""/no_think
Traduci il seguente testo in italiano. Rispondi SOLO con la traduzione italiana, senza spiegazioni.

Testo: {text}

Traduzione:"""

                start = time.time()
                raw_output = generate(qwen_model, qwen_tokenizer, prompt, max_tokens=600)
                qwen_time = time.time() - start

                # Clean output
                translation = clean_translation_output(raw_output, text)

                # === STEP 2: Check if it's Italian (anti-slop) ===
                if not is_italian(translation):
                    log(f"  Anti-slop: output not Italian, keeping original")
                    translation = text  # Keep original if translation failed

                # === STEP 3: Revise with Qwen (same model, different prompt) ===
                revised = translation
                revise_time = 0
                if data.get('revise', True) and translation != text:
                    revise_prompt = f"""/no_think
Riscrivi questa traduzione italiana in modo più fluido e naturale. Rispondi SOLO con il testo rivisto.

Originale inglese: {text}

Traduzione da migliorare: {translation}

Versione migliorata:"""

                    start = time.time()
                    raw_revised = generate(qwen_model, qwen_tokenizer, revise_prompt, max_tokens=600)
                    revise_time = time.time() - start

                    revised = clean_translation_output(raw_revised, text)

                    # Anti-slop check on revision
                    if not is_italian(revised):
                        log(f"  Anti-slop: revision not Italian, keeping translation")
                        revised = translation

                self.send_json({
                    "original": text,
                    "translation": translation,
                    "revised": revised,
                    "qwen_time": round(qwen_time, 2),
                    "revise_time": round(revise_time, 2),
                    "total_time": round(qwen_time + revise_time, 2)
                })

            except Exception as e:
                log(f"Translation error: {e}")
                self.send_json({"error": str(e)}, 500)

        elif self.path == '/generate':
            prompt = data.get('prompt', '')
            model_name = data.get('model', 'qwen')
            max_tokens = data.get('max_tokens', 500)

            try:
                if model_name == 'mistral' and mistral_model:
                    result = generate(mistral_model, mistral_tokenizer, prompt, max_tokens)
                else:
                    result = generate(qwen_model, qwen_tokenizer, prompt, max_tokens)

                self.send_json({"result": result})
            except Exception as e:
                self.send_json({"error": str(e)}, 500)

        else:
            self.send_json({"error": "Not found"}, 404)

def cleanup(signum=None, frame=None):
    log("Shutting down...")
    update_status("stopped", False)
    try:
        LOCK_FILE.unlink(missing_ok=True)
        PID_FILE.unlink(missing_ok=True)
    except:
        pass
    sys.exit(0)

def is_server_running():
    """Check if server is already running"""
    if not PID_FILE.exists():
        return False

    try:
        pid = int(PID_FILE.read_text().strip())
        os.kill(pid, 0)  # Check if process exists
        return True
    except (ProcessLookupError, ValueError):
        # Process doesn't exist, clean up stale files
        PID_FILE.unlink(missing_ok=True)
        LOCK_FILE.unlink(missing_ok=True)
        return False

def main():
    # Check if already running
    if is_server_running():
        print(f"Server already running! Check port {PORT}")
        print(f"To stop: kill $(cat {PID_FILE})")
        sys.exit(1)

    # Acquire lock
    try:
        lock_fd = open(LOCK_FILE, "w")
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("Another instance is starting!")
        sys.exit(1)

    # Write PID
    PID_FILE.write_text(str(os.getpid()))

    # Setup signal handlers
    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    # Clear log
    LOG_FILE.write_text("")

    log("=" * 50)
    log("MLX Translation Server starting...")
    log("=" * 50)

    update_status("starting", False)

    try:
        load_models()

        server = HTTPServer(('0.0.0.0', PORT), TranslationHandler)
        log(f"Listening on http://localhost:{PORT}")
        log("Endpoints:")
        log("  GET  /health - Health check")
        log("  GET  /status - Server status")
        log("  POST /translate - Translate text")
        log("  POST /generate - Generate text")

        server.serve_forever()

    except KeyboardInterrupt:
        cleanup()
    except Exception as e:
        log(f"FATAL: {e}")
        update_status("error", False, str(e))
        cleanup()

if __name__ == "__main__":
    main()
