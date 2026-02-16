
import requests
import time

# Config
INPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_REPAIRED.txt"
OUTPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_POLISHED.txt"
SERVER_URL = "http://localhost:8765/generate"

def qwen_polish(text):
    # Prompt specifico per correzione bozze
    if len(text) < 5: return text # Skip numbers/symbols
    
    prompt = f"""Sei un correttore di bozze esperto in italiano.
Analizza il seguente testo tradotto e correggi SOLO errori evidenti di battitura (es. 'Userderò' -> 'Userò'), grammatica o parole inesistenti.
NON cambiare lo stile e NON riassumere.
Se il testo è corretto, restituiscilo ESATTAMENTE uguale.

Testo:
{text}

Correzione:
/no_think"""

    for attempt in range(3):
        try:
            # Temperature bassa per evitare creatività, solo fix
            r = requests.post(SERVER_URL, json={"prompt": prompt, "max_tokens": len(text) + 200, "temp": 0.1}, timeout=300)
            res = r.json().get("result", "").strip()
            
            # Clean /no_think remnants
            if "/no_think" in res: res = res.split("/no_think")[-1].strip()
            # Clean "Correzione:" prefix if present
            if res.startswith("Correzione:"): res = res.replace("Correzione:", "").strip()
            
            # Safety check: if result is excessively different in length, keep original (avoid empty output)
            if len(res) < len(text) * 0.5:
                 return text
                 
            return res
        except Exception as e:
            print(f"Error polishing (attempt {attempt+1}): {e}")
            import time
            time.sleep(2)
    return text

print(f"Avvio revisione bozze su {INPUT_FILE}...")

try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print(f"File {INPUT_FILE} non trovato! Assicurati che il repair sia finito.")
    exit(1)

paragraphs = content.split('\n\n')
polished = []

for i, para in enumerate(paragraphs):
    para = para.strip()
    if not para:
        polished.append("")
        continue

    # Skip titles (usually ok, or we don't want to mess them up)
    # Actually polish titles too, why not.

    print(f"[{i}/{len(paragraphs)}] Revisionando... ({len(para)} chars)")
    new_text = qwen_polish(para)
    
    if new_text != para:
        print(f"   ✨ Corretto: '{para[:30]}...' -> '{new_text[:30]}...'")
    
    polished.append(new_text)

print(f"\nSalvataggio file revisionato: {OUTPUT_FILE}")
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n\n".join(polished))
