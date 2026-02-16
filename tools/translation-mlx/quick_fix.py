#!/usr/bin/env python3
import subprocess

base = "tools/translation-mlx/capussela_output"
merged_file = f"{base}/traduzione_COMPLETA_FINAL.txt"
docx_file = f"{base}/Capussela_Traduzione_FINAL.docx"

# Read the merged file
with open(merged_file, "r") as f:
    paras = f.read().split("\n\n")

# Patch paragraph 454 with correct Italian translation
paras[454] = "Abbandonando entrambi gli approcci, la teoria neoclassica presenta l'economia come una rete di interazioni di una massa di agenti equivalenti, che possono essere ridotti a un unico ritratto semplificativo (il cosiddetto homo economicus, che ha preferenze razionali e massimizza l'utilità nel proprio interesse): le loro diverse dotazioni di capitale o lavoro determinano i loro redditi, ma non li rendono diversi l'uno dall'altro. Nei modelli costruiti su queste fondamenta le asimmetrie di potere non trovano spazio. Pochi economisti neoclassici si sono fermati o si fermano lì, naturalmente, ma per decenni i seguaci dei corsi elementari di economia non hanno imparato molto di più. Quel ritratto è stato così depositato nella nostra cultura popolare, accanto alla non interferenza."

# Also fix paragraph 407 (remove SLOP prefix)
paras[407] = paras[407].replace("tradurre in italiano: ", "")

# Save back
with open(merged_file, "w") as f:
    f.write("\n\n".join(paras))

print("✓ Paragraph 454 fixed")
print("✓ Paragraph 407 cleaned")

# Regenerate DOCX
print("Regenerating DOCX...")
subprocess.run(["textutil", "-convert", "docx", "-output", docx_file, merged_file])
print(f"✓ DONE: {docx_file}")
