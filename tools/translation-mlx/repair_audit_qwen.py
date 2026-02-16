
import requests
import re
import time
import sys
import json
import os

# Config
INPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"
OUTPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_FULL_AUDIT.txt"
PROGRESS_FILE = "tools/translation-mlx/capussela_output/audit_progress.json"
SERVER_URL = "http://localhost:8765/generate"

def qwen_ensure_italian(text):
    # Skip short numbers or navigation symbols
    if len(text) < 3 or text.isdigit(): return text
    
    # Prompt ottimizzato per velocità e pulizia
    prompt = f"""Traduci il seguente testo in ITALIANO.
Se è già in Italiano, restituiscilo UGUALE.
NON AGGIUNGERE PREAMBOLI. Solo il testo finale.

Testo:
{text}

Output Italiano:
/no_think"""

    for attempt in range(3):
        try:
            r = requests.post(SERVER_URL, json={"prompt": prompt, "max_tokens": len(text) + 500}, timeout=120)
            res = r.json().get("result", "").strip()
            
            # Cleaning standard
            if "/no_think" in res: res = res.split("/no_think")[-1].strip()
            # Remove <think> and newlines
            res = re.sub(r'<think>.*?</think>', '', res, flags=re.DOTALL|re.IGNORECASE).strip()
            if "</think>" in res: res = res.split("</think>")[-1].strip()
            
            # Remove prefixes including "Testo:"
            prefixes = ["risultato italiano:", "risposta:", "traduzione:", "ecco la traduzione:", "italiano:", "testo:", "text:", "translation:", "output italiano:"]
            for p in prefixes:
                if res.lower().startswith(p):
                    res = res[len(p):].strip()
            
            # Remove quotes if not present in original
            if res.startswith('"') and res.endswith('"') and not text.startswith('"'):
                res = res[1:-1].strip()
            
            # Se la risposta è vuota o troppo breve rispetto all'input (e input non era trash), fallback
            if len(res) < len(text) * 0.1 and len(text) > 20:
                 return text # Fail safe
            
            return res
        except Exception as e:
            print(f"Error (attempt {attempt+1}): {e}")
            time.sleep(1)
    
    return text

print(f"Avvio AUDIT COMPLETO con Qwen su {INPUT_FILE}...")

# Load Input
try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print("File input non trovato.")
    sys.exit(1)

paragraphs = content.split('\n\n')
start_index = 0

# Check Progress for Resume
try:
    with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
        progress = json.load(f)
        start_index = progress.get("last_index", 0)
        print(f"Resuming from paragraph index {start_index} via progress file...")
except (FileNotFoundError, json.JSONDecodeError):
    pass

# Initialize output file if starting from scratch
if start_index == 0:
    if os.path.exists(OUTPUT_FILE):
        os.remove(OUTPUT_FILE) # Clean start
    open(OUTPUT_FILE, 'w').close()

for i, para in enumerate(paragraphs):
    if i < start_index:
        continue

    para = para.strip()
    # Always process, even if empty (to maintain structure)
    if not para:
        new_text = ""
    else:
        print(f"[{i}/{len(paragraphs)}] Audit... ({len(para)} chars)")
        new_text = qwen_ensure_italian(para)
    
    # Append to file immediately
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
         prefix = "\n\n" if i > 0 else ""
         f.write(prefix + new_text)

    # Save progress
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump({"last_index": i + 1}, f)

print(f"\nAudit Completato. Salvataggio finale: {OUTPUT_FILE}")
