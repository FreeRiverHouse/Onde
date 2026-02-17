#!/usr/bin/env python3
"""
Local LLM Benchmark - Compare coding models for quality + speed.
Task T869: Benchmark qwen2.5-coder, deepseek-coder, llama31-8b

Usage:
    python3 scripts/benchmark-local-llm.py
    python3 scripts/benchmark-local-llm.py --models qwen2.5-coder:7b deepseek-coder:6.7b
    python3 scripts/benchmark-local-llm.py --quick  # Run fewer iterations
"""

import subprocess
import json
import time
import os
from datetime import datetime
from pathlib import Path

# Models to benchmark
MODELS = [
    "qwen2.5-coder:7b",
    "deepseek-coder:6.7b",
    "llama3.1:8b",  # llama31-8b alias
]

# Benchmark tasks with expected behavior
# Simplified tasks for faster benchmarking
TASKS = {
    "code_simple": [
        {
            "prompt": "def add(a, b):",
            "expected_contains": ["return", "+"],
            "max_tokens": 50,
        },
    ],
    "analysis": [
        {
            "prompt": "What does 2+2 equal?",
            "expected_contains": ["4"],
            "max_tokens": 20,
        },
    ],
    "translation": [
        {
            "prompt": "Translate to Italian: Hello world",
            "expected_contains": ["ciao", "mondo"],
            "max_tokens": 30,
        },
    ],
}


def run_ollama(model: str, prompt: str, max_tokens: int = 300, timeout: int = 60) -> dict:
    """Run Ollama and measure performance."""
    start = time.time()
    try:
        result = subprocess.run(
            ["ollama", "run", model, prompt],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        latency = time.time() - start
        output = result.stdout.strip()
        
        # Count tokens (rough approximation)
        tokens = len(output.split())
        
        return {
            "success": True,
            "output": output,
            "latency": latency,
            "tokens": tokens,
            "tokens_per_sec": tokens / latency if latency > 0 else 0,
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "timeout", "latency": 120, "tokens": 0}
    except Exception as e:
        return {"success": False, "error": str(e), "latency": 0, "tokens": 0}


def check_quality(output: str, expected: list[str]) -> dict:
    """Check if output contains expected keywords."""
    output_lower = output.lower()
    found = [kw for kw in expected if kw.lower() in output_lower]
    missing = [kw for kw in expected if kw.lower() not in output_lower]
    score = len(found) / len(expected) if expected else 1.0
    return {
        "score": score,
        "found_keywords": found,
        "missing_keywords": missing,
    }


def run_benchmark(models: list[str] = None, quick: bool = False) -> dict:
    """Run full benchmark suite."""
    models = models or MODELS
    results = {
        "timestamp": datetime.now().isoformat(),
        "models": {},
        "summary": {},
    }
    
    tasks_to_run = TASKS
    if quick:
        # Only run first task of each category
        tasks_to_run = {k: [v[0]] for k, v in TASKS.items()}
    
    for model in models:
        print(f"\n{'='*60}")
        print(f"Benchmarking: {model}")
        print(f"{'='*60}")
        
        model_results = {
            "tasks": {},
            "totals": {
                "total_latency": 0,
                "total_tokens": 0,
                "avg_tokens_per_sec": 0,
                "avg_quality_score": 0,
                "success_rate": 0,
            },
        }
        
        all_scores = []
        all_tps = []
        successes = 0
        total_tests = 0
        
        for task_type, prompts in tasks_to_run.items():
            print(f"\n  Task: {task_type}")
            task_results = []
            
            for i, task in enumerate(prompts):
                total_tests += 1
                print(f"    Running test {i+1}...", end=" ", flush=True)
                
                result = run_ollama(model, task["prompt"], task.get("max_tokens", 300))
                
                if result["success"]:
                    successes += 1
                    quality = check_quality(result["output"], task["expected_contains"])
                    result["quality"] = quality
                    all_scores.append(quality["score"])
                    all_tps.append(result["tokens_per_sec"])
                    model_results["totals"]["total_latency"] += result["latency"]
                    model_results["totals"]["total_tokens"] += result["tokens"]
                    print(f"✓ {result['latency']:.1f}s, {result['tokens_per_sec']:.1f} tok/s, quality: {quality['score']:.0%}")
                else:
                    print(f"✗ {result.get('error', 'unknown error')}")
                
                task_results.append(result)
            
            model_results["tasks"][task_type] = task_results
        
        # Calculate totals
        if all_tps:
            model_results["totals"]["avg_tokens_per_sec"] = sum(all_tps) / len(all_tps)
        if all_scores:
            model_results["totals"]["avg_quality_score"] = sum(all_scores) / len(all_scores)
        model_results["totals"]["success_rate"] = successes / total_tests if total_tests else 0
        
        results["models"][model] = model_results
    
    # Generate summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    
    summary_data = []
    for model, data in results["models"].items():
        totals = data["totals"]
        summary_data.append({
            "model": model,
            "avg_tps": totals["avg_tokens_per_sec"],
            "quality": totals["avg_quality_score"],
            "success": totals["success_rate"],
            "latency": totals["total_latency"],
        })
        print(f"\n{model}:")
        print(f"  Speed:   {totals['avg_tokens_per_sec']:.1f} tokens/sec")
        print(f"  Quality: {totals['avg_quality_score']:.0%}")
        print(f"  Success: {totals['success_rate']:.0%}")
    
    # Rank by combined score (quality * speed * success)
    for item in summary_data:
        item["combined_score"] = item["quality"] * item["avg_tps"] * item["success"]
    
    ranked = sorted(summary_data, key=lambda x: x["combined_score"], reverse=True)
    results["summary"]["ranking"] = ranked
    
    print(f"\n{'='*60}")
    print("RANKING (by combined score)")
    print(f"{'='*60}")
    for i, item in enumerate(ranked, 1):
        print(f"  {i}. {item['model']} (score: {item['combined_score']:.2f})")
    
    # Recommendations
    recommendations = {}
    
    # Best for coding (quality + speed balance)
    best_coding = max(
        [(m, d) for m, d in results["models"].items()],
        key=lambda x: x[1]["totals"]["avg_quality_score"] * x[1]["totals"]["avg_tokens_per_sec"],
    )
    recommendations["coding"] = best_coding[0]
    
    # Best for speed
    best_speed = max(
        [(m, d) for m, d in results["models"].items()],
        key=lambda x: x[1]["totals"]["avg_tokens_per_sec"],
    )
    recommendations["speed"] = best_speed[0]
    
    # Best for quality
    best_quality = max(
        [(m, d) for m, d in results["models"].items()],
        key=lambda x: x[1]["totals"]["avg_quality_score"],
    )
    recommendations["quality"] = best_quality[0]
    
    results["summary"]["recommendations"] = recommendations
    
    print(f"\n{'='*60}")
    print("RECOMMENDATIONS")
    print(f"{'='*60}")
    print(f"  Best for coding: {recommendations['coding']}")
    print(f"  Best for speed:  {recommendations['speed']}")
    print(f"  Best for quality: {recommendations['quality']}")
    
    return results


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Benchmark local LLMs")
    parser.add_argument("--models", nargs="+", help="Models to benchmark")
    parser.add_argument("--quick", action="store_true", help="Run quick benchmark")
    parser.add_argument("--output", default="data/benchmarks/local-llm-benchmark.json")
    args = parser.parse_args()
    
    # Ensure output directory exists
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Run benchmark
    results = run_benchmark(models=args.models, quick=args.quick)
    
    # Save results
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n✅ Results saved to {output_path}")


if __name__ == "__main__":
    main()
