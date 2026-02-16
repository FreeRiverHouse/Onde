#!/usr/bin/env python3
import subprocess
import time
import sys

print("=== DIAGNOSTIC START ===", flush=True)
print("1. Killing old processes...", flush=True)
subprocess.run("pkill -9 -f mlx_server", shell=True)
subprocess.run("pkill -9 -f repair_v5", shell=True)
time.sleep(2)

print("2. Checking if MLX server script exists...", flush=True)
import os
if os.path.exists("tools/translation-mlx/mlx_server.py"):
    print("   ✓ MLX server script found", flush=True)
else:
    print("   ✗ MLX server script NOT found", flush=True)
    sys.exit(1)

print("3. Starting MLX server...", flush=True)
proc = subprocess.Popen(
    ["python3", "tools/translation-mlx/mlx_server.py"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)
print(f"   ✓ Server process started (PID: {proc.pid})", flush=True)

print("4. Waiting 5 seconds...", flush=True)
time.sleep(5)

print("5. Checking if server process is still alive...", flush=True)
if proc.poll() is None:
    print("   ✓ Server is still running", flush=True)
else:
    print("   ✗ Server died. Exit code:", proc.poll(), flush=True)
    stdout, stderr = proc.communicate()
    print("STDOUT:", stdout.decode(), flush=True)
    print("STDERR:", stderr.decode(), flush=True)
    sys.exit(1)

print("6. Testing server connection...", flush=True)
try:
    import requests
    r = requests.get("http://localhost:8765/v1/models", timeout=5)
    if r.status_code == 200:
        print("   ✓ Server is responding!", flush=True)
    else:
        print(f"   ✗ Server returned status {r.status_code}", flush=True)
except Exception as e:
    print(f"   ✗ Connection failed: {e}", flush=True)

print("7. Killing server...", flush=True)
proc.kill()

print("=== DIAGNOSTIC COMPLETE ===", flush=True)
