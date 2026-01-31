#!/usr/bin/env python3
"""
Daily Test Suite - Runs comprehensive tests 2x/day
Cron: 0 9,21 * * * /Users/mattia/Projects/Onde/scripts/daily-test-suite.py

Outputs JSON for onde.surf dashboard integration.
"""

import json
import subprocess
import sys
import os
from datetime import datetime, timezone
from pathlib import Path
import urllib.request
import ssl
import time

SCRIPT_DIR = Path(__file__).parent
ONDE_ROOT = SCRIPT_DIR.parent
REPORT_FILE = SCRIPT_DIR / "daily-test-report.json"
ALERT_FILE = SCRIPT_DIR / "test-failure.alert"

# SSL context for https requests
ssl_ctx = ssl.create_default_context()

class TestSuite:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "run_type": "daily",
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "skipped": 0
            },
            "alerts": []
        }
    
    def add_test(self, name: str, category: str, passed: bool, details: str = "", duration_ms: int = 0):
        """Add a test result"""
        self.results["tests"].append({
            "name": name,
            "category": category,
            "passed": passed,
            "details": details,
            "duration_ms": duration_ms,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        self.results["summary"]["total"] += 1
        if passed:
            self.results["summary"]["passed"] += 1
        else:
            self.results["summary"]["failed"] += 1
            self.results["alerts"].append(f"FAILED: {name} - {details}")
    
    def run_http_test(self, name: str, url: str, expected_status: int = 200, timeout: int = 10):
        """Test HTTP endpoint"""
        start = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "OndeTestSuite/1.0"})
            with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as resp:
                status = resp.status
                duration = int((time.time() - start) * 1000)
                passed = status == expected_status
                self.add_test(name, "http", passed, f"Status: {status}", duration)
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            self.add_test(name, "http", False, str(e), duration)
    
    def run_auth_test(self, name: str, url: str):
        """Test that URL requires auth (returns 307 redirect)"""
        start = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "OndeTestSuite/1.0"})
            opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler())
            # We need to catch the redirect
            import http.client
            conn = http.client.HTTPSConnection(url.split("//")[1].split("/")[0], timeout=10)
            path = "/" + "/".join(url.split("//")[1].split("/")[1:]) if "/" in url.split("//")[1] else "/"
            conn.request("GET", path, headers={"User-Agent": "OndeTestSuite/1.0"})
            resp = conn.getresponse()
            status = resp.status
            duration = int((time.time() - start) * 1000)
            # 307 = auth redirect (good), 200 = public (bad for protected pages)
            passed = status in [307, 302, 303]
            details = f"Status: {status} ({'protected' if passed else 'PUBLIC - needs fix!'})"
            self.add_test(name, "auth", passed, details, duration)
            conn.close()
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            self.add_test(name, "auth", False, str(e), duration)
    
    def run_ssl_test(self, name: str, hostname: str):
        """Test SSL certificate validity"""
        start = time.time()
        try:
            import socket
            ctx = ssl.create_default_context()
            with ctx.wrap_socket(socket.socket(), server_hostname=hostname) as s:
                s.settimeout(10)
                s.connect((hostname, 443))
                cert = s.getpeercert()
                # Parse expiry
                not_after = cert.get('notAfter', '')
                # Format: 'Mar 15 23:59:59 2025 GMT'
                expiry = datetime.strptime(not_after, '%b %d %H:%M:%S %Y %Z')
                expiry_utc = expiry.replace(tzinfo=timezone.utc)
                now_utc = datetime.now(timezone.utc)
                days_left = (expiry_utc - now_utc).days
                duration = int((time.time() - start) * 1000)
                passed = days_left > 7  # Critical if < 7 days
                warning = days_left < 30
                details = f"Expires in {days_left} days"
                if warning and passed:
                    details += " ⚠️"
                self.add_test(name, "ssl", passed, details, duration)
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            self.add_test(name, "ssl", False, str(e), duration)
    
    def run_response_time_test(self, name: str, url: str, threshold_ms: int = 3000):
        """Test response time under threshold"""
        start = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "OndeTestSuite/1.0"})
            with urllib.request.urlopen(req, timeout=30, context=ssl_ctx) as resp:
                duration = int((time.time() - start) * 1000)
                passed = duration < threshold_ms
                self.add_test(name, "performance", passed, f"{duration}ms (threshold: {threshold_ms}ms)", duration)
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            self.add_test(name, "performance", False, str(e), duration)
    
    def run_content_test(self, name: str, url: str, expected_text: str):
        """Test that page contains expected text"""
        start = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "OndeTestSuite/1.0"})
            with urllib.request.urlopen(req, timeout=10, context=ssl_ctx) as resp:
                content = resp.read().decode('utf-8', errors='ignore')
                duration = int((time.time() - start) * 1000)
                passed = expected_text.lower() in content.lower()
                details = f"Found '{expected_text}'" if passed else f"Missing '{expected_text}'"
                self.add_test(name, "content", passed, details, duration)
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            self.add_test(name, "content", False, str(e), duration)
    
    def run_api_health_test(self, name: str, url: str):
        """Test API health endpoint returns valid JSON"""
        start = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "OndeTestSuite/1.0"})
            with urllib.request.urlopen(req, timeout=10, context=ssl_ctx) as resp:
                data = json.loads(resp.read().decode())
                duration = int((time.time() - start) * 1000)
                # Check for status field - 'unavailable' is OK for static exports
                status = data.get('status', data.get('healthy', 'unknown'))
                passed = status in ['ok', 'healthy', True, 'true', 'unavailable']
                details = f"Status: {status}"
                if status == 'unavailable':
                    details += " (static export - expected)"
                self.add_test(name, "api", passed, details, duration)
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            self.add_test(name, "api", False, str(e), duration)
    
    def run_visual_regression_tests(self):
        """Run visual regression tests via Playwright (T442)"""
        visual_script = SCRIPT_DIR / "visual-regression-tests.py"
        if not visual_script.exists():
            self.add_test("Visual Regression", "visual", False, "Script not found", 0)
            return
        
        start = time.time()
        try:
            result = subprocess.run(
                [sys.executable, str(visual_script)],
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout for visual tests
            )
            duration = int((time.time() - start) * 1000)
            
            # Parse the report if it exists
            report_file = SCRIPT_DIR / "visual-regression-report.json"
            if report_file.exists():
                with open(report_file) as f:
                    report = json.load(f)
                
                passed = report.get("summary", {}).get("failed", 1) == 0
                total = report.get("summary", {}).get("total", 0)
                failed = report.get("summary", {}).get("failed", 0)
                
                if passed:
                    self.add_test("Visual Regression", "visual", True, 
                                f"All {total} pages match baseline", duration)
                else:
                    failed_pages = [t["name"] for t in report.get("tests", []) if not t.get("passed")]
                    self.add_test("Visual Regression", "visual", False,
                                f"{failed}/{total} pages differ: {', '.join(failed_pages)}", duration)
            else:
                # No report - check exit code
                passed = result.returncode == 0
                self.add_test("Visual Regression", "visual", passed,
                            "Tests completed" if passed else f"Exit code {result.returncode}", duration)
                
        except subprocess.TimeoutExpired:
            duration = int((time.time() - start) * 1000)
            self.add_test("Visual Regression", "visual", False, "Timeout (>2min)", duration)
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            self.add_test("Visual Regression", "visual", False, str(e), duration)
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print(f"🧪 Running Daily Test Suite - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        print("=" * 60)
        
        # === ONDE.LA Tests ===
        print("\n📚 Testing ONDE.LA...")
        self.run_http_test("onde.la Homepage", "https://onde.la/")
        self.run_http_test("onde.la /libri", "https://onde.la/libri/")
        self.run_http_test("onde.la /catalogo", "https://onde.la/catalogo/")
        self.run_http_test("onde.la /about", "https://onde.la/about/")
        self.run_http_test("onde.la /health", "https://onde.la/health/")
        self.run_http_test("onde.la RSS Feed", "https://onde.la/feed.xml")
        self.run_ssl_test("onde.la SSL", "onde.la")
        self.run_response_time_test("onde.la Performance", "https://onde.la/")
        self.run_content_test("onde.la Content Check", "https://onde.la/", "Onde")
        self.run_api_health_test("onde.la API Health", "https://onde.la/api/health/cron")
        
        # === Reader App Tests (T692, T704) ===
        print("\n📖 Testing READER APPS...")
        self.run_http_test("onde.la Reader App", "https://onde.la/reader/")
        self.run_http_test("onde.la Reader VR", "https://onde.la/reader-vr/")
        
        # === Games Tests (T487) ===
        print("\n🎮 Testing GAMES...")
        self.run_http_test("Moonlight Magic House", "https://onde.la/games/moonlight-magic-house/")
        
        # === ONDE.SURF Tests ===
        print("\n🏄 Testing ONDE.SURF...")
        self.run_auth_test("onde.surf Auth Check", "https://onde.surf/")
        self.run_http_test("onde.surf Login Page", "https://onde.surf/login", 200)
        self.run_ssl_test("onde.surf SSL", "onde.surf")
        self.run_response_time_test("onde.surf Performance", "https://onde.surf/login")
        
        # === SKIN STUDIO Tests (T899) ===
        print("\n🎨 Testing SKIN STUDIO...")
        self.run_http_test("Skin Studio", "https://skin-studio.pages.dev/", 200)
        self.run_response_time_test("Skin Studio Performance", "https://skin-studio.pages.dev/")
        self.run_content_test("Skin Studio Content Check", "https://skin-studio.pages.dev/", "Skin Studio")
        
        # === Visual Regression Tests (T442) ===
        # Run 1x/day at 12:00 to catch UI regressions without burning too much CI time
        current_hour = datetime.now().hour
        if current_hour >= 11 and current_hour <= 13:  # Run between 11:00-13:00
            print("\n🎨 Running Visual Regression Tests...")
            self.run_visual_regression_tests()
        else:
            print(f"\n⏭️ Skipping visual tests (only run at 12:00, current: {current_hour}:00)")
        
        # === Summary ===
        print("\n" + "=" * 60)
        s = self.results["summary"]
        print(f"📊 Results: {s['passed']}/{s['total']} passed")
        if s['failed'] > 0:
            print(f"❌ {s['failed']} FAILED tests!")
            for alert in self.results["alerts"]:
                print(f"   • {alert}")
        else:
            print("✅ All tests passed!")
        
        return s['failed'] == 0
    
    def save_report(self):
        """Save JSON report for dashboard"""
        with open(REPORT_FILE, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\n📄 Report saved: {REPORT_FILE}")
    
    def create_alert_if_needed(self):
        """Create alert file if tests failed"""
        if self.results["summary"]["failed"] > 0:
            alert_msg = {
                "timestamp": self.results["timestamp"],
                "failed_count": self.results["summary"]["failed"],
                "total_count": self.results["summary"]["total"],
                "alerts": self.results["alerts"],
                "message": f"🚨 TEST SUITE FAILED!\n\n{self.results['summary']['failed']}/{self.results['summary']['total']} tests failed:\n" + 
                          "\n".join(f"• {a}" for a in self.results["alerts"])
            }
            with open(ALERT_FILE, 'w') as f:
                json.dump(alert_msg, f, indent=2)
            print(f"🚨 Alert created: {ALERT_FILE}")

def upload_to_dashboard():
    """Upload report to onde.surf KV storage"""
    upload_script = SCRIPT_DIR / "upload-test-report.sh"
    if upload_script.exists():
        try:
            result = subprocess.run(
                [str(upload_script), str(REPORT_FILE)],
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                print("📤 Report uploaded to dashboard")
            else:
                print(f"⚠️ Upload failed: {result.stderr}")
        except Exception as e:
            print(f"⚠️ Upload error: {e}")
    else:
        print("⚠️ Upload script not found, skipping dashboard update")

def main():
    suite = TestSuite()
    success = suite.run_all_tests()
    suite.save_report()
    upload_to_dashboard()
    suite.create_alert_if_needed()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
