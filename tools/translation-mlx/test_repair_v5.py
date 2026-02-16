
import requests
import json
import time
import sys
import re

SERVER_URL = "http://localhost:8765/generate"
INPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"

def analyze_and_repair_debug(text):
    if len(text) < 3 or text.isdigit():
        return text, {"reason": "too_short"}
    
    # Prompt V5 Strict JSON
    prompt = f"""You are a translation quality assurance system.
Analyze the text below. Is it in English or Italian?
If English (even partially), provide the Italian translation.
If Italian, output "needs_translation": false.

Return ONLY a JSON object:
{{
  "needs_translation": boolean,
  "italian_text": "string" (translation if true, else null)
}}

Text:
{text}

JSON Output:
/no_think"""

    print(f"\n--- DEBUG REQ ---\nPrompt Sent. Waiting for JSON...")
    
    try:
        r = requests.post(SERVER_URL, json={"prompt": prompt, "max_tokens": len(text) + 500, "temp": 0.0}, timeout=60)
        res = r.json().get("result", "").strip()
        print(f"--- RAW RES ---\n{res}\n----------------")
        
        # JSON Extraction
        json_match = re.search(r'\{.*\}', res, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            data = json.loads(json_str)
            
            if data.get("needs_translation") is True:
                translated = data.get("italian_text")
                if translated:
                    return translated, data
                else:
                    return text, {"error": "true_but_no_text"}
            else:
                return text, data # Italian
        else:
            return text, {"error": "no_json_found"}
            
    except Exception as e:
        return text, {"error": str(e)}

# Main Test Runner
try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    paragraphs = content.split('\n\n')
except FileNotFoundError:
    print("Input file missing.")
    sys.exit(1)

# TEST INDICES: 0 (Title EN), 3 (Body IT)
indices_to_test = [0, 3]

print(f"=== FASE 1: TEST SU 2 PARAGRAFI ({indices_to_test}) ===")

for idx in indices_to_test:
    if idx >= len(paragraphs): continue
    para = paragraphs[idx].strip()
    if not para: continue
    
    print(f"\n===== TEST PARAGRAFO {idx} =====")
    print(f"INPUT ({len(para)} chars): '{para[:50]}...'")
    
    final_text, metadata = analyze_and_repair_debug(para)
    
    print(f"OUTPUT: '{final_text[:50]}...'")
    print(f"METADATA: {metadata}")
    
    # Validation Logic
    if idx == 0:
        if final_text == para: print("❌ FAIL: Paragrafo inglese NON tradotto.")
        else: print("✅ PASS: Paragrafo inglese tradotto.")
    elif idx == 3:
        if final_text != para: print("❌ FAIL: Paragrafo italiano MODIFICATO.")
        else: print("✅ PASS: Paragrafo italiano MANTENUTO.")
