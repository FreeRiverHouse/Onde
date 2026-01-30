#!/usr/bin/env python3
"""
Traduzione completa Capussela: EN → IT via Ollama
Owner: @clawdinho (Radeon GPU)
Model: llama31-8b (fallback) or llama3:70b (preferred)

Based on PROCEDURA-COMPLETA-TRADUZIONE.md v2.0
"""

import os
import sys
import json
import time
import subprocess
import re
from pathlib import Path
from datetime import datetime

# Configuration
INPUT_FILE = "traduzioni/capussela-spirito-EN.txt"
OUTPUT_DIR = Path("traduzioni/capussela-completa")
CHECKPOINTS_DIR = OUTPUT_DIR / "checkpoints"
MODEL = os.environ.get("OLLAMA_MODEL", "llama31-8b:latest")
TIMEOUT_SECONDS = 180  # 3 min per paragraph
COOLDOWN_BETWEEN_CHAPTERS = 300  # 5 min
CPU_THRESHOLD = 80
TEST_MODE = os.environ.get("TEST_MODE", "").lower() == "true"

# Chapter markers
CHAPTER_MARKERS = [
    ("Preface", r"^Preface$"),
    ("Introduction", r"^Introduction$"),
    ("Chapter 1", r"^Chapter 1\."),
    ("Chapter 2", r"^Chapter 2\."),
    ("Chapter 3", r"^Chapter 3\."),
    ("Chapter 4", r"^Chapter 4\."),
    ("Chapter 5", r"^Chapter 5\."),
    ("Chapter 6", r"^Chapter 6\."),
    ("Conclusion", r"^Conclusion$"),
    ("Notes", r"^Notes$"),
    ("References", r"^References$"),
]

def log(msg):
    """Log with timestamp"""
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")
    
def get_cpu_usage():
    """Get current CPU usage"""
    try:
        result = subprocess.run(
            ["top", "-l", "1", "-n", "0"],
            capture_output=True, text=True, timeout=10
        )
        for line in result.stdout.split("\n"):
            if "CPU usage" in line:
                # Parse: "CPU usage: 12.34% user, 5.67% sys, 82.00% idle"
                match = re.search(r"(\d+\.\d+)% user", line)
                if match:
                    return float(match.group(1))
        return 50  # Default if parsing fails
    except:
        return 50

def wait_for_cpu(threshold=CPU_THRESHOLD):
    """Wait until CPU is below threshold"""
    cpu = get_cpu_usage()
    while cpu > threshold:
        log(f"⚠️ CPU at {cpu:.1f}% - waiting 60s...")
        time.sleep(60)
        cpu = get_cpu_usage()
    log(f"✅ CPU at {cpu:.1f}% - proceeding")

def ollama_translate(text, timeout=TIMEOUT_SECONDS):
    """Translate text using Ollama"""
    prompt = f"""Translate the following English text to Italian. 
Keep the same formatting (paragraphs, quotes, etc).
Use Italian quotation marks («»).
Preserve any Greek text unchanged.
Output ONLY the Italian translation, no explanations.

Text to translate:
{text}

Italian translation:"""

    try:
        result = subprocess.run(
            ["ollama", "run", MODEL, prompt],
            capture_output=True, text=True, timeout=timeout
        )
        if result.returncode == 0:
            return result.stdout.strip()
        else:
            log(f"❌ Ollama error: {result.stderr}")
            return f"[TRANSLATION_ERROR: {result.stderr[:100]}]"
    except subprocess.TimeoutExpired:
        log(f"⏱️ Timeout after {timeout}s")
        return "[TIMEOUT]"
    except Exception as e:
        log(f"❌ Exception: {e}")
        return f"[ERROR: {str(e)[:100]}]"

def split_into_chapters(text):
    """Split book into chapters based on markers"""
    lines = text.split("\n")
    chapters = []
    current_chapter = None
    current_lines = []
    
    for line in lines:
        # Check if this line starts a new chapter
        new_chapter = None
        for name, pattern in CHAPTER_MARKERS:
            if re.match(pattern, line.strip()):
                new_chapter = name
                break
        
        if new_chapter:
            # Save previous chapter
            if current_chapter:
                chapters.append((current_chapter, "\n".join(current_lines)))
            current_chapter = new_chapter
            current_lines = [line]
        else:
            current_lines.append(line)
    
    # Save last chapter
    if current_chapter:
        chapters.append((current_chapter, "\n".join(current_lines)))
    
    return chapters

def split_into_paragraphs(text, max_chars=2000):
    """Split text into manageable paragraphs"""
    paragraphs = []
    current = []
    current_len = 0
    
    for line in text.split("\n"):
        if line.strip() == "" and current_len > 0:
            paragraphs.append("\n".join(current))
            current = []
            current_len = 0
        else:
            current.append(line)
            current_len += len(line)
            if current_len > max_chars:
                paragraphs.append("\n".join(current))
                current = []
                current_len = 0
    
    if current:
        paragraphs.append("\n".join(current))
    
    return [p for p in paragraphs if p.strip()]

def translate_chapter(name, text, chapter_num):
    """Translate a single chapter with progress tracking"""
    log(f"📖 Translating {name}...")
    
    paragraphs = split_into_paragraphs(text)
    total = len(paragraphs)
    translated = []
    errors = 0
    
    if TEST_MODE and total > 10:
        log(f"⚠️ TEST_MODE: limiting to 10 paragraphs (was {total})")
        paragraphs = paragraphs[:10]
        total = 10
    
    for i, para in enumerate(paragraphs, 1):
        log(f"  [{i}/{total}] Translating paragraph...")
        result = ollama_translate(para)
        
        if "[TIMEOUT]" in result or "[ERROR]" in result:
            errors += 1
            log(f"  ⚠️ Error on paragraph {i}, keeping original")
            translated.append(para)  # Keep original on error
        else:
            translated.append(result)
        
        # Progress checkpoint every 10 paragraphs
        if i % 10 == 0:
            checkpoint_file = CHECKPOINTS_DIR / f"cap_{chapter_num}_{name}_progress_{i}.txt"
            checkpoint_file.write_text("\n\n".join(translated), encoding="utf-8")
            log(f"  💾 Checkpoint saved: {checkpoint_file.name}")
        
        # Small delay between paragraphs
        time.sleep(2)
    
    # Final save
    chapter_file = OUTPUT_DIR / f"cap_{chapter_num}_{name.replace(' ', '_')}_IT.txt"
    final_text = "\n\n".join(translated)
    chapter_file.write_text(final_text, encoding="utf-8")
    
    log(f"✅ {name} complete: {len(translated)} paragraphs, {errors} errors")
    return final_text, errors

def validate_output(original, translated):
    """Validate translation completeness"""
    orig_bytes = len(original.encode('utf-8'))
    trad_bytes = len(translated.encode('utf-8'))
    ratio = (trad_bytes / orig_bytes) * 100 if orig_bytes > 0 else 0
    
    log(f"📊 Validation: {trad_bytes}/{orig_bytes} bytes ({ratio:.1f}%)")
    
    if ratio < 80:
        log("🚨 FAIL: Translation < 80% of original!")
        return False
    
    # Check for encoding issues
    bad_chars = len(re.findall(r"â€™|Ã|â€|Ã¨|Ã ", translated))
    if bad_chars > 0:
        log(f"⚠️ WARNING: {bad_chars} encoding issues found")
    
    return True

def main():
    log("=" * 60)
    log("🚀 Capussela Translation Pipeline v2.0")
    log(f"📁 Input: {INPUT_FILE}")
    log(f"🤖 Model: {MODEL}")
    log(f"🧪 Test mode: {TEST_MODE}")
    log("=" * 60)
    
    # Setup directories
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    CHECKPOINTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load input
    if not Path(INPUT_FILE).exists():
        log(f"❌ Input file not found: {INPUT_FILE}")
        sys.exit(1)
    
    original_text = Path(INPUT_FILE).read_text(encoding="utf-8")
    log(f"📖 Loaded {len(original_text)} bytes, {len(original_text.splitlines())} lines")
    
    # Split into chapters
    chapters = split_into_chapters(original_text)
    log(f"📚 Found {len(chapters)} chapters: {[c[0] for c in chapters]}")
    
    # Translate each chapter
    all_translations = []
    total_errors = 0
    metrics = {
        "input_file": INPUT_FILE,
        "input_bytes": len(original_text),
        "model": MODEL,
        "started": datetime.now().isoformat(),
        "chapters": [],
        "test_mode": TEST_MODE,
    }
    
    for i, (name, text) in enumerate(chapters, 1):
        # CPU check before each chapter
        wait_for_cpu()
        
        chapter_start = time.time()
        translated, errors = translate_chapter(name, text, i)
        chapter_time = time.time() - chapter_start
        
        all_translations.append(translated)
        total_errors += errors
        
        metrics["chapters"].append({
            "name": name,
            "input_bytes": len(text),
            "output_bytes": len(translated),
            "errors": errors,
            "time_seconds": chapter_time,
        })
        
        # Cooldown between chapters (except last)
        if i < len(chapters):
            log(f"⏳ Cooldown {COOLDOWN_BETWEEN_CHAPTERS}s before next chapter...")
            time.sleep(COOLDOWN_BETWEEN_CHAPTERS)
    
    # Merge all chapters
    final_translation = "\n\n---\n\n".join(all_translations)
    final_file = OUTPUT_DIR / "capussela-spirito-IT-final.txt"
    final_file.write_text(final_translation, encoding="utf-8")
    
    # Validate
    valid = validate_output(original_text, final_translation)
    
    # Save metrics
    metrics["completed"] = datetime.now().isoformat()
    metrics["output_bytes"] = len(final_translation)
    metrics["total_errors"] = total_errors
    metrics["validated"] = valid
    
    metrics_file = OUTPUT_DIR / "metrics.json"
    metrics_file.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    
    log("=" * 60)
    log(f"🎉 Translation {'complete' if valid else 'INCOMPLETE'}!")
    log(f"📄 Output: {final_file}")
    log(f"📊 Metrics: {metrics_file}")
    log(f"❌ Total errors: {total_errors}")
    log("=" * 60)
    
    return 0 if valid else 1

if __name__ == "__main__":
    sys.exit(main())
