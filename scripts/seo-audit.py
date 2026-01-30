#!/usr/bin/env python3
"""
SEO Audit Script for onde.la

Crawls the site and checks for:
- Broken internal links (404s)
- Images missing alt text
- Missing meta descriptions
- Orphan pages (no internal links pointing to them)

Usage:
  python seo-audit.py [--site https://onde.la] [--max-pages 100]

Output:
  data/seo/audit-YYYY-MM-DD.json
  Creates broken-links.alert if critical issues found
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import os
from datetime import datetime
from collections import defaultdict
import argparse
import time

# Configuration
DEFAULT_SITE = "https://onde.la"
MAX_PAGES = 100
REQUEST_TIMEOUT = 10
RATE_LIMIT_DELAY = 0.5  # seconds between requests

class SEOAuditor:
    def __init__(self, base_url: str, max_pages: int = MAX_PAGES):
        self.base_url = base_url.rstrip('/')
        self.domain = urlparse(base_url).netloc
        self.max_pages = max_pages
        
        self.visited = set()
        self.to_visit = [self.base_url + '/']
        
        # Results
        self.broken_links = []  # (source_page, broken_url, status_code)
        self.missing_alt = []   # (page, img_src)
        self.missing_meta = []  # pages without meta description
        self.all_pages = set()
        self.internal_links = defaultdict(set)  # page -> set of pages linking to it
        
    def is_internal_url(self, url: str) -> bool:
        """Check if URL belongs to our domain"""
        parsed = urlparse(url)
        return parsed.netloc == '' or parsed.netloc == self.domain
    
    def normalize_url(self, url: str) -> str:
        """Normalize URL for comparison"""
        parsed = urlparse(url)
        # Remove trailing slash and fragment
        path = parsed.path.rstrip('/') or '/'
        return f"{parsed.scheme or 'https'}://{parsed.netloc or self.domain}{path}"
    
    def fetch_page(self, url: str) -> tuple[int, BeautifulSoup | None]:
        """Fetch page and return (status_code, soup)"""
        try:
            response = requests.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                return response.status_code, soup
            return response.status_code, None
        except requests.exceptions.RequestException as e:
            print(f"  Error fetching {url}: {e}")
            return 0, None
    
    def check_link(self, url: str) -> int:
        """Check if URL is accessible, return status code"""
        try:
            response = requests.head(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            return response.status_code
        except requests.exceptions.RequestException:
            return 0
    
    def audit_page(self, url: str, soup: BeautifulSoup):
        """Audit a single page for SEO issues"""
        # Skip non-HTML files for meta check
        skip_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.css', '.js']
        if any(url.lower().endswith(ext) for ext in skip_extensions):
            return  # Skip binary files
        
        # Check meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if not meta_desc or not meta_desc.get('content', '').strip():
            self.missing_meta.append(url)
        
        # Check images for alt text
        for img in soup.find_all('img'):
            src = img.get('src', '')
            alt = img.get('alt', '')
            if not alt or not alt.strip():
                full_src = urljoin(url, src) if src else 'unknown'
                self.missing_alt.append((url, full_src))
        
        # Find all links
        for link in soup.find_all('a', href=True):
            href = link['href']
            
            # Skip anchors, javascript, mailto
            if href.startswith('#') or href.startswith('javascript:') or href.startswith('mailto:'):
                continue
            
            full_url = urljoin(url, href)
            
            if self.is_internal_url(full_url):
                normalized = self.normalize_url(full_url)
                self.internal_links[normalized].add(url)
                
                # Add to crawl queue if not visited
                if normalized not in self.visited and normalized not in self.to_visit:
                    if len(self.visited) + len(self.to_visit) < self.max_pages:
                        self.to_visit.append(normalized)
    
    def crawl(self):
        """Crawl site and collect SEO data"""
        print(f"🔍 Starting SEO audit of {self.base_url}")
        print(f"   Max pages: {self.max_pages}")
        
        while self.to_visit and len(self.visited) < self.max_pages:
            url = self.to_visit.pop(0)
            
            if url in self.visited:
                continue
            
            print(f"  [{len(self.visited) + 1}/{self.max_pages}] {url}")
            self.visited.add(url)
            self.all_pages.add(url)
            
            # Skip binary/non-HTML files
            skip_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot']
            if any(url.lower().endswith(ext) for ext in skip_extensions):
                continue
            
            status, soup = self.fetch_page(url)
            
            if status != 200:
                # Don't count as broken - this is the source page
                continue
            
            if soup:
                self.audit_page(url, soup)
            
            time.sleep(RATE_LIMIT_DELAY)
        
        # Check for broken links (verify all found internal links)
        print(f"\n🔗 Checking {len(self.internal_links)} internal links...")
        for link_url in self.internal_links:
            if link_url not in self.visited:
                status = self.check_link(link_url)
                if status != 200:
                    sources = list(self.internal_links[link_url])[:3]  # First 3 sources
                    self.broken_links.append({
                        'url': link_url,
                        'status': status,
                        'found_on': sources
                    })
                time.sleep(RATE_LIMIT_DELAY / 2)
    
    def find_orphan_pages(self) -> list:
        """Find pages with no internal links pointing to them (except homepage)"""
        orphans = []
        for page in self.all_pages:
            if page == self.base_url + '/' or page == self.base_url:
                continue
            if page not in self.internal_links or len(self.internal_links[page]) == 0:
                orphans.append(page)
        return orphans
    
    def generate_report(self) -> dict:
        """Generate audit report"""
        orphan_pages = self.find_orphan_pages()
        
        report = {
            'audit_date': datetime.now().isoformat(),
            'site': self.base_url,
            'pages_crawled': len(self.visited),
            'summary': {
                'broken_links': len(self.broken_links),
                'missing_alt': len(self.missing_alt),
                'missing_meta': len(self.missing_meta),
                'orphan_pages': len(orphan_pages)
            },
            'issues': {
                'broken_links': self.broken_links,
                'missing_alt': [{'page': p, 'image': i} for p, i in self.missing_alt],
                'missing_meta': self.missing_meta,
                'orphan_pages': orphan_pages
            },
            'severity': 'critical' if self.broken_links else ('warning' if self.missing_meta else 'ok')
        }
        
        return report

def main():
    parser = argparse.ArgumentParser(description='SEO Audit for onde.la')
    parser.add_argument('--site', default=DEFAULT_SITE, help='Site URL to audit')
    parser.add_argument('--max-pages', type=int, default=MAX_PAGES, help='Maximum pages to crawl')
    args = parser.parse_args()
    
    auditor = SEOAuditor(args.site, args.max_pages)
    auditor.crawl()
    report = auditor.generate_report()
    
    # Ensure output directory exists
    os.makedirs('data/seo', exist_ok=True)
    
    # Save report
    date_str = datetime.now().strftime('%Y-%m-%d')
    output_path = f'data/seo/audit-{date_str}.json'
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print(f"\n📊 SEO Audit Complete")
    print(f"   Pages crawled: {report['pages_crawled']}")
    print(f"   Broken links: {report['summary']['broken_links']}")
    print(f"   Missing alt text: {report['summary']['missing_alt']}")
    print(f"   Missing meta descriptions: {report['summary']['missing_meta']}")
    print(f"   Orphan pages: {report['summary']['orphan_pages']}")
    print(f"\n   Report saved to: {output_path}")
    
    # Create alert if critical issues
    if report['summary']['broken_links'] > 0:
        alert_path = 'scripts/broken-links.alert'
        with open(alert_path, 'w') as f:
            f.write(json.dumps({
                'message': f"🔴 SEO Alert: {report['summary']['broken_links']} broken links found on {args.site}",
                'broken_links': report['issues']['broken_links'][:5],  # First 5
                'report_path': output_path
            }, indent=2))
        print(f"   ⚠️ Alert created: {alert_path}")
    
    return 0 if report['severity'] == 'ok' else 1

if __name__ == '__main__':
    exit(main())
