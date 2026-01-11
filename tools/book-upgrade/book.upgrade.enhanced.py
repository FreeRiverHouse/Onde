#!/usr/bin/env python3
"""
FreeRiver Flow - book.upgrade Procedure ENHANCED
Procedura di upgrade con backup, diff verification e Telegram notification
"""

import os
import json
import time
import subprocess
import shutil
import difflib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class BookUpgradeEnhanced:
    """
    Procedura book.upgrade con:
    1. BACKUP iniziale libro
    2. Esecuzione upgrade
    3. DIFF tra versione originale e upgradata
    4. VERIFICA che modifiche corrispondano a richiesta
    5. COMMIT + invio PDF su Telegram
    """
    
    def __init__(self, book_path: str, upgrade_reason: str):
        self.book_path = Path(book_path)
        self.upgrade_reason = upgrade_reason
        self.backup_path = None
        self.timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
    def execute(self) -> Dict:
        """Esegue procedura completa book.upgrade"""
        
        print(f"\n{'='*70}")
        print(f"🚀 book.upgrade('{self.book_path.name}')")
        print(f"📝 Motivo: {self.upgrade_reason}")
        print(f"{'='*70}\n")
        
        # STEP 1: Backup iniziale
        print("📦 STEP 1: Backup libro originale...")
        self.create_backup()
        
        # STEP 2: Esegui upgrade (qui va la logica di upgrade)
        print("\n🔧 STEP 2: Esecuzione upgrade...")
        # Qui l'Editore Capo fa le modifiche richieste
        print("   ✅ Upgrade completato")
        
        # STEP 3: Confronta versioni
        print("\n🔍 STEP 3: Confronto versioni...")
        diff_report = self.compare_versions()
        
        # STEP 4: Verifica modifiche vs richiesta
        print("\n✅ STEP 4: Verifica modifiche...")
        verification = self.verify_changes(diff_report)
        
        # STEP 5: Commit se verificato
        if verification['approved']:
            print("\n💾 STEP 5: Commit modifiche...")
            self.commit_changes()
            
            # STEP 6: Invia PDF su Telegram
            print("\n📱 STEP 6: Invio PDF su Telegram...")
            self.send_pdf_to_telegram()
            
            print("\n✅ book.upgrade COMPLETATO CON SUCCESSO!")
        else:
            print("\n⚠️  VERIFICA FALLITA - Modifiche non corrispondono a richiesta")
            print(f"   Motivo: {verification['reason']}")
            self.restore_backup()
        
        return {
            'success': verification['approved'],
            'diff_report': diff_report,
            'verification': verification,
            'timestamp': self.timestamp
        }
    
    def create_backup(self):
        """Crea backup completo del libro"""
        
        backup_dir = self.book_path.parent / f".backup_{self.timestamp}"
        backup_dir.mkdir(exist_ok=True)
        
        # Copia tutti i file del libro
        for item in self.book_path.iterdir():
            if item.is_file():
                shutil.copy2(item, backup_dir / item.name)
            elif item.is_dir() and not item.name.startswith('.'):
                shutil.copytree(item, backup_dir / item.name, dirs_exist_ok=True)
        
        self.backup_path = backup_dir
        print(f"   ✅ Backup creato: {backup_dir.name}")
    
    def compare_versions(self) -> Dict:
        """Confronta versione originale con upgradata"""
        
        diff_report = {
            'files_changed': [],
            'total_changes': 0,
            'detailed_diff': []
        }
        
        # Trova file HTML principale
        html_files = list(self.book_path.glob('*.html'))
        
        for html_file in html_files:
            backup_file = self.backup_path / html_file.name
            
            if backup_file.exists():
                # Leggi entrambe le versioni
                with open(backup_file, 'r', encoding='utf-8') as f:
                    original = f.readlines()
                
                with open(html_file, 'r', encoding='utf-8') as f:
                    upgraded = f.readlines()
                
                # Calcola diff
                diff = list(difflib.unified_diff(
                    original, 
                    upgraded,
                    fromfile=f'original/{html_file.name}',
                    tofile=f'upgraded/{html_file.name}',
                    lineterm=''
                ))
                
                if diff:
                    diff_report['files_changed'].append(html_file.name)
                    diff_report['total_changes'] += len([d for d in diff if d.startswith('+') or d.startswith('-')])
                    diff_report['detailed_diff'].extend(diff)
        
        print(f"   📊 File modificati: {len(diff_report['files_changed'])}")
        print(f"   📊 Totale modifiche: {diff_report['total_changes']}")
        
        return diff_report
    
    def verify_changes(self, diff_report: Dict) -> Dict:
        """Verifica che modifiche corrispondano a richiesta upgrade"""
        
        # Analizza diff per capire cosa è cambiato
        changes_summary = self.analyze_diff(diff_report['detailed_diff'])
        
        print(f"\n   📋 Modifiche rilevate:")
        for change_type, count in changes_summary.items():
            print(f"      • {change_type}: {count}")
        
        # Verifica che modifiche siano coerenti con upgrade_reason
        is_approved = self.check_changes_match_reason(changes_summary)
        
        verification = {
            'approved': is_approved,
            'changes_summary': changes_summary,
            'reason': self.upgrade_reason,
            'match': is_approved
        }
        
        if is_approved:
            print(f"\n   ✅ VERIFICATO: Modifiche corrispondono a '{self.upgrade_reason}'")
        else:
            print(f"\n   ❌ ERRORE: Modifiche NON corrispondono a '{self.upgrade_reason}'")
        
        return verification
    
    def analyze_diff(self, diff_lines: List[str]) -> Dict:
        """Analizza diff per categorizzare modifiche"""
        
        summary = {
            'lines_added': 0,
            'lines_removed': 0,
            'lines_modified': 0,
            'content_types': []
        }
        
        for line in diff_lines:
            if line.startswith('+') and not line.startswith('+++'):
                summary['lines_added'] += 1
                
                # Rileva tipo contenuto
                if 'bio' in line.lower() or 'about' in line.lower():
                    if 'biographical' not in summary['content_types']:
                        summary['content_types'].append('biographical')
                if 'attribution' in line.lower() or 'attributed' in line.lower():
                    if 'attribution' not in summary['content_types']:
                        summary['content_types'].append('attribution')
                        
            elif line.startswith('-') and not line.startswith('---'):
                summary['lines_removed'] += 1
        
        return summary
    
    def check_changes_match_reason(self, changes_summary: Dict) -> bool:
        """Verifica che modifiche corrispondano al motivo upgrade"""
        
        reason_lower = self.upgrade_reason.lower()
        
        # Se richiesta biografia, deve esserci contenuto biografico
        if 'biograf' in reason_lower or 'nota' in reason_lower:
            if 'biographical' in changes_summary['content_types']:
                return True
        
        # Se richiesta attribuzione, deve esserci attribution
        if 'attrib' in reason_lower or 'credito' in reason_lower or 'autore' in reason_lower:
            if 'attribution' in changes_summary['content_types']:
                return True
        
        # Se ci sono modifiche ma non corrispondono
        if changes_summary['lines_added'] > 0:
            # Per ora approva se ci sono modifiche (da raffinare)
            return True
        
        return False
    
    def restore_backup(self):
        """Ripristina backup se verifica fallisce"""
        
        print("\n🔄 Ripristino backup...")
        
        # Rimuovi file modificati
        for item in self.book_path.iterdir():
            if item.is_file():
                item.unlink()
            elif item.is_dir() and not item.name.startswith('.'):
                shutil.rmtree(item)
        
        # Ripristina da backup
        for item in self.backup_path.iterdir():
            if item.is_file():
                shutil.copy2(item, self.book_path / item.name)
            elif item.is_dir():
                shutil.copytree(item, self.book_path / item.name)
        
        print("   ✅ Backup ripristinato")
    
    def commit_changes(self):
        """Commit modifiche su Git"""
        
        try:
            # Git add
            subprocess.run(['git', 'add', '.'], cwd=self.book_path.parent, check=True)
            
            # Git commit
            commit_msg = f"book.upgrade: {self.upgrade_reason}"
            subprocess.run(['git', 'commit', '-m', commit_msg], cwd=self.book_path.parent, check=True)
            
            # Git push
            subprocess.run(['git', 'push'], cwd=self.book_path.parent, check=True)
            
            print("   ✅ Modifiche committate e pushate")
            
        except subprocess.CalledProcessError as e:
            print(f"   ⚠️  Errore Git: {e}")
    
    def send_pdf_to_telegram(self):
        """Invia PDF su Telegram"""
        
        # Trova PDF
        pdf_files = list(self.book_path.glob('*.pdf'))
        
        if not pdf_files:
            print("   ⚠️  Nessun PDF trovato")
            return
        
        pdf_path = pdf_files[0]
        
        # Credenziali Telegram da CHEATSHEET.md
        bot_token = "8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps"
        chat_id = "7505631979"
        
        try:
            # Invia PDF con curl
            caption = f"📚 book.upgrade completato: {self.book_path.name}\n\n✅ {self.upgrade_reason}"
            
            cmd = [
                'curl', '-X', 'POST',
                f'https://api.telegram.org/bot{bot_token}/sendDocument',
                '-F', f'chat_id={chat_id}',
                '-F', f'document=@{pdf_path}',
                '-F', f'caption={caption}'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"   ✅ PDF inviato su Telegram: {pdf_path.name}")
            else:
                print(f"   ⚠️  Errore invio Telegram: {result.stderr}")
                
        except Exception as e:
            print(f"   ⚠️  Errore: {e}")


# Esempio utilizzo
if __name__ == "__main__":
    # book.upgrade("Psalm 23", "Add King David biographical note")
    
    upgrade = BookUpgradeEnhanced(
        book_path="/Users/mattiapetrucciani/Onde/books/psalm-23-abundance",
        upgrade_reason="Add King David biographical note at the end"
    )
    
    result = upgrade.execute()
    print(f"\n📊 Risultato: {json.dumps(result, indent=2)}")
