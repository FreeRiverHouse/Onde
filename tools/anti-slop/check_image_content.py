#!/usr/bin/env python3
"""
Anti-Slop Image Content Checker
Rileva screenshot, conversazioni, dati personali in immagini
"""

import sys
from pathlib import Path
from PIL import Image
import pytesseract

def check_image_content(image_path: str) -> dict:
    """
    Verifica contenuto immagine per rilevare:
    - Screenshot (presenza UI elements, status bar, etc)
    - Conversazioni (chat bubbles, messaggi)
    - Dati personali (nomi, email, telefoni)
    """
    
    results = {
        'is_screenshot': False,
        'has_conversation': False,
        'has_personal_data': False,
        'warnings': [],
        'errors': []
    }
    
    try:
        img = Image.open(image_path)
        
        # Check 1: Dimensioni tipiche screenshot mobile
        width, height = img.size
        aspect_ratio = height / width if width > 0 else 0
        
        # iPhone/Android screenshot ratios comuni
        screenshot_ratios = [
            (16/9, 0.1),   # ~1.78
            (19.5/9, 0.1), # ~2.17
            (2.16, 0.1),   # iPhone X+
            (2.0, 0.1)     # iPad
        ]
        
        for ratio, tolerance in screenshot_ratios:
            if abs(aspect_ratio - ratio) < tolerance:
                results['is_screenshot'] = True
                results['warnings'].append(
                    f"Aspect ratio {aspect_ratio:.2f} tipico di screenshot mobile"
                )
                break
        
        # Check 2: OCR per rilevare testo conversazione
        try:
            text = pytesseract.image_to_string(img)
            text_lower = text.lower()
            
            # Pattern conversazioni
            conversation_keywords = [
                'whatsapp', 'telegram', 'messenger', 'imessage',
                'chat', 'message', 'typing', 'online',
                'read', 'delivered', 'sent', 'received'
            ]
            
            for keyword in conversation_keywords:
                if keyword in text_lower:
                    results['has_conversation'] = True
                    results['errors'].append(
                        f"Rilevata keyword conversazione: '{keyword}'"
                    )
            
            # Pattern dati personali
            personal_data_patterns = [
                '@', 'gmail', 'email', 'phone', 'tel:',
                '+39', '+1', 'whatsapp.com'
            ]
            
            for pattern in personal_data_patterns:
                if pattern in text_lower:
                    results['has_personal_data'] = True
                    results['errors'].append(
                        f"Rilevato possibile dato personale: '{pattern}'"
                    )
        
        except Exception as e:
            results['warnings'].append(f"OCR non disponibile: {str(e)}")
        
        # Check 3: Presenza UI elements (status bar, navigation bar)
        # Analizza top/bottom 10% dell'immagine per pattern UI
        top_section = img.crop((0, 0, width, int(height * 0.1)))
        bottom_section = img.crop((0, int(height * 0.9), width, height))
        
        # Controlla se top/bottom hanno colori uniformi (tipico UI)
        top_colors = top_section.getcolors(maxcolors=10)
        bottom_colors = bottom_section.getcolors(maxcolors=10)
        
        if top_colors and len(top_colors) <= 3:
            results['warnings'].append("Top section con pochi colori (possibile status bar)")
        
        if bottom_colors and len(bottom_colors) <= 3:
            results['warnings'].append("Bottom section con pochi colori (possibile navigation bar)")
    
    except Exception as e:
        results['errors'].append(f"Errore analisi immagine: {str(e)}")
    
    return results

def print_report(results: dict, image_path: str):
    """Stampa report check immagine"""
    print(f"\n🔍 IMAGE CONTENT CHECK: {Path(image_path).name}")
    print("=" * 60)
    
    if results['is_screenshot']:
        print("⚠️  WARNING: Immagine sembra essere uno SCREENSHOT")
    
    if results['has_conversation']:
        print("❌ ERRORE: Rilevata CONVERSAZIONE nell'immagine")
    
    if results['has_personal_data']:
        print("❌ ERRORE: Rilevati possibili DATI PERSONALI")
    
    if results['warnings']:
        print("\n⚠️  WARNINGS:")
        for warning in results['warnings']:
            print(f"   • {warning}")
    
    if results['errors']:
        print("\n❌ ERRORS:")
        for error in results['errors']:
            print(f"   • {error}")
    
    # Verdetto finale
    print("\n" + "=" * 60)
    if results['has_conversation'] or results['has_personal_data']:
        print("🚫 VERDETTO: IMMAGINE NON VALIDA PER PUBBLICAZIONE")
        print("   Contiene screenshot/conversazioni/dati personali")
        return False
    elif results['is_screenshot']:
        print("⚠️  VERDETTO: IMMAGINE SOSPETTA")
        print("   Verificare manualmente se è screenshot")
        return False
    else:
        print("✅ VERDETTO: IMMAGINE VALIDA")
        return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_image_content.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not Path(image_path).exists():
        print(f"❌ Errore: File non trovato: {image_path}")
        sys.exit(1)
    
    results = check_image_content(image_path)
    is_valid = print_report(results, image_path)
    
    sys.exit(0 if is_valid else 1)
