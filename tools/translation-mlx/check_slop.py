
import re
import sys

FILE_PATH = "tools/translation-mlx/capussela_output/traduzione_FINAL_V5.txt"

SLOP_PATTERNS = [
    r"Here is the translation",
    r"Sure, I can help",
    r"As an AI language model",
    r"I cannot translate",
    r"Italiano:",
    r"Translation:",
    r"Translated text:",
    r"The following text",
]

ENGLISH_WORDS = [
    r"\bthe\b", r"\band\b", r"\bof\b", r"\bchapte\b", r"\bintroduction\b", 
    r"\bpreface\b", r"\bconclusion\b", r"\backnowledgments\b"
]

def check_file(path):
    print(f"--- CHECKING FOR SLOP IN: {path} ---")
    try:
        with open(path, "r", encoding="utf-8") as f:
            paragraphs = f.read().split('\n\n')
    except FileNotFoundError:
        print("File not found.")
        return

    issues = 0
    for i, para in enumerate(paragraphs):
        para = para.strip()
        if not para: continue
        
        # Check Slop
        for pattern in SLOP_PATTERNS:
            if re.search(pattern, para, re.IGNORECASE):
                print(f"[SLOP FOUND] Para {i}: '{para[:50]}...' matches '{pattern}'")
                issues += 1
        
        # Check English (Heuristic: >3 detection)
        eng_count = 0
        hits = []
        for word in ENGLISH_WORDS:
            if re.search(word, para, re.IGNORECASE):
                eng_count += 1
                hits.append(word)
        
        if eng_count >= 2 and len(para) > 50:
             # Ignore if looks like bibliography (contains dates '19xx', '20xx' and names)
             if not (re.search(r"\b(19|20)\d{2}\b", para) and len(para)<200):
                 print(f"[POSSIBLE ENGLISH] Para {i}: '{para[:50]}...' matches {hits}")
                 issues += 1

    if issues == 0:
        print("✅ NO OBVIOUS SLOP DETECTED.")
    else:
        print(f"⚠️ FOUND {issues} POTENTIAL ISSUES.")

check_file(FILE_PATH)
