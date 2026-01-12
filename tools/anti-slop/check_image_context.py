#!/usr/bin/env python3
"""
Anti-Slop Image Context Checker
Verifica che ogni immagine sia corretta nel suo contesto
Esempio: copertina Meditations deve avere Marco Aurelio, NON bambini/fantasmini
"""

import sys
import json
from pathlib import Path
from PIL import Image
import pytesseract

class ImageContextChecker:
    def __init__(self):
        # Definizioni contesti libro
        self.book_contexts = {
            'meditations': {
                'keywords_required': ['marcus', 'aurelius', 'meditation', 'philosophy', 'stoic', 'roman', 'emperor'],
                'keywords_forbidden': ['child', 'kid', 'baby', 'cartoon', 'cute', 'kawaii', 'ghost', 'fairy', 'butterfly', 'flower'],
                'style_required': 'classical, philosophical, elegant, marble, statue',
                'style_forbidden': 'children book, cartoon, cute, colorful, playful'
            },
            'psalm': {
                'keywords_required': ['psalm', 'david', 'shepherd', 'biblical', 'spiritual'],
                'keywords_forbidden': ['cartoon', 'kawaii', 'ghost', 'fairy'],
                'style_required': 'spiritual, elegant, peaceful',
                'style_forbidden': 'children cartoon, cute characters'
            },
            'children_book': {
                'keywords_required': ['child', 'kid', 'story', 'adventure'],
                'keywords_forbidden': ['philosophy', 'meditation', 'stoic'],
                'style_required': 'colorful, playful, illustrated',
                'style_forbidden': 'dark, serious, philosophical'
            }
        }
    
    def detect_book_type(self, book_path: str) -> str:
        """Rileva tipo di libro dal path o nome"""
        book_path_lower = book_path.lower()
        
        if 'meditation' in book_path_lower or 'marcus' in book_path_lower or 'aurelius' in book_path_lower:
            return 'meditations'
        elif 'psalm' in book_path_lower or 'david' in book_path_lower:
            return 'psalm'
        elif 'bambini' in book_path_lower or 'children' in book_path_lower:
            return 'children_book'
        
        return 'unknown'
    
    def analyze_image_content(self, image_path: str) -> dict:
        """Analizza contenuto immagine con OCR e visual analysis"""
        results = {
            'detected_text': '',
            'detected_keywords': [],
            'visual_analysis': {},
            'warnings': []
        }
        
        try:
            img = Image.open(image_path)
            
            # OCR per rilevare testo
            try:
                text = pytesseract.image_to_string(img)
                results['detected_text'] = text.lower()
                
                # Estrai keyword dal testo
                words = text.lower().split()
                results['detected_keywords'] = [w for w in words if len(w) > 3]
            
            except Exception as e:
                results['warnings'].append(f"OCR non disponibile: {str(e)}")
            
            # Visual analysis
            width, height = img.size
            results['visual_analysis'] = {
                'width': width,
                'height': height,
                'aspect_ratio': height / width if width > 0 else 0,
                'mode': img.mode
            }
            
            # Analizza colori dominanti
            img_small = img.resize((100, 100))
            colors = img_small.getcolors(maxcolors=10000)
            if colors:
                # Ordina per frequenza
                colors.sort(reverse=True)
                dominant_colors = colors[:5]
                results['visual_analysis']['dominant_colors_count'] = len(dominant_colors)
                
                # Check se troppo colorato (tipico libri bambini)
                if len(colors) > 500:
                    results['visual_analysis']['color_complexity'] = 'high'
                    results['warnings'].append("Immagine molto colorata (tipico libri bambini)")
                else:
                    results['visual_analysis']['color_complexity'] = 'low'
        
        except Exception as e:
            results['warnings'].append(f"Errore analisi immagine: {str(e)}")
        
        return results
    
    def check_context_match(self, image_path: str, book_path: str) -> dict:
        """Verifica che immagine sia corretta per il contesto del libro"""
        
        # Rileva tipo libro
        book_type = self.detect_book_type(book_path)
        
        if book_type == 'unknown':
            return {
                'approved': False,
                'book_type': 'unknown',
                'errors': ['Impossibile rilevare tipo di libro dal path']
            }
        
        # Analizza immagine
        image_analysis = self.analyze_image_content(image_path)
        
        # Ottieni contesto atteso
        expected_context = self.book_contexts.get(book_type, {})
        
        # Verifica match
        results = {
            'approved': True,
            'book_type': book_type,
            'expected_context': expected_context,
            'image_analysis': image_analysis,
            'errors': [],
            'warnings': image_analysis['warnings']
        }
        
        # Check 1: Keyword proibite
        detected_text = image_analysis['detected_text']
        detected_keywords = image_analysis['detected_keywords']
        
        forbidden_keywords = expected_context.get('keywords_forbidden', [])
        for keyword in forbidden_keywords:
            if keyword in detected_text or keyword in ' '.join(detected_keywords):
                results['approved'] = False
                results['errors'].append(
                    f"ERRORE: Keyword proibita rilevata: '{keyword}' (non adatta per {book_type})"
                )
        
        # Check 2: Keyword richieste (almeno una)
        required_keywords = expected_context.get('keywords_required', [])
        found_required = False
        for keyword in required_keywords:
            if keyword in detected_text or keyword in ' '.join(detected_keywords):
                found_required = True
                break
        
        if not found_required and required_keywords:
            results['warnings'].append(
                f"WARNING: Nessuna keyword richiesta trovata. Attese: {', '.join(required_keywords[:3])}"
            )
        
        # Check 3: Complessità colori (per libri filosofici)
        if book_type in ['meditations', 'psalm']:
            color_complexity = image_analysis['visual_analysis'].get('color_complexity', 'unknown')
            if color_complexity == 'high':
                results['approved'] = False
                results['errors'].append(
                    f"ERRORE: Immagine troppo colorata/cartoon per libro {book_type} (deve essere elegante/classica)"
                )
        
        return results
    
    def print_report(self, results: dict, image_path: str, book_path: str):
        """Stampa report verifica contesto"""
        print(f"\n🔍 IMAGE CONTEXT CHECK")
        print("=" * 70)
        print(f"📖 Libro: {Path(book_path).name}")
        print(f"🖼️  Immagine: {Path(image_path).name}")
        print(f"📚 Tipo libro rilevato: {results['book_type']}")
        print("=" * 70)
        
        if results['book_type'] != 'unknown':
            expected = results['expected_context']
            print(f"\n✅ CONTESTO ATTESO:")
            print(f"   Keywords richieste: {', '.join(expected.get('keywords_required', [])[:5])}")
            print(f"   Keywords proibite: {', '.join(expected.get('keywords_forbidden', [])[:5])}")
            print(f"   Stile richiesto: {expected.get('style_required', 'N/A')}")
            print(f"   Stile proibito: {expected.get('style_forbidden', 'N/A')}")
        
        print(f"\n🔍 ANALISI IMMAGINE:")
        image_analysis = results['image_analysis']
        visual = image_analysis['visual_analysis']
        print(f"   Dimensioni: {visual.get('width', 0)}x{visual.get('height', 0)}")
        print(f"   Complessità colori: {visual.get('color_complexity', 'unknown')}")
        
        if image_analysis['detected_keywords']:
            print(f"   Keywords rilevate: {', '.join(image_analysis['detected_keywords'][:10])}")
        
        if results['warnings']:
            print(f"\n⚠️  WARNINGS:")
            for warning in results['warnings']:
                print(f"   • {warning}")
        
        if results['errors']:
            print(f"\n❌ ERRORS:")
            for error in results['errors']:
                print(f"   • {error}")
        
        # Verdetto finale
        print("\n" + "=" * 70)
        if results['approved']:
            print("✅ VERDETTO: IMMAGINE CORRETTA PER IL CONTESTO")
            return True
        else:
            print("🚫 VERDETTO: IMMAGINE NON CORRETTA PER IL CONTESTO")
            print("   L'immagine NON è appropriata per questo libro")
            return False

def main():
    if len(sys.argv) < 3:
        print("Usage: python check_image_context.py <image_path> <book_path>")
        print("\nEsempio:")
        print("  python check_image_context.py cover.jpg books/meditations/")
        sys.exit(1)
    
    image_path = sys.argv[1]
    book_path = sys.argv[2]
    
    if not Path(image_path).exists():
        print(f"❌ Errore: Immagine non trovata: {image_path}")
        sys.exit(1)
    
    checker = ImageContextChecker()
    results = checker.check_context_match(image_path, book_path)
    is_valid = checker.print_report(results, image_path, book_path)
    
    sys.exit(0 if is_valid else 1)

if __name__ == "__main__":
    main()
