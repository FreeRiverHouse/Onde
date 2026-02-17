#!/usr/bin/env python3
"""
🚨 TRANSLATION REVISION PIPELINE 🚨

⛔ MAI USARE TOKEN CLAUDE PER TRADUZIONI/REVISIONI ⛔
⛔ QUESTO SCRIPT USA SOLO MODELLI LOCALI (Ollama llama3:70b) ⛔

Pipeline:
  Ciclo 1: RILETTTORE → REVISORE
  Ciclo 2: RILETTTORE → REVISORE
  
Confronta originale ↔ traduzione per ogni passaggio.
"""

import subprocess
import json
import sys
import os
from pathlib import Path
from datetime import datetime

# ⛔ CONFIGURAZIONE - SOLO MODELLI LOCALI ⛔
OLLAMA_MODEL = "llama3:70b"  # Modello locale su M4
OLLAMA_HOST = "http://localhost:11434"

# ⛔ AVVISO CRITICO ⛔
WARNING = """
╔═══════════════════════════════════════════════════════════════╗
║  ⛔ ATTENZIONE: QUESTO SCRIPT NON USA MAI TOKEN CLAUDE ⛔     ║
║  Usa SOLO Ollama con llama3:70b locale su M4                  ║
║  Se vedi chiamate a Claude API = BUG CRITICO                  ║
╚═══════════════════════════════════════════════════════════════╝
"""

def log(msg):
    """Log con timestamp"""
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")

def ollama_generate(prompt, system_prompt=""):
    """Chiama Ollama locale - MAI API esterne"""
    cmd = ["ollama", "run", OLLAMA_MODEL]
    
    full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
    
    try:
        result = subprocess.run(
            cmd,
            input=full_prompt,
            capture_output=True,
            text=True,
            timeout=300  # 5 min timeout
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        return "[TIMEOUT - risposta troppo lunga]"
    except Exception as e:
        return f"[ERRORE: {e}]"


def riletttore(original: str, translation: str, cycle: int) -> dict:
    """
    Agente RILETTTORE (Proofreader)
    Controlla errori grammaticali e completezza
    """
    log(f"🔍 RILETTTORE - Ciclo {cycle}")
    
    system = """Sei un riletttore professionista italiano.
Il tuo compito è controllare la traduzione per:
1. Errori grammaticali
2. Errori ortografici
3. Punteggiatura mancante o errata
4. Frasi incomplete o mancanti rispetto all'originale
5. Parole non tradotte

Rispondi in formato JSON:
{
  "errori_trovati": [...],
  "suggerimenti": [...],
  "testo_corretto": "...",
  "completezza": "percentuale stimata"
}"""

    prompt = f"""ORIGINALE (inglese):
{original[:2000]}

TRADUZIONE (italiano):
{translation[:2000]}

Analizza e correggi."""

    response = ollama_generate(prompt, system)
    
    # Parse response
    try:
        # Try to extract JSON from response
        if "{" in response and "}" in response:
            json_start = response.index("{")
            json_end = response.rindex("}") + 1
            return json.loads(response[json_start:json_end])
    except:
        pass
    
    return {
        "errori_trovati": [],
        "suggerimenti": [response],
        "testo_corretto": translation,
        "completezza": "unknown"
    }


def revisore(original: str, translation: str, cycle: int) -> dict:
    """
    Agente REVISORE (Editor)
    Controlla fedeltà, stile, fluidità
    """
    log(f"✏️  REVISORE - Ciclo {cycle}")
    
    system = """Sei un revisore editoriale professionista.
Il tuo compito è controllare la traduzione per:
1. Fedeltà al significato dell'originale
2. Stile e registro appropriati
3. Fluidità e naturalezza in italiano
4. Terminologia tecnica corretta
5. Coerenza interna

Rispondi in formato JSON:
{
  "problemi_stile": [...],
  "problemi_fedelta": [...],
  "suggerimenti_miglioramento": [...],
  "testo_rivisto": "...",
  "qualita_stimata": "1-10"
}"""

    prompt = f"""ORIGINALE (inglese):
{original[:2000]}

TRADUZIONE (italiano):
{translation[:2000]}

Rivedi e migliora."""

    response = ollama_generate(prompt, system)
    
    # Parse response
    try:
        if "{" in response and "}" in response:
            json_start = response.index("{")
            json_end = response.rindex("}") + 1
            return json.loads(response[json_start:json_end])
    except:
        pass
    
    return {
        "problemi_stile": [],
        "problemi_fedelta": [],
        "suggerimenti_miglioramento": [response],
        "testo_rivisto": translation,
        "qualita_stimata": "unknown"
    }


def run_pipeline(original_file: str, translation_file: str, output_file: str):
    """
    Esegue pipeline completa: 2 cicli di RILETTTORE → REVISORE
    """
    print(WARNING)
    
    log("📂 Caricamento file...")
    
    with open(original_file, 'r') as f:
        original = f.read()
    
    with open(translation_file, 'r') as f:
        translation = f.read()
    
    log(f"   Originale: {len(original)} caratteri")
    log(f"   Traduzione: {len(translation)} caratteri")
    
    # Dividi in chunk se troppo lungo
    chunk_size = 2000
    original_chunks = [original[i:i+chunk_size] for i in range(0, len(original), chunk_size)]
    translation_chunks = [translation[i:i+chunk_size] for i in range(0, len(translation), chunk_size)]
    
    results = {
        "ciclo_1": {"riletttore": [], "revisore": []},
        "ciclo_2": {"riletttore": [], "revisore": []},
        "finale": ""
    }
    
    current_translation = translation
    
    # CICLO 1
    log("═" * 50)
    log("📍 CICLO 1 DI REVISIONE")
    log("═" * 50)
    
    for i, (orig_chunk, trans_chunk) in enumerate(zip(original_chunks[:5], translation_chunks[:5])):
        log(f"   Chunk {i+1}/5...")
        r1 = riletttore(orig_chunk, trans_chunk, 1)
        results["ciclo_1"]["riletttore"].append(r1)
        
        r2 = revisore(orig_chunk, trans_chunk, 1)
        results["ciclo_1"]["revisore"].append(r2)
    
    # CICLO 2
    log("═" * 50)
    log("📍 CICLO 2 DI REVISIONE")
    log("═" * 50)
    
    for i, (orig_chunk, trans_chunk) in enumerate(zip(original_chunks[:5], translation_chunks[:5])):
        log(f"   Chunk {i+1}/5...")
        r1 = riletttore(orig_chunk, trans_chunk, 2)
        results["ciclo_2"]["riletttore"].append(r1)
        
        r2 = revisore(orig_chunk, trans_chunk, 2)
        results["ciclo_2"]["revisore"].append(r2)
    
    # Salva report
    log("═" * 50)
    log("💾 Salvataggio report...")
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    log(f"✅ Report salvato: {output_file}")
    
    # Sommario
    print("\n" + "═" * 50)
    print("📊 SOMMARIO REVISIONE")
    print("═" * 50)
    print(f"Cicli completati: 2")
    print(f"Chunk analizzati: {min(5, len(original_chunks))}")
    print(f"Report: {output_file}")
    print(WARNING)
    
    return results


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(f"Uso: {sys.argv[0]} <originale.txt> <traduzione.md> <output-report.json>")
        print("\nEsempio:")
        print(f"  {sys.argv[0]} traduzioni/la-repubblica-innovazione-EN_originale.txt \\")
        print(f"                traduzioni/la-repubblica-innovazione-IT_claude-opus.md \\")
        print(f"                traduzioni/revision-report.json")
        sys.exit(1)
    
    run_pipeline(sys.argv[1], sys.argv[2], sys.argv[3])
