#!/usr/bin/env python3
"""
🤖 Agentic Dispatcher - Orchestratore Multi-Agente

Coordina l'esecuzione parallela di task su LLM locali.

Uso:
    from dispatcher import Dispatcher
    
    d = Dispatcher()
    result = d.run("Build a todo API")
    
    # O parallelo:
    results = d.parallel(["Write API", "Write tests", "Write docs"])
"""

import asyncio
import json

# Optional aiohttp for async support
try:
    import aiohttp
    HAS_AIOHTTP = True
except ImportError:
    HAS_AIOHTTP = False
import time
import os
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
from enum import Enum
from datetime import datetime


# ═══════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://192.168.1.111:11434")
MAX_WORKERS = int(os.environ.get("AGENTIC_WORKERS", "4"))
DEFAULT_TIMEOUT = 300  # 5 min per task


class AgentType(Enum):
    CODER = "coder"
    TESTER = "tester"
    DEPLOYER = "deployer"
    RESEARCHER = "researcher"
    GENERAL = "general"


# Model per ogni tipo di agente
AGENT_MODELS = {
    AgentType.CODER: "deepseek-coder:6.7b",
    AgentType.TESTER: "llama31-8b:latest",
    AgentType.DEPLOYER: "llama3.2:3b",
    AgentType.RESEARCHER: "qwen2.5-coder:7b",
    AgentType.GENERAL: "llama3.2:3b",
}

AGENT_PROMPTS = {
    AgentType.CODER: """You are an expert coder. Write clean, working, production-ready code.
Be concise. Only output code unless explanation is specifically requested.
Follow best practices. Handle edge cases.""",

    AgentType.TESTER: """You are an expert QA engineer. Generate comprehensive tests.
Cover edge cases. Use pytest for Python, Jest for JavaScript.
Include both unit tests and integration tests when applicable.""",

    AgentType.DEPLOYER: """You are a DevOps expert. Generate deployment scripts and configs.
Use bash for scripts. Be cautious with destructive operations.
Always include verification steps.""",

    AgentType.RESEARCHER: """You are a technical researcher. Analyze problems deeply.
Provide structured analysis. List pros and cons. Suggest solutions.""",

    AgentType.GENERAL: """You are a helpful AI assistant. Be concise and accurate.""",
}


# ═══════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════

@dataclass
class Task:
    """Rappresenta un task da eseguire."""
    id: str
    prompt: str
    agent_type: AgentType = AgentType.GENERAL
    timeout: int = DEFAULT_TIMEOUT
    context: Dict[str, Any] = field(default_factory=dict)
    priority: int = 5  # 1-10, 1 = highest
    
    def __post_init__(self):
        if not self.id:
            self.id = f"task_{int(time.time() * 1000)}"


@dataclass
class TaskResult:
    """Risultato dell'esecuzione di un task."""
    task_id: str
    success: bool
    output: str
    agent_type: AgentType
    duration_ms: int
    error: Optional[str] = None
    tokens_used: int = 0
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


# ═══════════════════════════════════════════════════════════════
# SYSTEM MONITOR - Protezione CPU/GPU/Temp
# ═══════════════════════════════════════════════════════════════

class SystemMonitor:
    """
    Monitora CPU, temperatura e stato sistema.
    Protegge sia M1+Radeon (Clawdinho) che M4 Pro (Ondinho).
    """
    
    # Limiti di sicurezza
    CPU_THROTTLE_THRESHOLD = 80  # % - rallenta se superiore
    CPU_STOP_THRESHOLD = 95      # % - ferma tutto
    GPU_TEMP_THROTTLE = 85       # °C - rallenta
    GPU_TEMP_STOP = 95           # °C - ferma per sicurezza
    MEMORY_THRESHOLD = 90        # % - avviso memoria
    
    def __init__(self):
        self._psutil_available = False
        self._last_check = 0
        self._check_interval = 5  # secondi tra i check
        
        try:
            import psutil
            self._psutil_available = True
        except ImportError:
            pass
    
    def get_cpu_usage(self) -> float:
        """Ritorna CPU usage percentuale (0-100)."""
        if not self._psutil_available:
            return 0.0
        import psutil
        return psutil.cpu_percent(interval=0.1)
    
    def get_memory_usage(self) -> float:
        """Ritorna memoria usata percentuale (0-100)."""
        if not self._psutil_available:
            return 0.0
        import psutil
        return psutil.virtual_memory().percent
    
    def get_gpu_temperature(self) -> Optional[float]:
        """
        Ritorna temperatura GPU in °C.
        Su macOS: usa powermetrics per GPU Apple Silicon o AMD.
        Ritorna None se non disponibile.
        """
        import subprocess
        import platform
        
        if platform.system() != "Darwin":
            return None
        
        try:
            # Prima prova AMD Radeon (per M1 + eGPU)
            result = subprocess.run(
                ["system_profiler", "SPDisplaysDataType"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if "AMD" in result.stdout or "Radeon" in result.stdout:
                # AMD trovata - prova ioreg per temperatura
                temp_result = subprocess.run(
                    ["ioreg", "-rc", "AppleRadeonController"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                # Cerca pattern temperatura
                import re
                temp_match = re.search(r'"gpu-temperature"\s*=\s*(\d+)', temp_result.stdout)
                if temp_match:
                    return float(temp_match.group(1))
            
            # Fallback: prova thermal zones
            result = subprocess.run(
                ["sudo", "-n", "powermetrics", "--samplers", "smc", "-n", "1", "-i", "100"],
                capture_output=True,
                text=True,
                timeout=3
            )
            import re
            # Cerca GPU die temperature
            temp_match = re.search(r"GPU\s+die\s+temp.*?(\d+\.?\d*)\s*C", result.stdout, re.IGNORECASE)
            if temp_match:
                return float(temp_match.group(1))
            
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
            pass
        
        return None
    
    def check_health(self) -> Dict[str, Any]:
        """
        Check completo della salute del sistema.
        Ritorna dict con status, metrics e se bisogna throttlare/fermare.
        """
        cpu = self.get_cpu_usage()
        memory = self.get_memory_usage()
        gpu_temp = self.get_gpu_temperature()
        
        status = "healthy"
        action = "proceed"
        warnings = []
        
        # Check CPU
        if cpu >= self.CPU_STOP_THRESHOLD:
            status = "critical"
            action = "stop"
            warnings.append(f"CPU critica: {cpu:.1f}%")
        elif cpu >= self.CPU_THROTTLE_THRESHOLD:
            status = "warning"
            action = "throttle"
            warnings.append(f"CPU alta: {cpu:.1f}%")
        
        # Check GPU temperatura
        if gpu_temp is not None:
            if gpu_temp >= self.GPU_TEMP_STOP:
                status = "critical"
                action = "stop"
                warnings.append(f"GPU temperatura critica: {gpu_temp}°C")
            elif gpu_temp >= self.GPU_TEMP_THROTTLE:
                if action != "stop":
                    status = "warning"
                    action = "throttle"
                warnings.append(f"GPU calda: {gpu_temp}°C")
        
        # Check memoria
        if memory >= self.MEMORY_THRESHOLD:
            warnings.append(f"Memoria alta: {memory:.1f}%")
        
        return {
            "status": status,
            "action": action,
            "cpu_percent": cpu,
            "memory_percent": memory,
            "gpu_temp_c": gpu_temp,
            "warnings": warnings,
            "timestamp": datetime.now().isoformat()
        }
    
    def should_proceed(self) -> tuple[bool, str]:
        """
        Check rapido: posso procedere con il task?
        Ritorna (True/False, motivo).
        """
        health = self.check_health()
        
        if health["action"] == "stop":
            return False, f"Sistema in stato critico: {', '.join(health['warnings'])}"
        elif health["action"] == "throttle":
            # Throttle = aspetta un po' poi procedi
            time.sleep(2)
            return True, f"Throttling attivo: {', '.join(health['warnings'])}"
        
        return True, "OK"
    
    def wait_for_cooldown(self, max_wait: int = 60) -> bool:
        """
        Aspetta che il sistema si raffreddi.
        Ritorna True se OK, False se timeout.
        """
        start = time.time()
        while time.time() - start < max_wait:
            health = self.check_health()
            if health["action"] == "proceed":
                return True
            time.sleep(5)
        return False


# Singleton per monitoring globale
_system_monitor = None

def get_system_monitor() -> SystemMonitor:
    """Ritorna l'istanza globale del SystemMonitor."""
    global _system_monitor
    if _system_monitor is None:
        _system_monitor = SystemMonitor()
    return _system_monitor


# ═══════════════════════════════════════════════════════════════
# LLM CLIENT
# ═══════════════════════════════════════════════════════════════

class LLMClient:
    """Client per comunicare con Ollama."""
    
    def __init__(self, base_url: str = OLLAMA_URL):
        self.base_url = base_url
        self.stats = {"requests": 0, "errors": 0, "total_time": 0}
    
    def generate(
        self,
        prompt: str,
        model: str,
        system_prompt: str = "",
        timeout: int = DEFAULT_TIMEOUT
    ) -> Dict[str, Any]:
        """Genera risposta dal modello."""
        import requests
        
        self.stats["requests"] += 1
        start = time.time()
        
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
            }
            if system_prompt:
                payload["system"] = system_prompt
            
            r = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=timeout
            )
            
            data = r.json()
            duration = int((time.time() - start) * 1000)
            self.stats["total_time"] += duration
            
            if "error" in data:
                self.stats["errors"] += 1
                return {"success": False, "error": data["error"], "duration_ms": duration}
            
            return {
                "success": True,
                "response": data.get("response", ""),
                "duration_ms": duration,
                "tokens": data.get("eval_count", 0)
            }
            
        except Exception as e:
            self.stats["errors"] += 1
            duration = int((time.time() - start) * 1000)
            return {"success": False, "error": str(e), "duration_ms": duration}
    
    async def generate_async(
        self,
        prompt: str,
        model: str,
        system_prompt: str = "",
        timeout: int = DEFAULT_TIMEOUT
    ) -> Dict[str, Any]:
        """Genera risposta in modo asincrono."""
        if not HAS_AIOHTTP:
            # Fallback a sync
            return self.generate(prompt, model, system_prompt, timeout)
        
        self.stats["requests"] += 1
        start = time.time()
        
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
            }
            if system_prompt:
                payload["system"] = system_prompt
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=timeout)
                ) as resp:
                    data = await resp.json()
            
            duration = int((time.time() - start) * 1000)
            self.stats["total_time"] += duration
            
            if "error" in data:
                self.stats["errors"] += 1
                return {"success": False, "error": data["error"], "duration_ms": duration}
            
            return {
                "success": True,
                "response": data.get("response", ""),
                "duration_ms": duration,
                "tokens": data.get("eval_count", 0)
            }
            
        except Exception as e:
            self.stats["errors"] += 1
            duration = int((time.time() - start) * 1000)
            return {"success": False, "error": str(e), "duration_ms": duration}


# ═══════════════════════════════════════════════════════════════
# DISPATCHER
# ═══════════════════════════════════════════════════════════════

class Dispatcher:
    """Orchestratore multi-agente per task paralleli."""
    
    def __init__(
        self,
        ollama_url: str = OLLAMA_URL,
        max_workers: int = MAX_WORKERS,
        enable_monitoring: bool = True
    ):
        self.client = LLMClient(ollama_url)
        self.max_workers = max_workers
        self.task_history: List[TaskResult] = []
        self.monitor = get_system_monitor() if enable_monitoring else None
        self.monitoring_enabled = enable_monitoring
    
    def detect_agent_type(self, prompt: str) -> AgentType:
        """Auto-detect del tipo di agente migliore per il task."""
        prompt_lower = prompt.lower()
        
        # Keywords per ogni tipo
        coding_keywords = ["write", "code", "implement", "create", "build", "function", "class", "api", "script"]
        testing_keywords = ["test", "unittest", "pytest", "coverage", "review", "verify", "check"]
        deploy_keywords = ["deploy", "release", "production", "docker", "kubernetes", "ci/cd", "pipeline"]
        research_keywords = ["analyze", "research", "compare", "evaluate", "investigate", "explain"]
        
        if any(kw in prompt_lower for kw in coding_keywords):
            return AgentType.CODER
        elif any(kw in prompt_lower for kw in testing_keywords):
            return AgentType.TESTER
        elif any(kw in prompt_lower for kw in deploy_keywords):
            return AgentType.DEPLOYER
        elif any(kw in prompt_lower for kw in research_keywords):
            return AgentType.RESEARCHER
        else:
            return AgentType.GENERAL
    
    def run(
        self,
        prompt: str,
        agent_type: Optional[AgentType] = None,
        timeout: int = DEFAULT_TIMEOUT
    ) -> TaskResult:
        """
        Esegue un singolo task.
        Controlla CPU/temp prima di procedere (se monitoring abilitato).
        """
        # 🛡️ System health check
        if self.monitoring_enabled and self.monitor:
            can_proceed, reason = self.monitor.should_proceed()
            if not can_proceed:
                return TaskResult(
                    task_id=f"blocked_{int(time.time() * 1000)}",
                    success=False,
                    output="",
                    agent_type=agent_type or AgentType.GENERAL,
                    duration_ms=0,
                    error=f"Task bloccato per sicurezza: {reason}"
                )
        
        if agent_type is None:
            agent_type = self.detect_agent_type(prompt)
        
        task = Task(
            id=f"task_{int(time.time() * 1000)}",
            prompt=prompt,
            agent_type=agent_type,
            timeout=timeout
        )
        
        model = AGENT_MODELS[agent_type]
        system_prompt = AGENT_PROMPTS[agent_type]
        
        result = self.client.generate(
            prompt=prompt,
            model=model,
            system_prompt=system_prompt,
            timeout=timeout
        )
        
        task_result = TaskResult(
            task_id=task.id,
            success=result["success"],
            output=result.get("response", ""),
            agent_type=agent_type,
            duration_ms=result["duration_ms"],
            error=result.get("error"),
            tokens_used=result.get("tokens", 0)
        )
        
        self.task_history.append(task_result)
        return task_result
    
    def parallel(
        self,
        tasks: List[str | Dict[str, Any]],
        max_concurrent: Optional[int] = None
    ) -> List[TaskResult]:
        """
        Esegue task in parallelo con thread pool.
        
        Args:
            tasks: Lista di prompt (str) o dict con {prompt, agent_type, ...}
            max_concurrent: Limite concorrenza (default: max_workers)
        
        Returns:
            Lista di TaskResult
        """
        if max_concurrent is None:
            max_concurrent = self.max_workers
        
        # Normalizza tasks
        normalized = []
        for t in tasks:
            if isinstance(t, str):
                normalized.append({"prompt": t})
            else:
                normalized.append(t)
        
        results = []
        with ThreadPoolExecutor(max_workers=max_concurrent) as executor:
            futures = {}
            for i, t in enumerate(normalized):
                prompt = t["prompt"]
                agent_type = t.get("agent_type")
                if isinstance(agent_type, str):
                    agent_type = AgentType(agent_type)
                timeout = t.get("timeout", DEFAULT_TIMEOUT)
                
                future = executor.submit(self.run, prompt, agent_type, timeout)
                futures[future] = i
            
            for future in as_completed(futures):
                idx = futures[future]
                try:
                    result = future.result()
                    results.append((idx, result))
                except Exception as e:
                    results.append((idx, TaskResult(
                        task_id=f"error_{idx}",
                        success=False,
                        output="",
                        agent_type=AgentType.GENERAL,
                        duration_ms=0,
                        error=str(e)
                    )))
        
        # Ordina per indice originale
        results.sort(key=lambda x: x[0])
        return [r[1] for r in results]
    
    async def parallel_async(
        self,
        tasks: List[str | Dict[str, Any]],
        max_concurrent: Optional[int] = None
    ) -> List[TaskResult]:
        """
        Esegue task in parallelo con async/await.
        Più efficiente per I/O-bound tasks.
        """
        if max_concurrent is None:
            max_concurrent = self.max_workers
        
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def run_one(t: Dict[str, Any], idx: int) -> tuple:
            async with semaphore:
                prompt = t["prompt"]
                agent_type = t.get("agent_type")
                if isinstance(agent_type, str):
                    agent_type = AgentType(agent_type)
                if agent_type is None:
                    agent_type = self.detect_agent_type(prompt)
                
                model = AGENT_MODELS[agent_type]
                system_prompt = AGENT_PROMPTS[agent_type]
                timeout = t.get("timeout", DEFAULT_TIMEOUT)
                
                result = await self.client.generate_async(
                    prompt=prompt,
                    model=model,
                    system_prompt=system_prompt,
                    timeout=timeout
                )
                
                return idx, TaskResult(
                    task_id=f"task_{idx}_{int(time.time() * 1000)}",
                    success=result["success"],
                    output=result.get("response", ""),
                    agent_type=agent_type,
                    duration_ms=result["duration_ms"],
                    error=result.get("error"),
                    tokens_used=result.get("tokens", 0)
                )
        
        # Normalizza tasks
        normalized = []
        for t in tasks:
            if isinstance(t, str):
                normalized.append({"prompt": t})
            else:
                normalized.append(t)
        
        # Esegui tutti
        coroutines = [run_one(t, i) for i, t in enumerate(normalized)]
        results = await asyncio.gather(*coroutines, return_exceptions=True)
        
        # Ordina e gestisci errori
        sorted_results = []
        for r in results:
            if isinstance(r, Exception):
                sorted_results.append((999, TaskResult(
                    task_id="error",
                    success=False,
                    output="",
                    agent_type=AgentType.GENERAL,
                    duration_ms=0,
                    error=str(r)
                )))
            else:
                sorted_results.append(r)
        
        sorted_results.sort(key=lambda x: x[0])
        return [r[1] for r in sorted_results]
    
    def pipeline(
        self,
        stages: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None
    ) -> List[TaskResult]:
        """
        Esegue una pipeline sequenziale di task.
        L'output di ogni stage è disponibile come contesto per il successivo.
        
        Args:
            stages: Lista di {agent, task, [name]}
            context: Contesto iniziale
        
        Returns:
            Lista di TaskResult
        """
        if context is None:
            context = {}
        
        results = []
        
        for i, stage in enumerate(stages):
            agent_type = stage.get("agent")
            if isinstance(agent_type, str):
                agent_type = AgentType(agent_type)
            
            task = stage.get("task", "")
            name = stage.get("name", f"stage_{i}")
            
            # Espandi variabili nel prompt
            if context:
                task = task.format(**context)
            
            result = self.run(task, agent_type)
            results.append(result)
            
            # Aggiungi output al contesto
            context[name] = result.output
            context[f"{name}_success"] = result.success
        
        return results
    
    def get_health(self) -> Dict[str, Any]:
        """
        Ritorna stato di salute del sistema.
        Include CPU, memoria, temperatura GPU se disponibile.
        """
        if not self.monitoring_enabled or not self.monitor:
            return {"monitoring": "disabled"}
        
        return self.monitor.check_health()
    
    def get_stats(self) -> Dict[str, Any]:
        """Ritorna statistiche di esecuzione."""
        total_tasks = len(self.task_history)
        successful = sum(1 for r in self.task_history if r.success)
        total_duration = sum(r.duration_ms for r in self.task_history)
        total_tokens = sum(r.tokens_used for r in self.task_history)
        
        stats = {
            "total_tasks": total_tasks,
            "successful": successful,
            "failed": total_tasks - successful,
            "success_rate": successful / max(1, total_tasks),
            "total_duration_ms": total_duration,
            "avg_duration_ms": total_duration / max(1, total_tasks),
            "total_tokens": total_tokens,
            "llm_stats": self.client.stats
        }
        
        # Aggiungi health status
        if self.monitoring_enabled and self.monitor:
            stats["system_health"] = self.monitor.check_health()
        
        return stats


# ═══════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="🤖 Agentic Dispatcher")
    parser.add_argument("prompt", nargs="*", help="Task prompt")
    parser.add_argument("-a", "--agent", choices=["coder", "tester", "deployer", "researcher", "general"],
                        default=None, help="Force agent type")
    parser.add_argument("-p", "--parallel", type=str, help="File with tasks (one per line)")
    parser.add_argument("-w", "--workers", type=int, default=MAX_WORKERS,
                        help=f"Max parallel workers (default: {MAX_WORKERS})")
    parser.add_argument("--stats", action="store_true", help="Show LLM stats")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    d = Dispatcher(max_workers=args.workers)
    
    if args.stats:
        print(json.dumps(d.get_stats(), indent=2))
        return
    
    if args.parallel:
        # Leggi tasks da file
        with open(args.parallel) as f:
            tasks = [line.strip() for line in f if line.strip() and not line.startswith("#")]
        
        print(f"🚀 Running {len(tasks)} tasks in parallel (max {args.workers} workers)...\n")
        results = d.parallel(tasks)
        
        for i, r in enumerate(results):
            status = "✅" if r.success else "❌"
            print(f"{status} Task {i+1}: [{r.agent_type.value}] {r.duration_ms}ms")
            if r.success:
                print(f"   {r.output[:200]}{'...' if len(r.output) > 200 else ''}\n")
            else:
                print(f"   Error: {r.error}\n")
        
        print(f"\n📊 Stats: {json.dumps(d.get_stats(), indent=2)}")
        return
    
    if not args.prompt:
        parser.print_help()
        return
    
    prompt = " ".join(args.prompt)
    agent_type = AgentType(args.agent) if args.agent else None
    
    print(f"🤖 Running task...\n")
    result = d.run(prompt, agent_type)
    
    if args.json:
        print(json.dumps({
            "success": result.success,
            "agent": result.agent_type.value,
            "output": result.output,
            "duration_ms": result.duration_ms,
            "tokens": result.tokens_used
        }, indent=2))
    else:
        status = "✅" if result.success else "❌"
        print(f"{status} [{result.agent_type.value}] {result.duration_ms}ms, {result.tokens_used} tokens\n")
        print(result.output if result.success else f"Error: {result.error}")


if __name__ == "__main__":
    main()
