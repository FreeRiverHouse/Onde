
import os
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Paths
V5_FILE = "tools/translation-mlx/capussela_output/traduzione_FINAL_V5.txt"
ORIG_FILE = "tools/translation-mlx/capussela_output/traduzione_finale.txt"
OUTPUT_DOCX = "tools/translation-mlx/capussela_output/Capussela_Traduzione_V5_FINAL.docx"

print("Recupero dati...")

# Load Data
try:
    with open(V5_FILE, "r", encoding="utf-8") as f:
        v5_content = f.read().strip()
        v5_paras = v5_content.split("\n\n")
    print(f"✅ V5 Audit: {len(v5_paras)} paragrafi recuperati.")
except FileNotFoundError:
    print("❌ V5 Output non trovato! Impossibile recuperare.")
    exit(1)

try:
    with open(ORIG_FILE, "r", encoding="utf-8") as f:
        orig_content = f.read().strip()
        orig_paras = orig_content.split("\n\n")
    print(f"✅ Originale: {len(orig_paras)} paragrafi.")
except FileNotFoundError:
    print("⚠️ Originale non trovato. Uso solo V5.")
    orig_paras = []

# Merge Logic
final_paras = list(v5_paras)
if len(orig_paras) > len(v5_paras):
    missing_count = len(orig_paras) - len(v5_paras)
    print(f"🔹 Aggiungo {missing_count} paragrafi mancanti dall'originale (coda del libro)...")
    final_paras.extend(orig_paras[len(v5_paras):])
else:
    print("✅ V5 copre tutto il testo.")

# DOCX Generation
print(f"Generazione DOCX con {len(final_paras)} paragrafi...")
doc = Document()

# Style Setup
style = doc.styles['Normal']
font = style.font
font.name = 'Georgia'
font.size = Pt(11)

for i, text in enumerate(final_paras):
    text = text.strip()
    if not text: continue

    # Heuristic for Titles
    is_title = False
    if len(text) < 100 and not text.endswith('.'):
        lower = text.lower()
        if any(x in lower for x in ['capitolo', 'chapter', 'introduzione', 'prefazione', 'indice', 'conclusioni', 'bibliografia']):
            is_title = True
        elif text.isupper():
            is_title = True
    
    p = doc.add_paragraph(text)
    
    if is_title:
        p.style = doc.styles['Heading 1']
    else:
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(12)

# Save
doc.save(OUTPUT_DOCX)
print(f"✅ FILE SALVATO: {OUTPUT_DOCX}")
print("Missione Compiuta.")
