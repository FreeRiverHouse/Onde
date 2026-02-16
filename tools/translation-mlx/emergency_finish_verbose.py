
import subprocess
import time
import requests
import os
import signal
import sys
from datetime import datetime

# CONFIG
MLX_SERVER_SCRIPT = "tools/translation-mlx/mlx_server.py"
ENV_ACTIVATE = "source ~/mlx-env/bin/activate" 
PORT = 8765
LOG_FILE = "/tmp/capussela_verbose.log"

PARA_454_TEXT = """Shedding both approaches, neoclassical theory pictures the economy as the web of interactions of a mass of equivalent agents, that can be reduced to one simplifying portrait (the so-called homo economicus, who has rational preferences and self-interestedly maximizes utility): their different endowments of capital or labour determine their incomes, but do not make them different from each other. In models built on these foundations power asymmetries find no room. Few neoclassical economists did or do stop there, of course, but for decades followers of elementary courses in economics have learnt little more. That portrait was thus deposited in our popular culture, next to non-interference."""

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a") as f:
            f.write(line + "\n")
    except:
        pass

def cleanup():
    log("Cleaning up old processes (pkill mlx_server, repair_v5)...")
    subprocess.run("pkill -9 -f mlx_server", shell=True)
    subprocess.run("pkill -9 -f repair_v5", shell=True)
    time.sleep(2)

def start_server():
    log("Starting MLX Server (subprocess)...")
    cmd = f"python3 {MLX_SERVER_SCRIPT}"
    # Use Popen to keep it running, directing output to log
    with open(LOG_FILE, "a") as logf:
        proc = subprocess.Popen(cmd, shell=True, stdout=logf, stderr=logf)
    return proc

def wait_for_server():
    log("Waiting for server to be ready (checking /v1/models)...")
    for i in range(60): # Increased wait time
        try:
            r = requests.get(f"http://localhost:{PORT}/v1/models", timeout=2)
            if r.status_code == 200:
                log("Server is UP and RESPONDING!")
                return True
        except:
            pass
        if i % 5 == 0:
            log(f"Waiting... {i}/60 secs")
        time.sleep(1)
    log("TIMEOUT: Server did not respond.")
    return False

def translate_text(text):
    log("Sending translation request to local server...")
    prompt = f"Translate into Italian:\n\n{text}\n\nTranslation:"
    try:
        r = requests.post(f"http://localhost:{PORT}/generate", 
                          json={"prompt": prompt, "max_tokens": 500, "temp": 0.0}, 
                          timeout=120) # Long timeout for model loading
        if r.status_code == 200:
            res = r.json()["result"].strip()
            log(f"Translation received ({len(res)} chars).")
            return res
        else:
            log(f"Server Error {r.status_code}: {r.text}")
    except Exception as e:
        log(f"Translation Request Failed: {e}")
    return None

def merge_and_finalize(translation_454):
    log("Merging V5 + Corrections + Original Tail...")
    base = "tools/translation-mlx/capussela_output"
    
    # Read V5
    try:
        with open(f"{base}/traduzione_FINAL_V5.txt", "r") as f:
            v5_paras = f.read().split("\n\n")
        log(f"Loaded V5: {len(v5_paras)} paragraphs.")
    except:
        log("CRITICAL: V5 file not found")
        return

    # PATCH PARA 454
    if translation_454:
        log(f"Patching Para 454...")
        while len(v5_paras) <= 454:
            v5_paras.append("")
        v5_paras[454] = translation_454
    
    # Read Original for Tail
    try:
        with open(f"{base}/traduzione_finale.txt", "r") as f:
            orig_paras = f.read().split("\n\n")
        
        if len(orig_paras) > len(v5_paras):
            diff = len(orig_paras)-len(v5_paras)
            log(f"Appending {diff} tail paragraphs from Original...")
            v5_paras.extend(orig_paras[len(v5_paras):])
            
    except:
        log("Original file warning (tail might be missing)")

    # Save Merged
    merged_path = f"{base}/traduzione_COMPLETA_FINAL.txt"
    with open(merged_path, "w") as f:
        f.write("\n\n".join(v5_paras))
    log(f"Merged text saved to: {merged_path}")
    
    # Generate DOCX (Native Fallback)
    docx_path = f"{base}/Capussela_Traduzione_FINAL.docx"
    log(f"Generating DOCX via textutil at {docx_path}...")
    subprocess.run(["textutil", "-convert", "docx", "-output", docx_path, merged_path])
    log("DOCX GENERATION DONE.")

def main():
    # Clear log
    with open(LOG_FILE, "w") as f:
        f.write("--- STARTED EMERGENCY FINISH ---\n")
        
    cleanup()
    
    srv_proc = start_server()
    
    trans_454 = None
    if wait_for_server():
        log("Translating Para 454...")
        trans_454 = translate_text(PARA_454_TEXT)
        if trans_454:
            log(f"Translated 454: {trans_454[:50]}...")
    else:
        log("Server failed to start. Using placeholder.")
        trans_454 = "[MANUAL TRANSLATION REQUIRED FOR PARA 454]"

    log("Stopping server...")
    srv_proc.kill()
    subprocess.run("pkill -9 -f mlx_server", shell=True)

    merge_and_finalize(trans_454)
    log("--- SCRIPT FINISHED ---")

if __name__ == "__main__":
    main()
