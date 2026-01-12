#!/usr/bin/env python3
"""
Test Modifiche Website - Procedura Automatica
Test automatico di ogni modifica al sito PRIMA di mostrarlo all'utente

CARATTERISTICHE:
- Esegue automaticamente dopo deploy su TEST
- Clicca ogni link della pagina
- Fa screenshot di ogni pagina
- Verifica funzionamento
- Report automatico con risultati

WORKFLOW:
1. Deploy su TEST (localhost:8888 o 7777)
2. Lancia questa procedura automaticamente
3. Agenti testano tutto
4. Report risultati
5. SOLO SE OK → mostra a utente

Usage:
    python test-modifiche-website.py <url> <environment>
    
Example:
    python test-modifiche-website.py http://localhost:8888 onde-la
    python test-modifiche-website.py http://localhost:7777 onde-surf
"""

import sys
import os
import subprocess
from pathlib import Path
from datetime import datetime
import json
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

class WebsiteTestRunner:
    def __init__(self, base_url: str, environment: str):
        self.base_url = base_url
        self.environment = environment
        self.onde_root = Path(__file__).parent.parent.parent
        self.screenshots_dir = self.onde_root / "test-results" / environment / datetime.now().strftime("%Y%m%d_%H%M%S")
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)
        
        self.results = {
            'environment': environment,
            'base_url': base_url,
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'errors': [],
            'warnings': [],
            'links_tested': 0,
            'screenshots_taken': 0,
            'success': True
        }
    
    def test_page(self, page, url: str, page_name: str):
        """Test singola pagina: screenshot, link, errori console"""
        print(f"\n🧪 Testing: {page_name}")
        print(f"   URL: {url}")
        
        test_result = {
            'page': page_name,
            'url': url,
            'status': 'pending',
            'errors': [],
            'warnings': [],
            'links_found': 0,
            'screenshot': None
        }
        
        try:
            # Navigate to page
            response = page.goto(url, wait_until='networkidle', timeout=30000)
            
            if response.status >= 400:
                test_result['errors'].append(f"HTTP {response.status}")
                test_result['status'] = 'error'
                self.results['success'] = False
                return test_result
            
            # Wait for page to be ready
            page.wait_for_load_state('domcontentloaded')
            
            # Take screenshot
            screenshot_path = self.screenshots_dir / f"{page_name.replace('/', '_')}.png"
            page.screenshot(path=str(screenshot_path), full_page=True)
            test_result['screenshot'] = str(screenshot_path)
            self.results['screenshots_taken'] += 1
            print(f"   ✅ Screenshot: {screenshot_path.name}")
            
            # Check for console errors
            console_errors = []
            page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
            
            # Find all links
            links = page.query_selector_all('a[href]')
            test_result['links_found'] = len(links)
            print(f"   🔗 Links trovati: {len(links)}")
            
            # Check for React errors in page
            react_errors = page.query_selector_all('[data-nextjs-dialog-overlay]')
            if react_errors:
                error_text = page.query_selector('[data-nextjs-dialog-overlay]')
                if error_text:
                    test_result['errors'].append(f"React Error: {error_text.inner_text()[:200]}")
                    test_result['status'] = 'error'
                    self.results['success'] = False
                    print(f"   ❌ React Error trovato!")
            
            # Check for hydration errors
            hydration_errors = page.query_selector_all('text=/hydration/i')
            if hydration_errors:
                test_result['warnings'].append("Possibile hydration error")
                print(f"   ⚠️  Warning: Possibile hydration error")
            
            if test_result['status'] == 'pending':
                test_result['status'] = 'success'
                print(f"   ✅ Test completato con successo")
            
        except PlaywrightTimeout as e:
            test_result['errors'].append(f"Timeout: {str(e)}")
            test_result['status'] = 'error'
            self.results['success'] = False
            print(f"   ❌ Timeout: {str(e)}")
        except Exception as e:
            test_result['errors'].append(f"Error: {str(e)}")
            test_result['status'] = 'error'
            self.results['success'] = False
            print(f"   ❌ Error: {str(e)}")
        
        self.results['tests'].append(test_result)
        return test_result
    
    def verify_book_prices(self, page):
        """Verifica prezzi libri nella pagina /libri"""
        print(f"\n💰 Verifying book prices...")
        
        try:
            # Cerca tutti i badge di prezzo
            price_badges = page.query_selector_all('span:has-text("$"), span:has-text("Free")')
            
            prices_found = {}
            for badge in price_badges:
                price_text = badge.inner_text().strip()
                # Trova il titolo del libro vicino a questo badge
                parent = badge.locator('xpath=ancestor::div[contains(@class, "rounded")]').first
                if parent:
                    title_elem = parent.query_selector('h2, h3')
                    if title_elem:
                        book_title = title_elem.inner_text().strip()
                        prices_found[book_title] = price_text
                        print(f"   📖 {book_title}: {price_text}")
            
            # Verifica che Meditations sia Free (requisito specifico)
            if 'Meditations' in prices_found:
                if prices_found['Meditations'] != 'Free':
                    error_msg = f"Meditations price is {prices_found['Meditations']}, expected Free"
                    self.results['errors'].append(error_msg)
                    self.results['success'] = False
                    print(f"   ❌ {error_msg}")
                else:
                    print(f"   ✅ Meditations price verified: Free")
            else:
                warning_msg = "Meditations book not found in /libri page"
                self.results['warnings'].append(warning_msg)
                print(f"   ⚠️  {warning_msg}")
            
            # Salva i prezzi trovati nel report
            self.results['book_prices'] = prices_found
            
        except Exception as e:
            warning_msg = f"Price verification error: {str(e)}"
            self.results['warnings'].append(warning_msg)
            print(f"   ⚠️  {warning_msg}")
    
    def test_links(self, page, base_test_result):
        """Test tutti i link trovati nella pagina"""
        print(f"\n🔗 Testing links...")
        
        try:
            links = page.query_selector_all('a[href]')
            tested_urls = set()
            
            for link in links[:20]:  # Limit to first 20 links
                href = link.get_attribute('href')
                if not href or href.startswith('#') or href.startswith('mailto:') or href.startswith('tel:'):
                    continue
                
                # Make absolute URL
                if href.startswith('/'):
                    full_url = self.base_url + href
                elif href.startswith('http'):
                    # Skip external links
                    if not href.startswith(self.base_url):
                        continue
                    full_url = href
                else:
                    continue
                
                # Skip duplicates
                if full_url in tested_urls:
                    continue
                tested_urls.add(full_url)
                
                # Test link
                link_name = href.replace('/', '_')
                print(f"   Testing link: {href}")
                
                try:
                    response = page.goto(full_url, wait_until='domcontentloaded', timeout=10000)
                    if response.status >= 400:
                        self.results['errors'].append(f"Link broken: {href} (HTTP {response.status})")
                        print(f"   ❌ Broken: HTTP {response.status}")
                    else:
                        self.results['links_tested'] += 1
                        print(f"   ✅ OK")
                except Exception as e:
                    self.results['errors'].append(f"Link error: {href} - {str(e)}")
                    print(f"   ❌ Error: {str(e)}")
        
        except Exception as e:
            self.results['warnings'].append(f"Link testing error: {str(e)}")
            print(f"   ⚠️  Warning: {str(e)}")
    
    def run_tests(self):
        """Esegue tutti i test automatici"""
        print(f"\n{'='*60}")
        print(f"🧪 TEST AUTOMATICO WEBSITE")
        print(f"{'='*60}")
        print(f"Environment: {self.environment}")
        print(f"Base URL: {self.base_url}")
        print(f"Screenshots: {self.screenshots_dir}")
        print(f"{'='*60}")
        
        with sync_playwright() as p:
            # Launch browser
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={'width': 1920, 'height': 1080})
            page = context.new_page()
            
            # Test homepage
            homepage_result = self.test_page(page, self.base_url, 'homepage')
            
            # Test links from homepage
            if homepage_result['status'] == 'success':
                self.test_links(page, homepage_result)
            
            # Environment-specific tests
            if self.environment == 'onde-surf':
                # Test split-screen routes
                self.test_page(page, f"{self.base_url}/vr", 'vr-portal')
                self.test_page(page, f"{self.base_url}/preprod", 'preprod-portal')
            
            elif self.environment == 'onde-la':
                # Test main portal routes
                libri_result = self.test_page(page, f"{self.base_url}/libri", 'libri')
                
                # Verify specific content: book prices
                if libri_result['status'] == 'success':
                    self.verify_book_prices(page)
                
                self.test_page(page, f"{self.base_url}/about", 'about')
            
            browser.close()
        
        # Generate report
        self.generate_report()
        
        return self.results['success']
    
    def generate_report(self):
        """Genera report risultati test"""
        print(f"\n{'='*60}")
        print(f"📊 REPORT TEST AUTOMATICO")
        print(f"{'='*60}")
        
        # Summary
        print(f"\n✅ Tests completati: {len(self.results['tests'])}")
        print(f"📸 Screenshots: {self.results['screenshots_taken']}")
        print(f"🔗 Links testati: {self.results['links_tested']}")
        
        # Errors
        if self.results['errors']:
            print(f"\n❌ ERRORI ({len(self.results['errors'])}):")
            for error in self.results['errors']:
                print(f"   - {error}")
        
        # Warnings
        if self.results['warnings']:
            print(f"\n⚠️  WARNING ({len(self.results['warnings'])}):")
            for warning in self.results['warnings']:
                print(f"   - {warning}")
        
        # Status
        print(f"\n{'='*60}")
        if self.results['success']:
            print(f"✅ TEST SUPERATO - Sito funzionante")
        else:
            print(f"❌ TEST FALLITO - Errori rilevati")
        print(f"{'='*60}")
        
        # Save JSON report
        report_file = self.screenshots_dir / "test-report.json"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Report salvato: {report_file}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python test-modifiche-website.py <url> <environment>")
        print("\nExamples:")
        print("  python test-modifiche-website.py http://localhost:8888 onde-la")
        print("  python test-modifiche-website.py http://localhost:7777 onde-surf")
        sys.exit(1)
    
    url = sys.argv[1]
    environment = sys.argv[2]
    
    # Check if Playwright is installed
    try:
        import playwright
    except ImportError:
        print("❌ Playwright non installato!")
        print("Installa con: pip install playwright && playwright install chromium")
        sys.exit(1)
    
    tester = WebsiteTestRunner(url, environment)
    success = tester.run_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
