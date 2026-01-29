#!/usr/bin/env python3
"""
🚨 TRANSLATION REVISION PIPELINE v2.0 🚨

⛔ MAI USARE TOKEN CLAUDE PER TRADUZIONI/REVISIONI ⛔
⛔ QUESTO SCRIPT USA SOLO MODELLI LOCALI (Ollama) ⛔

Pipeline 5 Cicli:
  1. RILETTTORE → errori grossolani, senso
  2. REVISORE → fedeltà all'originale
  3. GRAMMATICO → grammatica italiana perfetta
  4. ANTI-SLOP → naturalezza, no "AI-speak"
  5. FORMATTATORE → encoding UTF-8, punteggiatura

Fix v2:
  - Processa PARAGRAFO PER PARAGRAFO (no timeout)
  - Traccia tempi per ogni ciclo
  - Output incrementale
  
Casa Editrice AI - FreeRiverHouse/Onde
"""

import subprocess
import json
import sys
import os
import time
import re
from pathlib import Path
from datetime import datetime

# ⛔ CONFIGURAZIONE - SOLO MODELLI LOCALI ⛔
OLLAMA_MODEL = "llama3:70b"
MAX_PARAGRAPH_CHARS = 500  # Paragrafi piccoli = no timeout

WARNING = """
╔═══════════════════════════════════════════════════════════════╗
║  ⛔ ATTENZIONE: QUESTO SCRIPT NON USA MAI TOKEN CLAUDE ⛔     ║
║  Usa SOLO Ollama con llama3:70b locale                        ║
╚═══════════════════════════════════════════════════════════════╝
"""

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

def ollama_generate(prompt: str, timeout: int = 120) -> str:
    """Chiama Ollama locale con timeout corto"""
    try:
        result = subprocess.run(
            ["ollama", "run", OLLAMA_MODEL],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        return "[TIMEOUT]"
    except Exception as e:
        return f"[ERRORE: {e}]"

def split_paragraphs(text: str) -> list:
    """Divide testo in paragrafi gestibili"""
    # Split by double newline or single newline
    paragraphs = re.split(r'\n\n+', text)
    
    result = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        # Se paragrafo troppo lungo, splitta per frasi
        if len(p) > MAX_PARAGRAPH_CHARS:
            sentences = re.split(r'(?<=[.!?])\s+', p)
            current = ""
            for s in sentences:
                if len(current) + len(s) < MAX_PARAGRAPH_CHARS:
                    current += " " + s if current else s
                else:
                    if current:
                        result.append(current.strip())
                    current = s
            if current:
                result.append(current.strip())
        else:
            result.append(p)
    
    return result

# ═══════════════════════════════════════════════════════════════
# AGENTI REVISIONE
# ═══════════════════════════════════════════════════════════════

def ciclo_1_riletttore(paragraph: str) -> str:
    """Ciclo 1: Errori grossolani e senso"""
    prompt = f"""Correggi SOLO errori grossolani in questa traduzione italiana.
NON riscrivere tutto. Solo fix errori evidenti.
Rispondi SOLO con il testo corretto, nient'altro.

TESTO:
{paragraph}

TESTO CORRETTO:"""
    return ollama_generate(prompt, timeout=60)

def ciclo_2_revisore(original: str, translation: str) -> str:
    """Ciclo 2: Fedeltà all'originale"""
    prompt = f"""Confronta traduzione con originale. Correggi SOLO infedeltà.
NON cambiare stile. Solo fix significato sbagliato.
Rispondi SOLO con il testo corretto.

ORIGINALE:
{original}

TRADUZIONE:
{translation}

TRADUZIONE CORRETTA:"""
    return ollama_generate(prompt, timeout=60)

def ciclo_3_grammatico(paragraph: str) -> str:
    """Ciclo 3: Grammatica perfetta"""
    prompt = f"""Correggi SOLO errori grammaticali in questo testo italiano.
Verbi, concordanze, preposizioni, articoli.
Rispondi SOLO con il testo corretto.

TESTO:
{paragraph}

TESTO CORRETTO:"""
    return ollama_generate(prompt, timeout=60)

def ciclo_4_antislop(paragraph: str) -> str:
    """Ciclo 4: Anti-slop, naturalezza"""
    prompt = f"""Rendi questo testo più naturale in italiano.
Elimina frasi robotiche, traduzioni letterali goffe.
Mantieni significato. Rispondi SOLO con il testo.

TESTO:
{paragraph}

TESTO NATURALE:"""
    return ollama_generate(prompt, timeout=60)

def ciclo_5_formattatore(paragraph: str) -> str:
    """Ciclo 5: Encoding e punteggiatura"""
    # Fix encoding issues programmatically first
    fixes = {
        'â€™': "'",
        'â€œ': '"',
        'â€': '"',
        'â€"': '—',
        'â€"': '–',
        'Ã ': 'à',
        'Ã¨': 'è',
        'Ã¬': 'ì',
        'Ã²': 'ò',
        'Ã¹': 'ù',
        'Ã©': 'é',
        'Ã': 'à',
        '  ': ' ',
    }
    
    result = paragraph
    for bad, good in fixes.items():
        result = result.replace(bad, good)
    
    # LLM per fix rimanenti
    prompt = f"""Sistema punteggiatura e spazi in questo testo italiano.
Rispondi SOLO con il testo sistemato.

TESTO:
{result}

TESTO SISTEMATO:"""
    
    llm_result = ollama_generate(prompt, timeout=30)
    
    # Se timeout, ritorna fix programmatico
    if "[TIMEOUT]" in llm_result or "[ERRORE" in llm_result:
        return result
    return llm_result

# ═══════════════════════════════════════════════════════════════
# PIPELINE PRINCIPALE
# ═══════════════════════════════════════════════════════════════

def run_pipeline(original_file: str, translation_file: str, output_dir: str):
    """
    Pipeline completa 5 cicli con tracking tempi
    """
    print(WARNING)
    
    # Setup output
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Load files
    log("📂 Caricamento file...")
    with open(original_file, 'r', encoding='utf-8') as f:
        original = f.read()
    with open(translation_file, 'r', encoding='utf-8') as f:
        translation = f.read()
    
    # Split in paragraphs
    orig_paragraphs = split_paragraphs(original)
    trans_paragraphs = split_paragraphs(translation)
    
    log(f"   Paragrafi originale: {len(orig_paragraphs)}")
    log(f"   Paragrafi traduzione: {len(trans_paragraphs)}")
    
    # Limit for testing (primi 20 paragrafi)
    MAX_PARAGRAPHS = 20
    orig_paragraphs = orig_paragraphs[:MAX_PARAGRAPHS]
    trans_paragraphs = trans_paragraphs[:MAX_PARAGRAPHS]
    
    # Tracking
    metrics = {
        "start_time": datetime.now().isoformat(),
        "cycles": {},
        "paragraphs_processed": len(trans_paragraphs)
    }
    
    current_text = trans_paragraphs.copy()
    
    # ═══════════════════════════════════════════════════════════
    # CICLO 1: RILETTTORE
    # ═══════════════════════════════════════════════════════════
    log("═" * 50)
    log("📍 CICLO 1: RILETTTORE (errori grossolani)")
    log("═" * 50)
    
    cycle_start = time.time()
    for i, para in enumerate(current_text):
        log(f"   [{i+1}/{len(current_text)}] {para[:30]}...")
        result = ciclo_1_riletttore(para)
        if not result.startswith("["):
            current_text[i] = result
    
    metrics["cycles"]["1_riletttore"] = {
        "duration_sec": round(time.time() - cycle_start, 1),
        "agent": "RILETTTORE",
        "focus": "errori grossolani"
    }
    
    # Save checkpoint
    with open(output_path / "checkpoint_ciclo1.txt", 'w', encoding='utf-8') as f:
        f.write("\n\n".join(current_text))
    log(f"   ✓ Checkpoint salvato ({metrics['cycles']['1_riletttore']['duration_sec']}s)")
    
    # ═══════════════════════════════════════════════════════════
    # CICLO 2: REVISORE
    # ═══════════════════════════════════════════════════════════
    log("═" * 50)
    log("📍 CICLO 2: REVISORE (fedeltà originale)")
    log("═" * 50)
    
    cycle_start = time.time()
    for i, (orig, trans) in enumerate(zip(orig_paragraphs, current_text)):
        log(f"   [{i+1}/{len(current_text)}] confronto...")
        result = ciclo_2_revisore(orig, trans)
        if not result.startswith("["):
            current_text[i] = result
    
    metrics["cycles"]["2_revisore"] = {
        "duration_sec": round(time.time() - cycle_start, 1),
        "agent": "REVISORE", 
        "focus": "fedeltà originale"
    }
    
    with open(output_path / "checkpoint_ciclo2.txt", 'w', encoding='utf-8') as f:
        f.write("\n\n".join(current_text))
    log(f"   ✓ Checkpoint salvato ({metrics['cycles']['2_revisore']['duration_sec']}s)")
    
    # ═══════════════════════════════════════════════════════════
    # CICLO 3: GRAMMATICO
    # ═══════════════════════════════════════════════════════════
    log("═" * 50)
    log("📍 CICLO 3: GRAMMATICO (grammatica perfetta)")
    log("═" * 50)
    
    cycle_start = time.time()
    for i, para in enumerate(current_text):
        log(f"   [{i+1}/{len(current_text)}]")
        result = ciclo_3_grammatico(para)
        if not result.startswith("["):
            current_text[i] = result
    
    metrics["cycles"]["3_grammatico"] = {
        "duration_sec": round(time.time() - cycle_start, 1),
        "agent": "GRAMMATICO",
        "focus": "grammatica italiana"
    }
    
    with open(output_path / "checkpoint_ciclo3.txt", 'w', encoding='utf-8') as f:
        f.write("\n\n".join(current_text))
    log(f"   ✓ Checkpoint salvato ({metrics['cycles']['3_grammatico']['duration_sec']}s)")
    
    # ═══════════════════════════════════════════════════════════
    # CICLO 4: ANTI-SLOP
    # ═══════════════════════════════════════════════════════════
    log("═" * 50)
    log("📍 CICLO 4: ANTI-SLOP (naturalezza)")
    log("═" * 50)
    
    cycle_start = time.time()
    for i, para in enumerate(current_text):
        log(f"   [{i+1}/{len(current_text)}]")
        result = ciclo_4_antislop(para)
        if not result.startswith("["):
            current_text[i] = result
    
    metrics["cycles"]["4_antislop"] = {
        "duration_sec": round(time.time() - cycle_start, 1),
        "agent": "ANTI-SLOP",
        "focus": "naturalezza italiano"
    }
    
    with open(output_path / "checkpoint_ciclo4.txt", 'w', encoding='utf-8') as f:
        f.write("\n\n".join(current_text))
    log(f"   ✓ Checkpoint salvato ({metrics['cycles']['4_antislop']['duration_sec']}s)")
    
    # ═══════════════════════════════════════════════════════════
    # CICLO 5: FORMATTATORE
    # ═══════════════════════════════════════════════════════════
    log("═" * 50)
    log("📍 CICLO 5: FORMATTATORE (encoding UTF-8)")
    log("═" * 50)
    
    cycle_start = time.time()
    for i, para in enumerate(current_text):
        log(f"   [{i+1}/{len(current_text)}]")
        result = ciclo_5_formattatore(para)
        if not result.startswith("["):
            current_text[i] = result
    
    metrics["cycles"]["5_formattatore"] = {
        "duration_sec": round(time.time() - cycle_start, 1),
        "agent": "FORMATTATORE",
        "focus": "encoding, punteggiatura"
    }
    
    # ═══════════════════════════════════════════════════════════
    # OUTPUT FINALE
    # ═══════════════════════════════════════════════════════════
    metrics["end_time"] = datetime.now().isoformat()
    metrics["total_duration_sec"] = sum(c["duration_sec"] for c in metrics["cycles"].values())
    
    # Save final text
    final_text = "\n\n".join(current_text)
    with open(output_path / "traduzione_finale.txt", 'w', encoding='utf-8') as f:
        f.write(final_text)
    
    # Save metrics
    with open(output_path / "metrics.json", 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "═" * 50)
    print("📊 SOMMARIO PIPELINE")
    print("═" * 50)
    print(f"Paragrafi processati: {metrics['paragraphs_processed']}")
    print(f"Tempo totale: {metrics['total_duration_sec']:.1f}s")
    print("\nTempi per ciclo:")
    for name, data in metrics["cycles"].items():
        print(f"  {name}: {data['duration_sec']}s")
    print(f"\nOutput: {output_path}/")
    print(WARNING)
    
    return metrics, final_text


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(f"Uso: {sys.argv[0]} <originale.txt> <traduzione.md> <output_dir>")
        sys.exit(1)
    
    run_pipeline(sys.argv[1], sys.argv[2], sys.argv[3])
