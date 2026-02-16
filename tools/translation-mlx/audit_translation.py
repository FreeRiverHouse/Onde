
import random
import requests
import json
import sys

# Config
ORIGINAL_FILE = "tools/translation-mlx/capussela.txt"
TRANSLATED_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"
SERVER_URL = "http://localhost:8765/generate"
NUM_SAMPLES = 10  # Numero di campioni da verificare

def split_paras(text):
    import re
    # Usa la stessa logica dello script v12 (più o meno)
    # Ma attenzione: il file finale è già splittato clean
    return [p.strip() for p in text.split("\n\n") if p.strip()]

def evaluate_pair(original, translated):
    prompt = f"""You are a professional translator editor. Evaluate the following Italian translation of an English text.
Original: "{original}"
Translation: "{translated}"

Rate the translation quality from 1 to 10.
If quality is < 8, explain WHY briefly.
If quality is >= 8, just say "OK".
Format: Score: X/10 - Comment
/no_think"""
    
    try:
        r = requests.post(SERVER_URL, json={"prompt": prompt, "max_tokens": 200}, timeout=60)
        return r.json().get("result", "").strip()
    except Exception as e:
        return f"Error: {e}"

print("Caricamento file...")
with open(ORIGINAL_FILE, "r") as f:
    orig_text = f.read()
# Carico v12 dinamicamente
import importlib.util
from pathlib import Path

# Adjust paths relative to where script is run
base_dir = Path(".").resolve()
if (base_dir / "tools").exists():
    # Running from root
    v12_path = base_dir / "tools/translation-mlx/translate-mlx-bomproof-v12.py"
    orig_path = base_dir / "tools/translation-mlx/capussela.txt"
    trans_path = base_dir / "tools/translation-mlx/capussela_output/traduzione_finale.txt"
else:
    # Running from tools/translation-mlx
    v12_path = base_dir / "translate-mlx-bomproof-v12.py"
    orig_path = base_dir / "capussela.txt"
    trans_path = base_dir / "capussela_output/traduzione_finale.txt"

spec = importlib.util.spec_from_file_location("v12", str(v12_path))
v12 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v12)

# Read files
with open(orig_path, "r", encoding="utf-8") as f:
    orig_text = f.read()
with open(trans_path, "r", encoding="utf-8") as f:
    trans_text = f.read()

orig_paras = v12.split_paragraphs(orig_text)
trans_paras = trans_text.split("\n\n")

print(f"Originali: {len(orig_paras)}")
print(f"Tradotti:  {len(trans_paras)}")

if len(orig_paras) != len(trans_paras):
    print("⚠️ Attenzione: Numero paragrafi diverso! Allineamento non garantito.")
    # Cerchiamo di allineare sommariamente o prendiamo campioni sicuri (inizio/fine)
    min_len = min(len(orig_paras), len(trans_paras))
else:
    min_len = len(orig_paras)

indices = sorted(random.sample(range(min_len), NUM_SAMPLES))

print("\n--- INIZIO AUDIT ---")
for idx in indices:
    o = orig_paras[idx]
    t = trans_paras[idx]
    
    # Salta titoli brevissimi
    if len(o) < 20: continue
    
    print(f"\n🔹 Campione #{idx}")
    print(f"ORIG: {o[:100]}...")
    print(f"TRAN: {t[:100]}...")
    
    eval_res = evaluate_pair(o, t)
    print(f"📊 {eval_res}")

print("\n--- FINE AUDIT ---")
