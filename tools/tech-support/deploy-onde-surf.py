#!/usr/bin/env python3
"""
Deploy Onde.surf - VELOCE
Deploy rapido su onde.surf per development

CARATTERISTICHE:
- Veloce e agile
- Meno check (solo essenziali)
- Per iterazioni rapide di development
- Saltiamo passaggi non critici

DIFFERENZE vs deploy-onde-la.py:
- onde.surf: veloce, meno blindato
- onde.la: blindato, più check, SACRO

Usage:
    python deploy-onde-surf.py <book-id> <version>
    
Example:
    python deploy-onde-surf.py meditations Meditations-Eng-v1
"""

import sys
import os
import subprocess
from pathlib import Path
from datetime import datetime
import json

class OndeSurfDeployer:
    def __init__(self, onde_root: str):
        self.onde_root = Path(onde_root)
        self.portal_path = self.onde_root / "apps" / "onde-portal"
        self.staging_dir = self.onde_root / "staging" / "portal-updates"
        
    def deploy_book(self, book_id: str, version: str):
        """Deploy veloce su onde.surf"""
        
        print(f"\n🚀 DEPLOY ONDE.SURF - VELOCE")
        print("=" * 60)
        print(f"📚 Libro: {book_id}")
        print(f"📦 Versione: {version}")
        print(f"🌐 Target: onde.surf")
        print(f"⚡ Modalità: VELOCE (meno check)")
        print("=" * 60)
        
        # Step 1: Verifica file in staging
        print(f"\n📦 STEP 1: Verifica file staging")
        staging_path = self.staging_dir / book_id / version
        
        if not staging_path.exists():
            print(f"❌ ERRORE: Staging non trovato: {staging_path}")
            return False
        
        instructions_file = staging_path / "tech-support-instructions.json"
        if not instructions_file.exists():
            print(f"❌ ERRORE: Istruzioni non trovate")
            return False
        
        with open(instructions_file, 'r') as f:
            instructions = json.load(f)
        
        print(f"✅ File staging trovati")
        print(f"   Modalità: {instructions['mode']}")
        
        # Step 2: Copia file nel portale (VELOCE, no backup)
        print(f"\n📁 STEP 2: Copia file nel portale")
        
        target_paths = instructions['target_paths']
        for file_type, target_path in target_paths.items():
            source_file = staging_path / instructions['files'][file_type]
            dest_file = self.onde_root / target_path
            
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Copia diretta, no backup (veloce!)
            import shutil
            shutil.copy2(source_file, dest_file)
            
            file_size = dest_file.stat().st_size / (1024 * 1024)
            print(f"✅ {file_type}: {dest_file.name} ({file_size:.1f}M)")
        
        # Step 3: Build rapido
        print(f"\n🔨 STEP 3: Build portale")
        result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd=self.portal_path,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"❌ ERRORE: Build fallita")
            print(result.stderr[:500])
            return False
        
        print(f"✅ Build completata")
        
        # Step 4: Git commit (VELOCE, no diff check)
        print(f"\n💾 STEP 4: Git commit")
        
        subprocess.run(['git', 'add', 'apps/onde-portal/public/books/'], cwd=self.onde_root)
        
        commit_msg = f"Deploy {book_id} {version} to onde.surf\n\nQuick deploy - {instructions['mode']}"
        subprocess.run(['git', 'commit', '-m', commit_msg], cwd=self.onde_root)
        
        print(f"✅ Commit creato")
        
        # Step 5: STOP - Chiedi conferma prima di push
        print(f"\n" + "=" * 60)
        print(f"🛑 PRONTO PER PUSH SU ONDE.SURF")
        print("=" * 60)
        print(f"\n📋 RIEPILOGO:")
        print(f"   - File copiati: {len(target_paths)}")
        print(f"   - Build: OK")
        print(f"   - Commit: OK")
        print(f"\n⚠️  PROSSIMO STEP:")
        print(f"   git push origin main")
        print(f"   Deploy automatico su onde.surf")
        print(f"\n🎯 CONFERMA RICHIESTA:")
        print(f"   Vuoi procedere con il push?")
        
        return True

def main():
    if len(sys.argv) < 3:
        print("Usage: python deploy-onde-surf.py <book-id> <version>")
        print("\nExample:")
        print("  python deploy-onde-surf.py meditations Meditations-Eng-v1")
        sys.exit(1)
    
    book_id = sys.argv[1]
    version = sys.argv[2]
    
    onde_root = Path(__file__).parent.parent.parent
    
    deployer = OndeSurfDeployer(onde_root)
    success = deployer.deploy_book(book_id, version)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
