
import requests
import json
import time
import sys
import re

SERVER_URL = "http://localhost:8765/generate"
INPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"

def analyze_and_validate(idx, text):
    if len(text) < 3 or text.isdigit():
        return text, {"reason": "too_short"}
    
    # Prompt V5 Strict JSON
    prompt = f"""You are a translation quality assurance system.
Analyze the text below. Is it in English or Italian?
If English (even partially), provide and assume it needs translation into Italian.
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

    print(f"\n--- TEST P{idx} --- (Len: {len(text)})")
    print(f"INPUT: '{text[:60]}...'")
    
    for attempt in range(2):
        try:
            r = requests.post(SERVER_URL, json={"prompt": prompt, "max_tokens": len(text) + 500, "temp": 0.0}, timeout=60)
            res = r.json().get("result", "").strip()
            
            # JSON Extraction
            json_match = re.search(r'\{.*\}', res, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                try:
                    data = json.loads(json_str)
                    needs_trans = data.get("needs_translation")
                    italian_text = data.get("italian_text")
                    
                    print(f"DECISION: needs_translation={needs_trans}")
                    if needs_trans:
                        print(f"OUTPUT TRANSLATED: '{italian_text[:60]}...'")
                        return italian_text, "TRANSLATED"
                    else:
                        print("OUTPUT KEPT: Original.")
                        return text, "KEPT"
                except json.JSONDecodeError:
                    print("JSON Decode Error.")
            else:
                print(f"No JSON found in response: {res[:50]}...")
                
        except Exception as e:
            print(f"Request Error: {e}")
            time.sleep(1)
            
    return text, "ERROR"

# Main Test Runner
try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    paragraphs = content.split('\n\n')
except FileNotFoundError:
    print("Input file missing.")
    sys.exit(1)

# TEST INDICES: 10 Samples (Start, Middle, End, Mix)
indices_to_test = [0, 7, 9, 26, 47, 100, 500, 800, 1150, 1155]

print(f"=== VALIDAZIONE ESTESA V5 SU {len(indices_to_test)} CAMPIONI ===")

results = []

for idx in indices_to_test:
    if idx >= len(paragraphs): continue
    para = paragraphs[idx].strip()
    if not para: continue
    
    final_text, status = analyze_and_validate(idx, para)
    results.append((idx, para[:30], status, final_text[:30]))

print("\n=== REPORT FINALE ===")
print(f"{'IDX':<5} | {'INPUT (Prefix)':<30} | {'STATUS':<10} | {'OUTPUT (Prefix)':<30}")
print("-" * 80)
for r in results:
    input_str = r[1].replace('\n', ' ')
    output_str = r[3].replace('\n', ' ')
    print(f"{r[0]:<5} | {input_str:<30} | {r[2]:<10} | {output_str:<30}")
