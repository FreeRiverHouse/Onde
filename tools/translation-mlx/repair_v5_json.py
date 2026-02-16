
import requests
import json
import time
import sys
import re

INPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"
OUTPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_FINAL_V5.txt"
PROGRESS_FILE = "tools/translation-mlx/capussela_output/audit_v5_progress.json"
SERVER_URL = "http://localhost:8765/generate"

def analyze_and_repair(text):
    if len(text) < 3 or text.isdigit(): return text
    
    # Prompt for JSON Output
    prompt = f"""You are a translation quality assurance system.
Analyze the following text. determine if it is in English or Italian.
If it is in English (even partially), provide the Italian translation.
If it is already in Italian, set "needs_translation" to false.

Return ONLY a JSON object with this format:
{{
  "needs_translation": boolean,
  "italian_text": "string" (the translated text if needed, or null)
}}

Text to analyze:
{text}

JSON Output:
/no_think"""

    for attempt in range(3):
        try:
            r = requests.post(SERVER_URL, json={"prompt": prompt, "max_tokens": len(text) + 500, "temp": 0.0}, timeout=120)
            res = r.json().get("result", "").strip()
            
            # Extract JSON block if surrounded by markdown
            json_match = re.search(r'\{.*\}', res, re.DOTALL)
            if json_match:
                res = json_match.group(0)
            
            try:
                data = json.loads(res)
            except json.JSONDecodeError:
                # Fallback: try to fix common JSON errors or retry
                print(f"   JSON Parse Error: {res[:50]}...")
                continue

            if data.get("needs_translation") is True:
                translated = data.get("italian_text")
                if translated and len(translated) > 0:
                    return translated
                else:
                    # Logic error by model (said true but gave no text)
                    # Fallback to direct translation request?
                    return text # Keep original to be safe
            else:
                return text # It's Italian
                
        except Exception as e:
            print(f"Error (attempt {attempt+1}): {e}")
            time.sleep(1)
            
    return text

print(f"Avvio REPAIR V5 (JSON Strict Mode) su {INPUT_FILE}...")

# Load Input
try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f: content = f.read()
except FileNotFoundError: print("Input missing"); sys.exit(1)

paragraphs = content.split('\n\n')
start_index = 0

# Resume Logic
if True: # Always support resume
    try:
        with open(PROGRESS_FILE, "r") as f:
            start_index = json.load(f).get("last_index", 0)
            print(f"Resuming from {start_index}...")
    except: pass

for i, para in enumerate(paragraphs):
    if i < start_index: continue
    
    para = para.strip()
    if not para:
        final_text = ""
    else:
        print(f"[{i}/{len(paragraphs)}] Analyzing...")
        final_text = analyze_and_repair(para)
        
        if final_text != para:
             print(f"   ✨ Fixed: {para[:30]}... -> {final_text[:30]}...")

    # Append to output
    with open(OUTPUT_FILE, "a" if i > 0 else "w", encoding="utf-8") as f:
        prefix = "\n\n" if i > 0 else ""
        f.write(prefix + final_text)
        
    with open(PROGRESS_FILE, "w") as f:
        json.dump({"last_index": i + 1}, f)

print("Done.")
