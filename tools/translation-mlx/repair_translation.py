
import sys
import requests
import re
from pathlib import Path

# Config
INPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"
OUTPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_REPAIRED.txt"
SERVER_URL = "http://localhost:8765/generate"

# Robust Language Detection
IT_WORDS = {"il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "e", "ed", "o", "ma", "se", "per", "con", "su", "tra", "fra", "di", "a", "da", "in", "che", "non", "si", "è", "sono", "ho", "hai", "ha", "abbiamo", "hanno", "del", "della", "dei", "delle", "dal", "alla", "nel", "nella", "più", "come", "dove", "quando", "chi", "cosa", "io", "tu", "lui", "lei", "noi", "voi", "loro", "mio", "tuo", "suo", "nostro", "vostro", "loro", "questo", "quello", "tutto", "molto"}
EN_WORDS = {"the", "and", "of", "to", "in", "is", "that", "it", "with", "as", "for", "was", "on", "are", "by", "this", "be", "have", "not", "at", "but", "his", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"}

def needs_translation(text):
    if len(text) < 3: return False
    words = re.findall(r'\w+', text.lower())
    if not words: return False
    
    it_count = sum(1 for w in words if w in IT_WORDS)
    en_count = sum(1 for w in words if w in EN_WORDS)
    
    total = len(words)
    
    # If explicit English words are present and Italian words are scarce
    if en_count > 0 and it_count == 0:
        return True
        
    # If mostly English (>20% English words and <20% Italian)
    if (en_count / total > 0.2) and (it_count / total < 0.2):
        return True

    return False

def is_mostly_english(text): return needs_translation(text) # Alias for compatibility

def qwen_translate(text):
    prompt = f"Traduci in italiano:\n\n{text}\n\n/no_think"
    for attempt in range(3):
        try:
            r = requests.post(SERVER_URL, json={"prompt": prompt, "max_tokens": 500}, timeout=300)
            res = r.json().get("result", "").strip()
            # Clean /no_think remnants
            if "/no_think" in res: res = res.split("/no_think")[-1].strip()
            
            # Remove <think> blocks
            import re
            res = re.sub(r'<think>.*?</think>', '', res, flags=re.DOTALL|re.IGNORECASE).strip()
            if "</think>" in res: res = res.split("</think>")[-1].strip()

            # Remove conversational prefixes
            prefixes = ["risposta:", "traduzione:", "ecco la traduzione:", "italiano:", "translation:", "answer:", "sure, here is the translation:", "certamente, ecco la traduzione:"]
            res_lower = res.lower()
            for p in prefixes:
                if res_lower.startswith(p):
                    res = res[len(p):].strip()
                    res_lower = res.lower() # update for next check
            
            # Remove quotes if the whole sentence is quoted but original wasn't
            if res.startswith('"') and res.endswith('"') and not text.startswith('"'):
                res = res[1:-1].strip()

            # ULTRA STRICT CLEANING: Remove original text if duplicated
            # Check if result contains original text significantly
            if len(text) > 10 and text in res:
                res = res.replace(text, "").strip()
            
            # Check for splitting by newline if double (Italian / English)
            parts = res.split('\n\n')
            if len(parts) > 1:
                # Heuristic: keep the part that is NOT mostly English
                best_part = parts[0]
                for p in parts:
                    if not is_mostly_english(p) and len(p) > len(best_part) * 0.5:
                        best_part = p
                        break
                res = best_part.strip()

            return res
        except Exception as e:
            print(f"Error translating (attempt {attempt+1}): {e}")
            import time
            time.sleep(2)
    return text

print(f"Analizzando {INPUT_FILE} per parti non tradotte...")

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    content = f.read()

paragraphs = content.split('\n\n')
repaired = []
count_fixed = 0

for i, para in enumerate(paragraphs):
    para = para.strip()
    if not para:
        repaired.append("")
        continue

    # Skip numbers or very short symbols
    if len(para) < 5 and not para.isalpha():
        repaired.append(para)
        continue

    if is_mostly_english(para):
        print(f"🔸 [{i}] Rilevato Inglese: '{para[:60]}...'")
        new_text = qwen_translate(para)
        if new_text and new_text != para:
            print(f"   ✅ Tradotto in: '{new_text[:60]}...'")
            repaired.append(new_text)
            count_fixed += 1
        else:
            print(f"   ⚠️ Fallita traduzione, mantengo originale.")
            repaired.append(para)
    else:
        repaired.append(para)

print(f"\nSalvataggio file riparato: {OUTPUT_FILE}")
print(f"Totale paragrafi corretti: {count_fixed}")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n\n".join(repaired))
