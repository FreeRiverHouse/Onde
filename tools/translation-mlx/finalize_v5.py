
import sys

ORIGINAL_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"
V5_FILE_PATH = "tools/translation-mlx/capussela_output/traduzione_FINAL_V5.txt"
FINAL_FILE = "tools/translation-mlx/capussela_output/traduzione_COMPLETA_V5.txt"

try:
    with open(ORIGINAL_FILE, "r", encoding="utf-8") as f:
        orig = f.read().split("\n\n")
except FileNotFoundError:
    print("Original file missing!")
    orig = []

try:
    with open(V5_FILE_PATH, "r", encoding="utf-8") as f:
        v5 = f.read().split("\n\n")
except FileNotFoundError:
    print("V5 Output not found! Using Original only.")
    v5 = []

print(f"Original Paras: {len(orig)}")
print(f"V5 Completed Paras: {len(v5)}")

final_paras = []
if len(v5) >= len(orig):
    print("V5 is already complete. Using V5.")
    final_paras = v5
else:
    missing_cnt = len(orig) - len(v5)
    print(f"Appending {missing_cnt} missing paragraphs from Original...")
    missing = orig[len(v5):]
    final_paras = v5 + missing

with open(FINAL_FILE, "w", encoding="utf-8") as f:
    f.write("\n\n".join(final_paras))

print(f"Saved Complete Text to: {FINAL_FILE}")
