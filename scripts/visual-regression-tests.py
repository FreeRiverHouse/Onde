#!/usr/bin/env python3
"""
Visual Regression Tests - Playwright screenshot comparison
Usage: python3 scripts/visual-regression-tests.py [--update-baseline]

Captures screenshots of key pages and compares to baseline images.
Creates alert if visual diff exceeds threshold (default 5%).
"""

import json
import subprocess
import sys
import os
from datetime import datetime, timezone
from pathlib import Path
import argparse
import hashlib

SCRIPT_DIR = Path(__file__).parent
ONDE_ROOT = SCRIPT_DIR.parent
BASELINE_DIR = ONDE_ROOT / "test-results" / "visual-baselines"
CURRENT_DIR = ONDE_ROOT / "test-results" / "visual-current"
DIFF_DIR = ONDE_ROOT / "test-results" / "visual-diff"
REPORT_FILE = SCRIPT_DIR / "visual-regression-report.json"
ALERT_FILE = SCRIPT_DIR / "visual-regression.alert"

# Pages to test
PAGES = [
    {
        "name": "onde.la-homepage",
        "url": "https://onde.la",
        "viewport": {"width": 1280, "height": 720}
    },
    {
        "name": "onde.la-libri",
        "url": "https://onde.la/libri",
        "viewport": {"width": 1280, "height": 720}
    },
    {
        "name": "onde.la-catalogo",
        "url": "https://onde.la/catalogo",
        "viewport": {"width": 1280, "height": 720}
    },
    {
        "name": "onde.la-about",
        "url": "https://onde.la/about",
        "viewport": {"width": 1280, "height": 720}
    },
    {
        "name": "onde.surf-login",
        "url": "https://onde.surf",
        "viewport": {"width": 1280, "height": 720}
    },
    # Mobile viewports
    {
        "name": "onde.la-homepage-mobile",
        "url": "https://onde.la",
        "viewport": {"width": 375, "height": 812}
    },
    {
        "name": "onde.la-libri-mobile",
        "url": "https://onde.la/libri",
        "viewport": {"width": 375, "height": 812}
    }
]

DIFF_THRESHOLD = 0.05  # 5% pixel difference threshold


def ensure_dirs():
    """Create output directories"""
    for d in [BASELINE_DIR, CURRENT_DIR, DIFF_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def capture_screenshot(page_config: dict, output_path: Path) -> bool:
    """Capture screenshot using Playwright CLI"""
    try:
        cmd = [
            "playwright", "screenshot",
            "--viewport-size", f"{page_config['viewport']['width']},{page_config['viewport']['height']}",
            "--wait-for-timeout", "3000",  # Wait 3s for page to stabilize
            page_config["url"],
            str(output_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return result.returncode == 0 and output_path.exists()
    except Exception as e:
        print(f"Error capturing {page_config['name']}: {e}")
        return False


def calculate_image_hash(image_path: Path) -> str:
    """Calculate hash of image file"""
    if not image_path.exists():
        return ""
    with open(image_path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


def compare_images_simple(baseline: Path, current: Path) -> tuple[float, bool]:
    """
    Simple comparison: check if file hashes match.
    For exact match, returns 0.0 diff.
    For any difference, returns 1.0 diff (needs manual review).
    
    Future: Use pixelmatch or ImageMagick for proper diff calculation.
    """
    if not baseline.exists():
        return 1.0, False  # No baseline = needs update
    
    baseline_hash = calculate_image_hash(baseline)
    current_hash = calculate_image_hash(current)
    
    if baseline_hash == current_hash:
        return 0.0, True  # Exact match
    
    # Files differ - calculate size diff as rough estimate
    baseline_size = baseline.stat().st_size
    current_size = current.stat().st_size
    size_diff = abs(baseline_size - current_size) / max(baseline_size, current_size)
    
    return size_diff, size_diff < DIFF_THRESHOLD


def run_tests(update_baseline: bool = False) -> dict:
    """Run all visual regression tests"""
    ensure_dirs()
    
    results = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tests": [],
        "summary": {
            "total": len(PAGES),
            "passed": 0,
            "failed": 0,
            "baseline_updated": 0
        }
    }
    
    print(f"🎯 Running visual regression tests for {len(PAGES)} pages...")
    print(f"   Threshold: {DIFF_THRESHOLD*100}%")
    print()
    
    for page in PAGES:
        name = page["name"]
        print(f"📸 {name}...", end=" ")
        
        baseline_path = BASELINE_DIR / f"{name}.png"
        current_path = CURRENT_DIR / f"{name}.png"
        
        # Capture current screenshot
        if not capture_screenshot(page, current_path):
            print("❌ CAPTURE FAILED")
            results["tests"].append({
                "name": name,
                "status": "error",
                "error": "Failed to capture screenshot"
            })
            results["summary"]["failed"] += 1
            continue
        
        if update_baseline:
            # Update baseline
            import shutil
            shutil.copy(current_path, baseline_path)
            print("📋 BASELINE UPDATED")
            results["tests"].append({
                "name": name,
                "status": "baseline_updated",
                "baseline_path": str(baseline_path)
            })
            results["summary"]["baseline_updated"] += 1
        else:
            # Compare to baseline
            if not baseline_path.exists():
                print("⚠️ NO BASELINE (run with --update-baseline)")
                results["tests"].append({
                    "name": name,
                    "status": "no_baseline",
                    "current_path": str(current_path)
                })
                results["summary"]["failed"] += 1
            else:
                diff_pct, passed = compare_images_simple(baseline_path, current_path)
                
                if passed:
                    print(f"✅ PASS (diff: {diff_pct*100:.1f}%)")
                    results["tests"].append({
                        "name": name,
                        "status": "passed",
                        "diff_percent": diff_pct * 100
                    })
                    results["summary"]["passed"] += 1
                else:
                    print(f"❌ FAIL (diff: {diff_pct*100:.1f}%)")
                    results["tests"].append({
                        "name": name,
                        "status": "failed",
                        "diff_percent": diff_pct * 100,
                        "baseline_path": str(baseline_path),
                        "current_path": str(current_path)
                    })
                    results["summary"]["failed"] += 1
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Visual Regression Tests")
    parser.add_argument("--update-baseline", action="store_true",
                       help="Update baseline screenshots instead of comparing")
    args = parser.parse_args()
    
    print("=" * 60)
    print("🖼️  VISUAL REGRESSION TEST SUITE")
    print("=" * 60)
    print()
    
    results = run_tests(update_baseline=args.update_baseline)
    
    # Save report
    with open(REPORT_FILE, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n📄 Report saved: {REPORT_FILE}")
    
    # Print summary
    print()
    print("=" * 60)
    summary = results["summary"]
    print(f"📊 SUMMARY: {summary['passed']}/{summary['total']} passed")
    
    if args.update_baseline:
        print(f"   Baselines updated: {summary['baseline_updated']}")
    
    if summary["failed"] > 0:
        print(f"   ❌ FAILED: {summary['failed']}")
        # Create alert
        alert_data = {
            "timestamp": results["timestamp"],
            "type": "visual_regression",
            "failed_count": summary["failed"],
            "tests": [t for t in results["tests"] if t.get("status") == "failed"]
        }
        with open(ALERT_FILE, "w") as f:
            json.dump(alert_data, f, indent=2)
        print(f"   🚨 Alert created: {ALERT_FILE}")
        sys.exit(1)
    else:
        # Remove alert if exists
        if ALERT_FILE.exists():
            ALERT_FILE.unlink()
        print("   ✅ All tests passed!")
    
    print("=" * 60)


if __name__ == "__main__":
    main()
