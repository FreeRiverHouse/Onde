#!/usr/bin/env python3
"""
gpu-status.py - Get detailed GPU status for dashboard
Uses SystemMonitor from dispatcher.py for consistent data.

Output: JSON with GPU metrics
Usage: python3 scripts/gpu-status.py
"""

import json
import subprocess
import sys
from pathlib import Path

# Add tools/agentic to path for SystemMonitor
sys.path.insert(0, str(Path(__file__).parent.parent / "tools" / "agentic"))

try:
    from dispatcher import SystemMonitor
    HAS_MONITOR = True
except ImportError:
    HAS_MONITOR = False


def get_radeon_status() -> dict:
    """Check if Radeon eGPU is connected and get details."""
    try:
        result = subprocess.run(
            ["system_profiler", "SPThunderboltDataType"],
            capture_output=True, text=True, timeout=5
        )
        connected = "Core X V2" in result.stdout or "Radeon" in result.stdout
        
        # Get more details from SPDisplaysDataType
        display_result = subprocess.run(
            ["system_profiler", "SPDisplaysDataType"],
            capture_output=True, text=True, timeout=5
        )
        
        vram = None
        model = None
        if connected:
            for line in display_result.stdout.split('\n'):
                if 'Vendor: AMD' in line or 'AMD' in line:
                    model = "Radeon 7900 XTX"  # Known config
                if 'VRAM' in line:
                    # Try to parse VRAM
                    parts = line.split(':')
                    if len(parts) > 1:
                        vram = parts[1].strip()
        
        return {
            "connected": connected,
            "model": model,
            "vram": vram or ("24 GB" if connected else None),
            "status": "available" if connected else "disconnected"
        }
    except Exception as e:
        return {"connected": False, "error": str(e)}


def get_system_metrics() -> dict:
    """Get CPU/Memory metrics via SystemMonitor or fallback."""
    metrics = {
        "cpu_percent": 0.0,
        "memory_percent": 0.0,
        "gpu_temp": None,
        "health_status": "unknown"
    }
    
    if HAS_MONITOR:
        try:
            monitor = SystemMonitor()
            metrics["cpu_percent"] = round(monitor.get_cpu_usage(), 1)
            metrics["memory_percent"] = round(monitor.get_memory_usage(), 1)
            metrics["gpu_temp"] = monitor.get_gpu_temperature()
            health = monitor.check_health()
            metrics["health_status"] = health.get("status", "unknown")
        except Exception as e:
            metrics["error"] = str(e)
    else:
        # Fallback: use ps and vm_stat
        try:
            import psutil
            metrics["cpu_percent"] = round(psutil.cpu_percent(interval=0.1), 1)
            metrics["memory_percent"] = round(psutil.virtual_memory().percent, 1)
        except ImportError:
            pass
    
    return metrics


def get_ollama_status() -> dict:
    """Check Ollama status and loaded models."""
    import urllib.request
    
    result = {
        "local": {"running": False, "models": []},
        "remote": {"running": False, "models": [], "host": "192.168.1.111"}
    }
    
    # Check local
    try:
        with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=2) as resp:
            data = json.loads(resp.read())
            result["local"]["running"] = True
            result["local"]["models"] = [m["name"] for m in data.get("models", [])]
    except:
        pass
    
    # Check remote (Radeon box)
    try:
        with urllib.request.urlopen("http://192.168.1.111:11434/api/tags", timeout=2) as resp:
            data = json.loads(resp.read())
            result["remote"]["running"] = True
            result["remote"]["models"] = [m["name"] for m in data.get("models", [])]
    except:
        pass
    
    return result


def main():
    """Generate complete GPU status JSON."""
    from datetime import datetime, timezone
    
    status = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "radeon": get_radeon_status(),
        "system": get_system_metrics(),
        "ollama": get_ollama_status()
    }
    
    print(json.dumps(status, indent=2))


if __name__ == "__main__":
    main()
