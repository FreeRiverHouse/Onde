#!/usr/bin/env python3
"""
🚀 TRANSLATION PIPELINE MLX - BOMPROOF v10.0 🚀

QWEN-ONLY SEMPLIFICATO (solo /translate che già fa tutto!)
  FASE 0: Qwen → Traduzione + Revisione (via /translate con pulizia integrata)
  FASE 1: Formattazione finale

NOTA: /translate già include revisione e pulizia output.
      La fase grammatica via /generate produceva garbage, quindi ELIMINATA.

Casa Editrice Onde - FreeRiverHouse
"""

import sys
import os
import gc
import time
import re
import requests
import subprocess
import signal
from pathlib import Path
from datetime import datetime

# ═══════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════

SERVER_URL = "http://localhost:8765"
SERVER_SCRIPT = Path.home() / "CascadeProjects/Onde/traduzioni/translator-system/mlx_server.py"

MAX_PARA_CHARS = 1000  # Max chars per paragraph
LOG_FILE = Path("/tmp/bomproof_v10.log")
_server_process = None

# ═══════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except:
        pass

# ═══════════════════════════════════════════════════════════════
# PARAGRAPH SPLITTING (from v9 - WORKING!)
# ═══════════════════════════════════════════════════════════════

def split_paragraphs(text: str, max_chars: int = MAX_PARA_CHARS) -> list:
    """Split text into manageable paragraphs"""
    # First split on double newlines
    blocks = re.split(r'\n\n+', text)

    result = []
    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Then split on single newlines (lines within a block)
        lines = block.split('\n')

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # If line is too long, split by sentences
            if len(line) > max_chars:
                sentences = re.split(r'(?<=[.!?])\s+', line)
                current = ""
                for s in sentences:
                    if len(current) + len(s) < max_chars:
                        current += " " + s if current else s
                    else:
                        if current:
                            result.append(current.strip())
                        current = s
                if current:
                    result.append(current.strip())
            else:
                result.append(line)

    return result

# ═══════════════════════════════════════════════════════════════
# TITLE TRANSLATIONS (fast lookup, no LLM needed)
# ═══════════════════════════════════════════════════════════════

TITLE_TRANSLATIONS = {
    "freedom": "Libertà",
    "innovation": "Innovazione",
    "plan": "Piano",
    "introduction": "Introduzione",
    "conclusion": "Conclusione",
    "chapter": "Capitolo",
    "section": "Sezione",
    "part": "Parte",
    "preface": "Prefazione",
    "foreword": "Prefazione",
    "epilogue": "Epilogo",
    "prologue": "Prologo",
    "appendix": "Appendice",
    "notes": "Note",
    "bibliography": "Bibliografia",
    "references": "Riferimenti",
    "acknowledgments": "Ringraziamenti",
    "summary": "Sommario",
    "abstract": "Abstract",
    "contents": "Indice",
    "index": "Indice",
}

def translate_title(text: str) -> str:
    """Translate common titles without LLM"""
    text_lower = text.strip().lower()
    if text_lower in TITLE_TRANSLATIONS:
        return TITLE_TRANSLATIONS[text_lower]
    # Check for "Chapter X" pattern
    if text_lower.startswith("chapter "):
        return "Capitolo " + text[8:]
    if text_lower.startswith("section "):
        return "Sezione " + text[8:]
    if text_lower.startswith("part "):
        return "Parte " + text[5:]
    return None  # Not a known title

# ═══════════════════════════════════════════════════════════════
# OUTPUT VALIDATION
# ═══════════════════════════════════════════════════════════════

def is_italian(text: str) -> bool:
    if not text or len(text) < 10:
        return False
    en_words = ["the", "and", "for", "with", "that", "this", "from", "have",
                "been", "are", "was", "were", "will", "would", "which"]
    words = text.lower().split()
    if len(words) < 5:
        return True
    en_count = sum(1 for w in words if w in en_words)
    return en_count <= len(words) * 0.15

# ═══════════════════════════════════════════════════════════════
# QWEN SERVER
# ═══════════════════════════════════════════════════════════════

def is_server_running():
    try:
        r = requests.get(f"{SERVER_URL}/health", timeout=3)
        return r.status_code == 200 and r.json().get("qwen_loaded", False)
    except:
        return False

def start_qwen_server():
    global _server_process
    if is_server_running():
        log("✅ Qwen server già attivo")
        return True

    log("🚀 Avvio Qwen server...")
    _server_process = subprocess.Popen(
        [sys.executable, str(SERVER_SCRIPT)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )

    for i in range(60):
        time.sleep(1)
        if is_server_running():
            log("✅ Qwen server pronto!")
            return True
        if i % 10 == 0:
            log(f"   Attendo... ({i}s)")

    log("❌ Server non partito!")
    return False

def stop_qwen_server():
    global _server_process
    log("🛑 Stop Qwen server...")

    pid_file = SERVER_SCRIPT.parent / "server.pid"
    if pid_file.exists():
        try:
            pid = int(pid_file.read_text().strip())
            os.kill(pid, signal.SIGTERM)
        except:
            pass

    subprocess.run(["pkill", "-f", "mlx_server.py"], capture_output=True)
    if _server_process:
        try:
            _server_process.terminate()
            _server_process.wait(timeout=5)
        except:
            pass
        _server_process = None

    gc.collect()
    time.sleep(3)
    log("✅ Server stoppato")

# ═══════════════════════════════════════════════════════════════
# QWEN API - SOLO /translate (funziona!)
# ═══════════════════════════════════════════════════════════════

def qwen_translate(text_en: str) -> str:
    """Traduzione BOMB PROOF - riprova finché non traduce!"""

    # Lista di prompt da provare in ordine
    prompts = [
        # 1. Prompt completo via /translate
        None,  # Usa /translate endpoint
        # 2. Prompt semplice via /generate
        f"Traduci in italiano:\n\n{text_en}\n\n/no_think",
        # 3. Prompt diretto
        f"Traduci questo testo dall'inglese all'italiano. Rispondi SOLO con la traduzione.\n\n{text_en}\n\n/no_think",
        # 4. Prompt minimo
        f"English: {text_en}\n\nItaliano: /no_think",
    ]

    max_attempts = 10  # BOMB PROOF: prova fino a 10 volte

    for attempt in range(max_attempts):
        prompt_idx = min(attempt, len(prompts) - 1)
        prompt = prompts[prompt_idx]

        try:
            if prompt is None:
                # Usa /translate endpoint
                r = requests.post(
                    f"{SERVER_URL}/translate",
                    json={"text": text_en, "revise": True},
                    timeout=120
                )
                if r.status_code == 200:
                    data = r.json()
                    result = data.get("revised") or data.get("translation") or ""
            else:
                # Usa /generate endpoint
                r = requests.post(
                    f"{SERVER_URL}/generate",
                    json={"prompt": prompt, "max_tokens": 800},
                    timeout=120
                )
                if r.status_code == 200:
                    result = r.json().get("result", "")
                    # Pulizia AGGRESSIVA per /generate
                    if "/no_think" in result:
                        result = result.split("/no_think")[-1].strip()
                    # Rimuovi <think>...</think> e tutto il contenuto
                    if "<think>" in result.lower():
                        import re
                        result = re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL|re.IGNORECASE)
                    if "</think>" in result.lower():
                        result = result.split("</think>")[-1].strip()
                    # Rimuovi thinking in inglese
                    thinking_markers = ["let me", "let's see", "okay,", "the user", "i need to", "starting with", "overall,"]
                    for marker in thinking_markers:
                        if marker in result.lower()[:100]:
                            # Probabilmente è thinking, scarta
                            result = ""
                            break
                    # Rimuovi "Risposta:" e simili
                    for prefix in ["risposta:", "traduzione:", "italiano:", "answer:", "translation:"]:
                        if result.lower().startswith(prefix):
                            result = result[len(prefix):].strip()

            if result and is_italian(result) and len(result) > 10:
                return result.strip()
            else:
                log(f"   ⚠️ Attempt {attempt+1}: non italiano, retry...")

        except requests.exceptions.Timeout:
            log(f"   ⚠️ Timeout attempt {attempt+1}")
        except Exception as e:
            log(f"   Errore attempt {attempt+1}: {e}")

        time.sleep(2)

    # ULTIMO FALLBACK: restituisci comunque qualcosa (meglio di niente)
    log(f"   ❌ FALLITO dopo {max_attempts} tentativi!")
    return f"[TRADUZIONE MANCANTE: {text_en[:50]}...]"

# ═══════════════════════════════════════════════════════════════
# FORMATTING
# ═══════════════════════════════════════════════════════════════

def fix_formatting(text: str) -> str:
    fixes = {'â€™': "'", 'â€œ': '«', 'â€': '»', 'â€"': '—', '  ': ' '}
    for bad, good in fixes.items():
        text = text.replace(bad, good)
    return text.strip()

# ═══════════════════════════════════════════════════════════════
# PIPELINE
# ═══════════════════════════════════════════════════════════════

def run_pipeline(input_file: str, output_dir: str):
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║  🚀 TRANSLATION PIPELINE MLX v10.0 - QWEN SEMPLIFICATO            ║
║  📍 Solo /translate (include già traduzione + revisione + pulizia)║
║  📍 Niente fase grammatica (produceva garbage!)                   ║
╚═══════════════════════════════════════════════════════════════════╝
""")

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    LOG_FILE.write_text("")

    log(f"📂 Input: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        original_text = f.read()

    paragraphs = split_paragraphs(original_text)
    total = len(paragraphs)
    log(f"📊 Paragrafi: {total}")

    if not start_qwen_server():
        return None

    start_time = time.time()
    translated = []
    failed = 0

    # ═══════════════════════════════════════════════════════════
    # FASE 0: TRADUZIONE + REVISIONE (unica fase LLM!)
    # ═══════════════════════════════════════════════════════════
    log("═" * 60)
    log("📍 FASE 0: TRADUZIONE + REVISIONE (/translate)")
    log("═" * 60)

    fase_start = time.time()
    for i, para in enumerate(paragraphs, 1):
        # Short paragraphs: try title translation first
        if len(para) < 50:
            title_trans = translate_title(para)
            if title_trans:
                log(f"   [{i}/{total}] Titolo tradotto: '{para}' → '{title_trans}'")
                translated.append(title_trans)
            else:
                log(f"   [{i}/{total}] Breve, mantengo: '{para[:50]}'")
                translated.append(para)
            continue

        log(f"   [{i}/{total}] Traducendo... ({len(para)} chars)")
        result = qwen_translate(para)
        translated.append(result)

        if "[TRADUZIONE MANCANTE" in result:
            failed += 1

        if i == 1:
            log(f"   Tempo primo para: {time.time() - fase_start:.1f}s")

    fase0_time = time.time() - fase_start
    log(f"✅ Fase 0 completata in {fase0_time:.1f}s ({fase0_time/total:.1f}s/para)")
    (output_path / "fase0_traduzione.txt").write_text("\n\n".join(translated), encoding='utf-8')

    stop_qwen_server()

    # ═══════════════════════════════════════════════════════════
    # FASE 1: FORMATTAZIONE (no LLM, solo pulizia caratteri)
    # ═══════════════════════════════════════════════════════════
    log("═" * 60)
    log("📍 FASE 1: FORMATTAZIONE")
    log("═" * 60)

    for i, para in enumerate(translated):
        translated[i] = fix_formatting(para)

    final_text = "\n\n".join(translated)
    final_file = output_path / "traduzione_finale.txt"
    final_file.write_text(final_text, encoding='utf-8')

    total_time = time.time() - start_time

    print(f"""
═══════════════════════════════════════════════════════════════
📊 RISULTATO PIPELINE v10.0
═══════════════════════════════════════════════════════════════
Paragrafi: {total}
Successi: {total - failed}
Fallback: {failed}
Tempo totale: {total_time:.1f}s ({total_time/60:.1f} min)
Tempo per paragrafo: {total_time/total:.1f}s

Output: {final_file}
═══════════════════════════════════════════════════════════════
""")

    return final_text

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(f"Uso: {sys.argv[0]} <input.txt> <output_dir>")
        sys.exit(1)

    run_pipeline(sys.argv[1], sys.argv[2])
