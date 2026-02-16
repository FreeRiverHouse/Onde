
import requests
import re
import time
import sys
import json
import os

# Config
INPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"
OUTPUT_FILE = "tools/translation-mlx/capussela_output/traduzione_REPAIRED_V4.txt"
SERVER_URL = "http://localhost:8765/generate"

# Extensive Word Lists & Suffixes
IT_WORDS = {"il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "e", "ed", "o", "ma", "se", "per", "con", "su", "tra", "fra", "di", "a", "da", "in", "che", "non", "si", "è", "sono", "ho", "hai", "ha", "abbiamo", "hanno", "del", "della", "dei", "delle", "dal", "alla", "nel", "nella", "più", "come", "dove", "quando", "chi", "cosa", "io", "tu", "lui", "lei", "noi", "voi", "loro", "mio", "tuo", "suo", "nostro", "vostro", "loro", "questo", "quello", "tutto", "molto", "tutti", "tutte", "ogni", "qualche", "alcuni", "alcune", "nessuno", "nessuna", "altro", "altra", "altri", "altre", "stesso", "stessa", "stessi", "stesse", "tale", "tali", "cui", "quale", "quali", "chiunque", "ovunque", "comunque", "dunque", "quindi", "infatti", "inoltre", "tuttavia", "però", "allora", "allorché", "finché", "affinché", "benché", "sebbene", "quantunque", "mentre", "durante", "verso", "contro", "senza", "sotto", "sopra", "dietro", "davanti", "preso", "fatto", "detto", "visto", "scritto", "messo", "dato", "preso", "fatto", "stato"}
EN_WORDS = {"the", "and", "of", "to", "in", "is", "that", "it", "with", "as", "for", "was", "on", "are", "by", "this", "be", "have", "not", "at", "but", "his", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"}

IT_SUFFIXES = ("zione", "mento", "ante", "ente", "anza", "enza", "ismo", "ista", "bile", "evol", "are", "ere", "ire", "ato", "uto", "ito", "ando", "endo")
EN_SUFFIXES = ("tion", "ment", "ing", "ed", "ly", "ness", "ity", "ous", "able", "ible", "al", "ic", "ive", "ize", "ise", "fy", "ate")

def is_mostly_english(text):
    if len(text) < 5 or text.isdigit(): return False
    
    words = re.findall(r'\w+', text.lower())
    if not words: return False
    
    it_hits = 0
    en_hits = 0
    
    for w in words:
        if w in IT_WORDS: it_hits += 2 # Strong weight for stop words
        elif w in EN_WORDS: en_hits += 2
        
        # Suffix check
        found_suffix = False
        for s in IT_SUFFIXES:
            if w.endswith(s) and len(w) > len(s) + 2:
                it_hits += 1
                found_suffix = True
                break
        if not found_suffix:
            for s in EN_SUFFIXES:
                if w.endswith(s) and len(w) > len(s) + 2:
                    en_hits += 1
                    break
    
    total_score = it_hits + en_hits
    if total_score == 0: return False # Unknown language or names -> assume OK (keep original)
    
    # If English score is significantly higher than Italian, or Italian is zero
    if en_hits > it_hits or (it_hits == 0 and en_hits > 0):
        return True
        
    return False

def translate_para(text):
    prompt = f"Traduci in italiano:\n\n{text}\n\n/no_think"
    for attempt in range(3):
        try:
            r = requests.post(SERVER_URL, json={"prompt": prompt, "max_tokens": len(text) + 500}, timeout=60) # Faster timeout
            res = r.json().get("result", "").strip()
            
            # Cleaning
            if "/no_think" in res: res = res.split("/no_think")[-1].strip()
            res = re.sub(r'<think>.*?</think>', '', res, flags=re.DOTALL|re.IGNORECASE).strip()
            if "</think>" in res: res = res.split("</think>")[-1].strip()
            
            return res
        except Exception:
            time.sleep(1)
    return text

print(f"Avvio REPAIR V4 (Euristica Avanzata) su {INPUT_FILE}...")
try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f: content = f.read()
except FileNotFoundError: print("Input missing"); sys.exit(1)

paragraphs = content.split('\n\n')
repaired = []
count_fixed = 0

for i, para in enumerate(paragraphs):
    para = para.strip()
    if not para:
        repaired.append("")
        continue
        
    if is_mostly_english(para):
        print(f"[{i}] ENG Detected -> Translating: '{para[:50]}...'")
        new_text = translate_para(para)
        repaired.append(new_text)
        count_fixed += 1
    else:
        # Keep original (Italian)
        repaired.append(para)

print(f"Repair Completato. Paragrafi corretti: {count_fixed}/{len(paragraphs)}")
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n\n".join(repaired))
