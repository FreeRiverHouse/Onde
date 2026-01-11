#!/usr/bin/env python3
"""
FreeRiver Flow - Grok Reviewer
Integrazione con Grok API per revisione testi
"""

import os
import json
import requests
from typing import Dict, List

class GrokReviewer:
    def __init__(self):
        self.api_key = os.getenv('XAI_API_KEY')
        self.base_url = "https://api.x.ai/v1/chat/completions"
        
        if not self.api_key:
            raise ValueError("XAI_API_KEY non trovata nelle variabili d'ambiente")
    
    def review_text(self, text: str, book_title: str = "") -> Dict:
        """Invia testo a Grok per revisione completa"""
        
        prompt = f"""Sei un editor esperto. Analizza questo testo per un libro intitolato "{book_title}" e verifica:

1. Grammatica e spelling corretti?
2. Caratteri corrotti o strani (â€™ invece di ')?
3. Codici ID o riferimenti anomali?
4. Menzioni di altri editori (Penguin, Random House, etc.)?
5. Prefazioni non autorizzate?
6. Testo autentico dell'autore?
7. Formattazione inconsistente?
8. Contenuti inappropriati o fuori contesto?

Rispondi in JSON con questo formato:
{{
    "approved": true/false,
    "issues": [
        {{
            "type": "grammar|corrupted_chars|external_publisher|formatting|content",
            "line": "numero linea se applicabile",
            "description": "descrizione problema",
            "severity": "low|medium|high|critical"
        }}
    ],
    "suggestions": ["suggerimento 1", "suggerimento 2"],
    "overall_score": "1-10"
}}

TESTO DA ANALIZZARE:
{text[:10000]}"""
        
        try:
            response = requests.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "grok-2-latest",
                    "messages": [
                        {"role": "system", "content": "Sei un editor esperto che analizza testi per pubblicazione."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # Try to parse JSON from response
                try:
                    review_data = json.loads(content)
                    return review_data
                except json.JSONDecodeError:
                    # Fallback if not valid JSON
                    return {
                        "approved": False,
                        "issues": [{"type": "parsing_error", "description": "Impossibile parsare risposta Grok", "severity": "medium"}],
                        "suggestions": ["Verificare manualmente il testo"],
                        "overall_score": 5,
                        "raw_response": content
                    }
            else:
                return {
                    "approved": False,
                    "issues": [{"type": "api_error", "description": f"Errore API: {response.status_code}", "severity": "high"}],
                    "suggestions": ["Riprovare più tardi"],
                    "overall_score": 1
                }
                
        except Exception as e:
            return {
                "approved": False,
                "issues": [{"type": "connection_error", "description": f"Errore connessione: {str(e)}", "severity": "high"}],
                "suggestions": ["Verificare connessione e API key"],
                "overall_score": 1
            }
    
    def quick_check(self, text: str) -> str:
        """Check rapido che restituisce APPROVED/NEEDS_FIXES"""
        result = self.review_text(text)
        return "APPROVED" if result.get("approved", False) else "NEEDS_FIXES"

def main():
    if len(sys.argv) != 2:
        print("Uso: python grok_reviewer.py <file_testo>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception as e:
        print(f"Errore leggendo il file: {e}")
        sys.exit(1)
    
    reviewer = GrokReviewer()
    result = reviewer.review_text(text, os.path.basename(file_path))
    
    print("🤖 GROK REVIEW REPORT")
    print("=" * 40)
    print(f"Stato: {'✅ APPROVED' if result['approved'] else '❌ NEEDS FIXES'}")
    print(f"Punteggio: {result.get('overall_score', 'N/A')}/10")
    
    if result.get('issues'):
        print(f"\nProblemi trovati ({len(result['issues'])}):")
        for issue in result['issues']:
            print(f"  - {issue['type']}: {issue['description']}")
    
    if result.get('suggestions'):
        print(f"\nSuggerimenti:")
        for suggestion in result['suggestions']:
            print(f"  • {suggestion}")
    
    # Save report
    output_file = file_path.replace('.txt', '_grok_review.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Report salvato in: {output_file}")

if __name__ == "__main__":
    import sys
    main()
