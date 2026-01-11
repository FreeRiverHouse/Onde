#!/usr/bin/env python3
"""
FreeRiver Flow - Anti-Slop Pipeline
Procedura completa anti-slop per Editore Capo
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

from anti_slop_checker import AntiSlopChecker
from grok_reviewer import GrokReviewer

class AntiSlopPipeline:
    def __init__(self):
        self.anti_slop_checker = AntiSlopChecker()
        self.grok_reviewer = GrokReviewer()
        self.results = {}
        
    def run_complete_check(self, file_path: str, book_title: str = "") -> Dict:
        """Esegue procedura anti-slop completa"""
        
        print(f"🔍 AVVIO PROCEDURA ANTI-SLOP")
        print(f"📁 File: {file_path}")
        print(f"📚 Libro: {book_title}")
        print("=" * 50)
        
        # Step 1: Leggi testo
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception as e:
            return {"error": f"Errore lettura file: {e}"}
        
        self.results['file_info'] = {
            'path': file_path,
            'title': book_title,
            'timestamp': datetime.now().isoformat(),
            'text_length': len(text)
        }
        
        # Step 2: Anti-Slop Checker (script nostro)
        print("🤖 Step 1: Anti-Slop Checker...")
        anti_slop_results = self.anti_slop_checker.check_text(text)
        self.results['anti_slop_check'] = anti_slop_results
        
        # Step 3: Grok Review
        print("🧠 Step 2: Grok Review...")
        grok_results = self.grok_reviewer.review_text(text, book_title)
        self.results['grok_review'] = grok_results
        
        # Step 4: Analisi combinata
        print("📊 Step 3: Analisi combinata...")
        combined_analysis = self.combine_analysis(anti_slop_results, grok_results)
        self.results['combined_analysis'] = combined_analysis
        
        # Step 5: Verdict finale
        print("⚖️  Step 4: Verdict finale...")
        final_verdict = self.get_final_verdict(combined_analysis)
        self.results['final_verdict'] = final_verdict
        
        # Step 6: Salva report completo
        self.save_complete_report(file_path)
        
        # Stampa riepilogo
        self.print_summary()
        
        return self.results
    
    def combine_analysis(self, anti_slop: Dict, grok: Dict) -> Dict:
        """Combina risultati di entrambi i revisori"""
        
        total_errors = len(anti_slop.get('errors', [])) + len(grok.get('issues', []))
        total_warnings = len(anti_slop.get('warnings', []))
        
        severity_score = 0
        for issue in grok.get('issues', []):
            severity = issue.get('severity', 'medium')
            if severity == 'critical':
                severity_score += 10
            elif severity == 'high':
                severity_score += 5
            elif severity == 'medium':
                severity_score += 2
            elif severity == 'low':
                severity_score += 1
        
        # Aggiungi peso per errori anti-slop
        severity_score += len(anti_slop.get('errors', [])) * 3
        
        return {
            'total_issues': total_errors,
            'total_warnings': total_warnings,
            'severity_score': severity_score,
            'grok_approved': grok.get('approved', False),
            'grok_score': grok.get('overall_score', 0),
            'anti_slop_errors': len(anti_slop.get('errors', [])),
            'anti_slop_warnings': len(anti_slop.get('warnings', [])),
            'needs_review': total_errors > 0 or not grok.get('approved', False)
        }
    
    def get_final_verdict(self, analysis: Dict) -> Dict:
        """Determina verdict finale basato su analisi combinata"""
        
        if analysis['severity_score'] == 0 and analysis['grok_approved']:
            verdict = 'CLEAN'
            message = '✅ Testo pulito - nessun slop rilevato'
        elif analysis['severity_score'] <= 5 and analysis['grok_score'] >= 7:
            verdict = 'MINOR_ISSUES'
            message = '⚠️  Problemi minori - revisione rapida consigliata'
        elif analysis['severity_score'] <= 15 and analysis['grok_score'] >= 5:
            verdict = 'NEEDS_REVISION'
            message = '🔧 Problemi rilevanti - revisione necessaria'
        else:
            verdict = 'MAJOR_ISSUES'
            message = '❌ Problemi gravi - revisione completa obbligatoria'
        
        return {
            'verdict': verdict,
            'message': message,
            'confidence': max(0, 10 - analysis['severity_score'] // 3),
            'recommended_actions': self.get_recommended_actions(verdict, analysis)
        }
    
    def get_recommended_actions(self, verdict: str, analysis: Dict) -> List[str]:
        """Genera azioni consigliate basate su verdict"""
        
        actions = []
        
        if verdict == 'CLEAN':
            actions = ['Procedere con pubblicazione', 'Testo approvato']
        elif verdict == 'MINOR_ISSUES':
            actions = ['Correggere errori minori', 'Nuovo check automatico', 'Poi procedere']
        elif verdict == 'NEEDS_REVISION':
            actions = ['Correggere tutti gli errori', 'Revisione manuale dettagliata', 'Nuovo check completo']
        else:  # MAJOR_ISSUES
            actions = ['Revisione completa da capo', 'Possibile riscrittura sezioni', 'Check finale multiplo']
        
        return actions
    
    def save_complete_report(self, file_path: str):
        """Salva report completo anti-slop"""
        
        output_dir = Path(file_path).parent
        report_file = output_dir / f"{Path(file_path).stem}_anti_slop_complete.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Report completo salvato in: {report_file}")
    
    def print_summary(self):
        """Stampa riepilogo finale"""
        
        print("\n" + "=" * 50)
        print("📊 RIEPILOGO ANTI-SLOP")
        print("=" * 50)
        
        analysis = self.results.get('combined_analysis', {})
        verdict = self.results.get('final_verdict', {})
        
        print(f"🤖 Anti-Slop Checker: {analysis.get('anti_slop_errors', 0)} errori, {analysis.get('anti_slop_warnings', 0)} warning")
        print(f"🧠 Grok Review: {'✅ APPROVED' if analysis.get('grok_approved') else '❌ REJECTED'} (punteggio: {analysis.get('grok_score', 0)}/10)")
        print(f"⚖️  Verdict finale: {verdict.get('message', 'N/A')}")
        print(f"🎯 Confidence: {verdict.get('confidence', 0)}/10")
        
        if verdict.get('recommended_actions'):
            print(f"\n🔧 Azioni consigliate:")
            for action in verdict['recommended_actions']:
                print(f"   • {action}")

def main():
    if len(sys.argv) < 2:
        print("Uso: python anti_slop_pipeline.py <file_testo> [titolo_libro]")
        sys.exit(1)
    
    file_path = sys.argv[1]
    book_title = sys.argv[2] if len(sys.argv) > 2 else ""
    
    if not os.path.exists(file_path):
        print(f"Errore: File {file_path} non trovato")
        sys.exit(1)
    
    # Verifica API key
    if not os.getenv('XAI_API_KEY'):
        print("Errore: XAI_API_KEY non trovata nelle variabili d'ambiente")
        print("Impostare: export XAI_API_KEY='tua_api_key'")
        sys.exit(1)
    
    pipeline = AntiSlopPipeline()
    results = pipeline.run_complete_check(file_path, book_title)
    
    # Exit code basato su verdict
    verdict = results.get('final_verdict', {}).get('verdict', 'MAJOR_ISSUES')
    if verdict == 'CLEAN':
        sys.exit(0)  # Success
    elif verdict in ['MINOR_ISSUES', 'NEEDS_REVISION']:
        sys.exit(1)  # Warning
    else:
        sys.exit(2)  # Error

if __name__ == "__main__":
    main()
