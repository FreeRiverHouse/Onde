
import subprocess
import time
import requests
import os
import signal
import sys

# CONFIG
MLX_SERVER_SCRIPT = "tools/translation-mlx/mlx_server.py"
ENV_ACTIVATE = "source ~/mlx-env/bin/activate" 
PORT = 8765

PARA_454_TEXT = """Shedding both approaches, neoclassical theory pictures the economy as the web of interactions of a mass of equivalent agents, that can be reduced to one simplifying portrait (the so-called homo economicus, who has rational preferences and self-interestedly maximizes utility): their different endowments of capital or labour determine their incomes, but do not make them different from each other. In models built on these foundations power asymmetries find no room. Few neoclassical economists did or do stop there, of course, but for decades followers of elementary courses in economics have learnt little more. That portrait was thus deposited in our popular culture, next to non-interference."""

def cleanup():
    print("Cleaning up old processes...")
    subprocess.run("pkill -9 -f mlx_server", shell=True)
    subprocess.run("pkill -9 -f repair_v5", shell=True)
    time.sleep(2)

def start_server():
    print("Starting MLX Server...")
    # We use Popen to keep it running
    # Note: We assume python3 is the one in the env or we call it directly
    cmd = f"python3 {MLX_SERVER_SCRIPT}"
    proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return proc

def wait_for_server():
    print("Waiting for server to be ready...")
    for i in range(30):
        try:
            r = requests.get(f"http://localhost:{PORT}/v1/models", timeout=2)
            if r.status_code == 200:
                print("Server is UP!")
                return True
        except:
            pass
        print(f"Waiting... {i}/30")
        time.sleep(2)
    return False

def translate_text(text):
    print("Translating paragraph...")
    prompt = f"Translate into Italian:\n\n{text}\n\nTranslation:"
    try:
        r = requests.post(f"http://localhost:{PORT}/generate", 
                          json={"prompt": prompt, "max_tokens": 500, "temp": 0.0}, 
                          timeout=60)
        if r.status_code == 200:
            return r.json()["result"].strip()
    except Exception as e:
        print(f"Translation Failed: {e}")
    return None

def merge_and_finalize(translation_454):
    print("Merging and Finalizing...")
    base = "tools/translation-mlx/capussela_output"
    
    # Read V5
    try:
        with open(f"{base}/traduzione_FINAL_V5.txt", "r") as f:
            v5_paras = f.read().split("\n\n")
    except:
        print("CRITICAL: V5 file not found")
        return

    # PATCH PARA 454
    if translation_454:
        print(f"Patching Para 454...")
        # Check if v5 has enough paras, otherwise append
        while len(v5_paras) <= 454:
            v5_paras.append("")
        v5_paras[454] = translation_454
    
    # Read Original for Tail
    try:
        with open(f"{base}/traduzione_finale.txt", "r") as f:
            orig_paras = f.read().split("\n\n")
        
        if len(orig_paras) > len(v5_paras):
            print(f"Appending {len(orig_paras)-len(v5_paras)} tail paragraphs...")
            v5_paras.extend(orig_paras[len(v5_paras):])
            
    except:
        print("Original file warning (tail might be missing)")

    # Save Merged
    merged_path = f"{base}/traduzione_COMPLETA_FINAL.txt"
    with open(merged_path, "w") as f:
        f.write("\n\n".join(v5_paras))
    
    # Generate DOCX (Native Fallback)
    docx_path = f"{base}/Capussela_Traduzione_FINAL.docx"
    print(f"Generating DOCX at {docx_path}")
    subprocess.run(["textutil", "-convert", "docx", "-output", docx_path, merged_path])
    print("DONE.")

def main():
    cleanup()
    
    # 1. Start Server
    srv_proc = start_server()
    
    # 2. Add corrections for other known issues (SLOP)
    # (We can do this while waiting for server or after)
    
    # 3. Wait & Translate
    trans_454 = None
    if wait_for_server():
        trans_454 = translate_text(PARA_454_TEXT)
        print(f"Translated 454: {trans_454[:50]}...")
    else:
        print("Server failed to start in time. proceeding without fresh translation (using placeholder).")
        trans_454 = "[MANUAL TRANSLATION REQUIRED FOR PARA 454]"

    # 4. Stop Server
    srv_proc.kill()
    subprocess.run("pkill -9 -f mlx_server", shell=True)

    # 5. Finalize
    merge_and_finalize(trans_454)

if __name__ == "__main__":
    main()
