#!/usr/bin/env python3
"""
FreeRiver Flow - Anti-Slop Checker
Strumento per rilevare e correggere AI slop nei testi
Inclusi check per errori visivi e strutturali
"""

import re
import sys
import json
import os
from typing import List, Dict, Tuple
from pathlib import Path
from PIL import Image
import imagehash

class AntiSlopChecker:
    def __init__(self):
        self.errors = []
        self.warnings = []
        
        # Pattern per rilevare problemi
        self.corrupted_chars = [
            'â€™', 'â€œ', 'â€', 'â€¦', 'Â', 'â€˜', 'â€\x9d', 'â€\x9c'
        ]
        
        self.external_publishers = [
            'Penguin Classics', 'Random House', 'HarperCollins', 
            'Simon & Schuster', 'Macmillan', 'Hachette',
            'Oxford University Press', 'Cambridge University Press',
            'Penguin Random House', 'HarperCollins Publishers'
        ]
        
        self.strange_patterns = [
            r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
            r'ID\s*[0-9]+',
            r'ISBN\s*[^0-9X\n]',
            r'\[.*?\]\(.*?\)',  # Markdown links anomali
            r'<.*?>',  # HTML tags
            r'&[a-zA-Z]+;',  # HTML entities
        ]
        
        # Soglie per check strutturali
        self.page_loss_threshold = 0.10  # 10% calo pagine = errore
        self.size_loss_threshold = 0.20  # 20% calo dimensione = warning
        
    def check_text(self, text: str, book_path: str = None) -> Dict:
        """Esegue check completo del testo e struttura libro"""
        results = {
            'errors': [],
            'warnings': [],
            'stats': {},
            'corrections': {},
            'visual_checks': {}
        }
        
        # Dividi testo in linee per analisi dettagliata
        lines = text.split('\n')
        
        # Check 1: Caratteri corrotti
        corrupted_found = self.check_corrupted_characters(text)
        if corrupted_found:
            results['errors'].extend(corrupted_found)
        
        # Check 2: Editori esterni
        external_found = self.check_external_publishers(text)
        if external_found:
            results['errors'].extend(external_found)
        
        # Check 3: Pattern strani
        strange_found = self.check_strange_patterns(text)
        if strange_found:
            results['warnings'].extend(strange_found)
        
        # Check 4: Statistiche testo
        results['stats'] = self.get_text_stats(text)
        
        # Check 5: Suggerimenti correzione
        results['corrections'] = self.generate_corrections(text)
        
        # Check 6: Struttura HTML (se fornito book_path)
        if book_path:
            html_checks = self.check_html_structure(book_path)
            results['warnings'].extend(html_checks.get('warnings', []))
            results['errors'].extend(html_checks.get('errors', []))
            results['stats'].update(html_checks.get('stats', {}))
        
        # Check 7: Immagini (se fornito book_path)
        if book_path:
            image_checks = self.check_images(book_path)
            results['visual_checks'] = image_checks
            results['warnings'].extend(image_checks.get('warnings', []))
            results['errors'].extend(image_checks.get('errors', []))
        
        return results
    
    def check_corrupted_characters(self, text: str) -> List[Dict]:
        """Rileva caratteri corrotti"""
        errors = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for char in self.corrupted_chars:
                if char in line:
                    errors.append({
                        'type': 'corrupted_character',
                        'line': line_num,
                        'char': char,
                        'context': line.strip()[:100],
                        'suggestion': self.fix_corrupted_char(char)
                    })
        
        return errors
    
    def check_external_publishers(self, text: str) -> List[Dict]:
        """Rileva riferimenti a editori esterni"""
        errors = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for publisher in self.external_publishers:
                if publisher.lower() in line.lower():
                    errors.append({
                        'type': 'external_publisher',
                        'line': line_num,
                        'publisher': publisher,
                        'context': line.strip()[:100],
                        'suggestion': 'Rimuovere riferimento a editore esterno'
                    })
        
        return errors
    
    def check_strange_patterns(self, text: str) -> List[Dict]:
        """Rileva pattern anomali"""
        warnings = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for pattern in self.strange_patterns:
                matches = re.finditer(pattern, line)
                for match in matches:
                    warnings.append({
                        'type': 'strange_pattern',
                        'line': line_num,
                        'pattern': pattern,
                        'match': match.group(),
                        'context': line.strip()[:100],
                        'suggestion': 'Verificare se questo pattern è voluto'
                    })
        
        return warnings
    
    def get_text_stats(self, text: str) -> Dict:
        """Calcola statistiche del testo"""
        return {
            'total_chars': len(text),
            'total_words': len(text.split()),
            'total_lines': len(text.split('\n')),
            'empty_lines': text.count('\n\n'),
            'special_chars': len(re.findall(r'[^a-zA-Z0-9\s\.\,\;\:\!\?\-\n\r]', text))
        }
    
    def generate_corrections(self, text: str) -> Dict:
        """Genera suggerimenti di correzione automatica"""
        corrections = {}
        
        # Mappa caratteri corrotti -> correzioni
        char_corrections = {
            'â€™': "'",
            'â€œ': '"',
            'â€': '"',
            'â€¦': '...',
            'â€˜': "'",
            'â€\x9d': '"',
            'â€\x9c': '"',
            'Â': ''
        }
        
        corrected_text = text
        for corrupted, correct in char_corrections.items():
            corrected_text = corrected_text.replace(corrupted, correct)
        
        corrections['auto_corrected_text'] = corrected_text
        corrections['corrections_applied'] = len([c for c in char_corrections if c in text])
        
        return corrections
    
    def fix_corrupted_char(self, char: str) -> str:
        """Restituisce la correzione per un carattere corrotto"""
        corrections = {
            'â€™': "'",
            'â€œ': '"',
            'â€': '"',
            'â€¦': '...',
            'â€˜': "'",
            'â€\x9d': '"',
            'â€\x9c': '"',
            'Â': ''
        }
        return corrections.get(char, 'Rimuovere carattere')
    
    def check_html_structure(self, book_path: str) -> Dict:
        """Check struttura HTML del libro"""
        results = {'errors': [], 'warnings': [], 'stats': {}}
        
        book_dir = Path(book_path)
        if not book_dir.exists():
            return results
        
        # Trova file HTML principale
        html_files = list(book_dir.glob('*.html'))
        
        for html_file in html_files:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check 1: Conta pagine
            page_count = content.count('<div class="page')
            results['stats']['html_pages'] = page_count
            
            # Check 2: Immagini rotte
            img_tags = re.findall(r'<img[^>]+src="([^"]+)"', content)
            broken_images = []
            for img_src in img_tags:
                img_path = book_dir / img_src
                if not img_path.exists():
                    broken_images.append(img_src)
            
            if broken_images:
                results['errors'].append({
                    'type': 'broken_images',
                    'count': len(broken_images),
                    'images': broken_images,
                    'suggestion': 'Verificare che tutte le immagini esistano'
                })
            
            # Check 3: Pagine troppo poche
            if page_count < 5:
                results['warnings'].append({
                    'type': 'low_page_count',
                    'count': page_count,
                    'suggestion': 'Numero pagine sospettosamente basso'
                })
        
        return results
    
    def check_images(self, book_path: str) -> Dict:
        """Check immagini del libro per duplicati e problemi"""
        results = {'errors': [], 'warnings': [], 'duplicates': []}
        
        book_dir = Path(book_path)
        images_dir = book_dir / 'images'
        
        if not images_dir.exists():
            return results
        
        # Trova tutte le immagini
        image_files = list(images_dir.glob('*.jpg')) + list(images_dir.glob('*.png'))
        
        if not image_files:
            return results
        
        # Check duplicati usando perceptual hashing
        try:
            hashes = {}
            for img_file in image_files:
                try:
                    img = Image.open(img_file)
                    img_hash = str(imagehash.average_hash(img))
                    
                    if img_hash in hashes:
                        results['duplicates'].append({
                            'original': hashes[img_hash],
                            'duplicate': str(img_file.name),
                            'hash': img_hash
                        })
                    else:
                        hashes[img_hash] = str(img_file.name)
                except Exception as e:
                    results['warnings'].append({
                        'type': 'image_read_error',
                        'file': str(img_file.name),
                        'error': str(e)
                    })
            
            if results['duplicates']:
                results['warnings'].append({
                    'type': 'duplicate_images',
                    'count': len(results['duplicates']),
                    'suggestion': 'Verificare immagini duplicate (potrebbero essere copertine doppie)'
                })
        
        except ImportError:
            results['warnings'].append({
                'type': 'missing_dependency',
                'message': 'PIL/imagehash non disponibile per check duplicati'
            })
        
        return results
    
    def print_report(self, results: Dict):
        """Stampa report dettagliato"""
        print("🔍 ANTI-SLOP CHECK REPORT")
        print("=" * 50)
        
        print(f"📊 STATISTICHE TESTO:")
        stats = results['stats']
        print(f"   Caratteri: {stats['total_chars']}")
        print(f"   Parole: {stats['total_words']}")
        print(f"   Linee: {stats['total_lines']}")
        print(f"   Caratteri speciali: {stats['special_chars']}")
        
        print(f"\n❌ ERRORI TROVATI: {len(results['errors'])}")
        for error in results['errors']:
            print(f"   Linea {error['line']}: {error['type']}")
            print(f"   Contesto: {error['context']}")
            print(f"   Suggerimento: {error['suggestion']}")
            print()
        
        print(f"⚠️  WARNING: {len(results['warnings'])}")
        for warning in results['warnings']:
            print(f"   Linea {warning['line']}: {warning['type']}")
            print(f"   Pattern: {warning['match']}")
            print(f"   Suggerimento: {warning['suggestion']}")
            print()
        
        print(f"🔧 CORREZIONI:")
        corrections = results['corrections']
        print(f"   Correzioni applicate: {corrections['corrections_applied']}")
        
        if results['errors'] or results['warnings']:
            print(f"\n❌ TESTO CONTIENE SLOP - RICHIEDE REVISIONE")
        else:
            print(f"\n✅ TESTO PULITO - NESSUN SLOP TROVATO")

def main():
    if len(sys.argv) != 2:
        print("Uso: python anti_slop_checker.py <file_testo>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception as e:
        print(f"Errore leggendo il file: {e}")
        sys.exit(1)
    
    checker = AntiSlopChecker()
    results = checker.check_text(text)
    checker.print_report(results)
    
    # Salva risultati in JSON
    output_file = file_path.replace('.txt', '_anti_slop_report.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Report salvato in: {output_file}")

if __name__ == "__main__":
    main()
