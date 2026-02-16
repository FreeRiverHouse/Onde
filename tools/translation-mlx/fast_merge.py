
import os

try:
    with open("tools/translation-mlx/capussela_output/traduzione_finale.txt", "r", encoding="utf-8") as f:
        orig = f.read().split("\n\n")
except Exception as e:
    print(f"Error reading orig: {e}")
    orig = []

try:
    with open("tools/translation-mlx/capussela_output/traduzione_FINAL_V5.txt", "r", encoding="utf-8") as f:
        v5 = f.read().split("\n\n")
except Exception as e:
    print(f"Error reading v5: {e}")
    v5 = []

print(f"Orig: {len(orig)}, V5: {len(v5)}")

final = v5
if len(orig) > len(v5):
    print(f"Appending {len(orig) - len(v5)} paragraphs from original")
    final += orig[len(v5):]

output_path = "tools/translation-mlx/capussela_output/FINAL_MERGED.txt"
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n\n".join(final))

print(f"Saved merged text to {output_path}")
