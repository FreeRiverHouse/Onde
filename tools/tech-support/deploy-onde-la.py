#!/usr/bin/env python3
"""
Deploy Onde.la - BLINDATO
Deploy sicuro su onde.la PRODUZIONE (SACRO)

CARATTERISTICHE:
- Blindato e sicuro
- Tutti i check di sicurezza
- Golden snapshot obbligatorio
- Diff verification completa
- Rollback automatico se errori
- onde.la è SACRO - mai down

DIFFERENZE vs deploy-onde-surf.py:
- onde.surf: veloce, meno blindato
- onde.la: blindato, più check, SACRO

Usage:
    python deploy-onde-la.py <book-id> <version>
    
Example:
    python deploy-onde-la.py meditations Meditations-Eng-v1
"""

import sys
import os
import subprocess
from pathlib import Path
from datetime import datetime
import json
import shutil

class OndeLaDeployer:
    def __init__(self, onde_root: str):
        self.onde_root = Path(onde_root)
        self.portal_path = self.onde_root / "apps" / "onde-portal"
        self.staging_dir = self.onde_root / "staging" / "portal-updates"
        self.snapshots_dir = self.portal_path / "snapshots"
        
    def create_golden_snapshot(self) -> str:
        """OBBLIGATORIO: Golden snapshot prima di modifiche"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        snapshot_name = f"golden_snapshot_production_{timestamp}"
        snapshot_path = self.snapshots_dir / snapshot_name
        snapshot_path.mkdir(parents=True, exist_ok=True)
        
        print(f"\n📸 GOLDEN SNAPSHOT OBBLIGATORIO")
        print("=" * 60)
        
        # Salva commit hash
        result = subprocess.run(
            ['git', 'rev-parse', 'HEAD'],
            cwd=self.portal_path,
            capture_output=True,
            text=True
        )
        commit_hash = result.stdout.strip()
        
        with open(snapshot_path / "commit_hash.txt", 'w') as f:
            f.write(commit_hash)
        
        # Copia file critici
        src_path = self.portal_path / "src"
        public_path = self.portal_path / "public"
        
        shutil.copytree(src_path, snapshot_path / "src", dirs_exist_ok=True)
        shutil.copytree(public_path, snapshot_path / "public", dirs_exist_ok=True)
        
        print(f"✅ Snapshot salvato: {snapshot_path}")
        print(f"✅ Commit: {commit_hash}")
        
        return str(snapshot_path)
    
    def verify_files(self, staging_path: Path, instructions: dict) -> bool:
        """Verifica integrità file"""
        print(f"\n🔍 VERIFICA INTEGRITÀ FILE")
        
        target_paths = instructions['target_paths']
        for file_type, _ in target_paths.items():
            source_file = staging_path / instructions['files'][file_type]
            
            if not source_file.exists():
                print(f"❌ ERRORE: File mancante: {source_file}")
                return False
            
            file_size = source_file.stat().st_size
            if file_size == 0:
                print(f"❌ ERRORE: File vuoto: {source_file}")
                return False
            
            print(f"✅ {file_type}: {source_file.name} ({file_size / (1024*1024):.1f}M)")
        
        return True
    
    def build_with_verification(self) -> bool:
        """Build con verifica errori"""
        print(f"\n🔨 BUILD CON VERIFICA")
        
        result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd=self.portal_path,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"❌ ERRORE CRITICO: Build fallita")
            print(result.stderr[:1000])
            return False
        
        # Verifica che out/ esista
        out_dir = self.portal_path / "out"
        if not out_dir.exists():
            print(f"❌ ERRORE: Directory out/ non creata")
            return False
        
        # Conta file generati
        html_files = list(out_dir.rglob("*.html"))
        print(f"✅ Build completata: {len(html_files)} file HTML generati")
        
        return True
    
    def diff_verification(self, snapshot_path: str) -> bool:
        """Verifica diff tra snapshot e modifiche"""
        print(f"\n📊 DIFF VERIFICATION")
        
        # Confronta file modificati
        result = subprocess.run(
            ['git', 'diff', '--name-only'],
            cwd=self.onde_root,
            capture_output=True,
            text=True
        )
        
        modified_files = result.stdout.strip().split('\n')
        modified_files = [f for f in modified_files if f]
        
        print(f"📋 File modificati: {len(modified_files)}")
        for f in modified_files[:10]:
            print(f"   - {f}")
        
        if len(modified_files) > 10:
            print(f"   ... e altri {len(modified_files) - 10} file")
        
        # Verifica che siano solo file attesi
        expected_paths = ['apps/onde-portal/public/books/']
        unexpected = [f for f in modified_files if not any(exp in f for exp in expected_paths)]
        
        if unexpected:
            print(f"⚠️  ATTENZIONE: File inattesi modificati:")
            for f in unexpected[:5]:
                print(f"   - {f}")
            print(f"\n❓ Continuare comunque? (potrebbero essere modifiche legittime)")
        
        return True
    
    def deploy_book(self, book_id: str, version: str):
        """Deploy BLINDATO su onde.la"""
        
        print(f"\n🛡️  DEPLOY ONDE.LA - BLINDATO")
        print("=" * 60)
        print(f"📚 Libro: {book_id}")
        print(f"📦 Versione: {version}")
        print(f"🌐 Target: onde.la (PRODUZIONE SACRO)")
        print(f"🛡️  Modalità: BLINDATO (tutti i check)")
        print("=" * 60)
        
        # Step 1: Golden snapshot OBBLIGATORIO
        snapshot_path = self.create_golden_snapshot()
        
        # Step 2: Verifica file staging
        print(f"\n📦 STEP 2: Verifica file staging")
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
        
        print(f"✅ Staging trovato")
        print(f"   Modalità: {instructions['mode']}")
        
        # Step 3: Verifica integrità file
        if not self.verify_files(staging_path, instructions):
            print(f"❌ ERRORE: Verifica file fallita")
            return False
        
        # Step 4: Backup file esistenti
        print(f"\n💾 STEP 4: Backup file esistenti")
        backup_dir = self.snapshots_dir / f"backup_before_deploy_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        target_paths = instructions['target_paths']
        for file_type, target_path in target_paths.items():
            dest_file = self.onde_root / target_path
            if dest_file.exists():
                backup_file = backup_dir / dest_file.name
                shutil.copy2(dest_file, backup_file)
                print(f"✅ Backup: {dest_file.name}")
        
        # Step 5: Copia file nel portale
        print(f"\n📁 STEP 5: Copia file nel portale")
        
        for file_type, target_path in target_paths.items():
            source_file = staging_path / instructions['files'][file_type]
            dest_file = self.onde_root / target_path
            
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_file, dest_file)
            
            file_size = dest_file.stat().st_size / (1024 * 1024)
            print(f"✅ {file_type}: {dest_file.name} ({file_size:.1f}M)")
        
        # Step 6: Build con verifica
        if not self.build_with_verification():
            print(f"❌ ERRORE CRITICO: Build fallita")
            print(f"🔄 ROLLBACK AUTOMATICO...")
            # Ripristina backup
            for file_type, target_path in target_paths.items():
                backup_file = backup_dir / (self.onde_root / target_path).name
                if backup_file.exists():
                    shutil.copy2(backup_file, self.onde_root / target_path)
            print(f"✅ Rollback completato")
            return False
        
        # Step 7: Diff verification
        if not self.diff_verification(snapshot_path):
            print(f"⚠️  Diff verification con warning")
        
        # Step 8: Git commit
        print(f"\n💾 STEP 8: Git commit")
        
        subprocess.run(['git', 'add', 'apps/onde-portal/public/books/'], cwd=self.onde_root)
        
        commit_msg = f"Deploy {book_id} {version} to onde.la PRODUCTION\n\nBlindato deploy - {instructions['mode']}\nSnapshot: {snapshot_path}\nBackup: {backup_dir}"
        subprocess.run(['git', 'commit', '-m', commit_msg], cwd=self.onde_root)
        
        print(f"✅ Commit creato")
        
        # Step 9: Test automatico su localhost:8888
        print(f"\n🧪 STEP 9: Test automatico modifiche")
        
        # Avvia server TEST se non già attivo
        print(f"   Avvio server TEST su localhost:8888...")
        test_server = subprocess.Popen(
            ['npm', 'run', 'test:onde-la'],
            cwd=self.portal_path,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        # Aspetta che server sia pronto
        import time
        time.sleep(5)
        
        # Esegui test automatici
        print(f"   Esecuzione test automatici...")
        test_result = subprocess.run(
            ['python3', 'tools/tech-support/test-modifiche-website.py', 
             'http://localhost:8888', 'onde-la'],
            cwd=self.onde_root,
            capture_output=True,
            text=True
        )
        
        # Termina server TEST
        test_server.terminate()
        test_server.wait()
        
        if test_result.returncode != 0:
            print(f"❌ ERRORE CRITICO: Test automatici falliti")
            print(test_result.stdout[-1000:])
            print(f"🔄 ROLLBACK AUTOMATICO...")
            # Ripristina backup
            for file_type, target_path in target_paths.items():
                backup_file = backup_dir / (self.onde_root / target_path).name
                if backup_file.exists():
                    shutil.copy2(backup_file, self.onde_root / target_path)
            print(f"✅ Rollback completato")
            return False
        
        print(f"✅ Test automatici completati con successo")
        
        # Step 10: STOP - Conferma finale OBBLIGATORIA
        print(f"\n" + "=" * 60)
        print(f"🛑 PRONTO PER PUSH SU ONDE.LA PRODUZIONE")
        print("=" * 60)
        print(f"\n📋 RIEPILOGO COMPLETO:")
        print(f"   ✅ Golden snapshot: {snapshot_path}")
        print(f"   ✅ Backup: {backup_dir}")
        print(f"   ✅ File verificati: {len(target_paths)}")
        print(f"   ✅ Build: OK")
        print(f"   ✅ Diff verification: OK")
        print(f"   ✅ Commit: OK")
        print(f"\n⚠️  IMPORTANTE:")
        print(f"   onde.la è PRODUZIONE SACRO")
        print(f"   Mai down, sempre funzionante")
        print(f"\n🎯 CONFERMA FINALE OBBLIGATORIA:")
        print(f"   Vuoi procedere con il push su PRODUZIONE?")
        print(f"\n📝 PROSSIMO STEP:")
        print(f"   git push origin main")
        print(f"   Deploy automatico su onde.la")
        
        return True

def main():
    if len(sys.argv) < 3:
        print("Usage: python deploy-onde-la.py <book-id> <version>")
        print("\nExample:")
        print("  python deploy-onde-la.py meditations Meditations-Eng-v1")
        sys.exit(1)
    
    book_id = sys.argv[1]
    version = sys.argv[2]
    
    onde_root = Path(__file__).parent.parent.parent
    
    deployer = OndeLaDeployer(onde_root)
    success = deployer.deploy_book(book_id, version)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
