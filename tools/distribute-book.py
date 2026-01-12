#!/usr/bin/env python3
"""
Procedura Distribuisci Libro
Distribuisce un libro sui vari canali Onde

LOGICA:
1. Check: Libro già distribuito prima?
   - SE SÌ → UPGRADE (modifica file esistenti)
   - SE NO → NUOVO (aggiunge libro)

2. Canali di distribuzione:
   - OndeDB: Salva versione finale in repository
   - Portale onde.la: Invoca Tech Support per upgrade chirurgico
   - Amazon KDP: Prepara file per pubblicazione
   - Altri canali: Da implementare

IMPORTANTE:
Per il canale "portale onde.la" NON si pusha direttamente.
Si invoca l'agente Tech Support che gestisce:
- Ambiente di preproduzione
- Ambiente di test
- Ambiente di produzione
- Upgrade chirurgico del sito

Usage:
    python distribute-book.py <book-id> <version> <channel>
    
Example:
    python distribute-book.py meditations Meditations-Eng-v1 ondedb
    python distribute-book.py meditations Meditations-Eng-v1 portal
    python distribute-book.py meditations Meditations-Eng-v1 kdp
"""

import sys
import os
import shutil
import json
from pathlib import Path

class BookDistributor:
    def __init__(self, onde_root: str):
        self.onde_root = Path(onde_root)
        self.ondedb_path = self.onde_root / "OndeDB" / "final-versions"
        self.portal_path = self.onde_root / "apps" / "onde-portal"
        self.portal_staging = self.onde_root / "staging" / "portal-updates"
        
        # Canali disponibili
        self.channels = {
            'ondedb': 'OndeDB Repository (versioni finali)',
            'portal': 'Portale onde.la (via Tech Support)',
            'kdp': 'Amazon KDP (pubblicazione)',
            'all': 'Tutti i canali'
        }
    
    def check_book_exists_ondedb(self, book_category: str, version: str) -> bool:
        """Check se libro già in OndeDB"""
        book_path = self.ondedb_path / book_category / version
        return book_path.exists()
    
    def check_book_exists_portal(self, book_id: str) -> bool:
        """Check se libro già distribuito nel portale"""
        
        # Check file nel portale public/books
        portal_public = self.portal_path / "public" / "books"
        pdf_exists = (portal_public / f"{book_id}-en.pdf").exists()
        cover_exists = (portal_public / f"{book_id}-cover.jpg").exists()
        
        # Check definizione nel codice sorgente
        books_data_file = self.portal_path / "src" / "data" / "books.ts"
        if books_data_file.exists():
            with open(books_data_file, 'r') as f:
                content = f.read()
                code_exists = f"id: '{book_id}'" in content
        else:
            code_exists = False
        
        return pdf_exists or cover_exists or code_exists
    
    def get_book_files(self, book_category: str, version: str) -> dict:
        """Ottieni path dei file del libro da OndeDB"""
        book_path = self.ondedb_path / book_category / version
        
        if not book_path.exists():
            raise FileNotFoundError(f"Versione libro non trovata: {book_path}")
        
        # Trova file PDF, EPUB, cover
        pdf_files = list((book_path / "pdf").glob("*.pdf"))
        epub_files = list((book_path / "epub").glob("*.epub"))
        cover_files = list((book_path / "images").glob("cover.jpg"))
        
        if not pdf_files:
            raise FileNotFoundError(f"PDF non trovato in {book_path / 'pdf'}")
        if not epub_files:
            raise FileNotFoundError(f"EPUB non trovato in {book_path / 'epub'}")
        if not cover_files:
            raise FileNotFoundError(f"Cover non trovata in {book_path / 'images'}")
        
        return {
            'pdf': pdf_files[0],
            'epub': epub_files[0],
            'cover': cover_files[0],
            'images_dir': book_path / "images"
        }
    
    def distribute_to_portal(self, book_id: str, book_category: str, version: str):
        """Distribuisce libro sul portale onde.la via Tech Support"""
        
        print(f"\n📡 CANALE: PORTALE ONDE.LA")
        print("=" * 60)
        
        # Check se libro già presente
        already_exists = self.check_book_exists_portal(book_id)
        mode = "UPGRADE" if already_exists else "NUOVO"
        
        print(f"📝 Modalità: {mode}")
        
        # Ottieni file da OndeDB
        try:
            files = self.get_book_files(book_category, version)
        except FileNotFoundError as e:
            print(f"❌ ERRORE: {e}")
            return False
        
        # Prepara staging area per Tech Support
        staging_dir = self.portal_staging / book_id / version
        staging_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n📦 PREPARA FILE PER TECH SUPPORT:")
        
        # Copia file in staging
        shutil.copy2(files['pdf'], staging_dir / f"{book_id}-en.pdf")
        shutil.copy2(files['epub'], staging_dir / f"{book_id}-en.epub")
        shutil.copy2(files['cover'], staging_dir / f"{book_id}-cover.jpg")
        
        print(f"✅ File preparati in: {staging_dir}")
        print(f"   - {book_id}-en.pdf")
        print(f"   - {book_id}-en.epub")
        print(f"   - {book_id}-cover.jpg")
        
        # Crea istruzioni per Tech Support
        instructions = {
            'book_id': book_id,
            'version': version,
            'mode': mode,
            'files': {
                'pdf': f"{book_id}-en.pdf",
                'epub': f"{book_id}-en.epub",
                'cover': f"{book_id}-cover.jpg"
            },
            'target_paths': {
                'pdf': f"apps/onde-portal/public/books/{book_id}-en.pdf",
                'epub': f"apps/onde-portal/public/books/epub/{book_id}-en.epub",
                'cover': f"apps/onde-portal/public/books/{book_id}-cover.jpg"
            },
            'workflow': [
                '1. Deploy su ambiente di preproduzione',
                '2. Test funzionalità portale',
                '3. Verifica download PDF/EPUB',
                '4. Se OK: deploy su produzione',
                '5. Se FAIL: rollback automatico'
            ]
        }
        
        instructions_file = staging_dir / "tech-support-instructions.json"
        with open(instructions_file, 'w') as f:
            json.dump(instructions, f, indent=2)
        
        print(f"\n📋 ISTRUZIONI TECH SUPPORT:")
        print(f"   File: {instructions_file}")
        
        print(f"\n" + "=" * 60)
        print(f"⚠️  IMPORTANTE:")
        print(f"   NON pushare direttamente su portale!")
        print(f"   Invocare Tech Support agent per:")
        print(f"   - Gestione preproduzione/test/produzione")
        print(f"   - Upgrade chirurgico del sito")
        print(f"   - Verifica funzionamento")
        print("=" * 60)
        
        print(f"\n🤖 PROSSIMO STEP:")
        print(f"   Invocare: Tech Support Agent")
        print(f"   Comando: Deploy {book_id} {version} to onde.la portal")
        print(f"   Staging: {staging_dir}")
        
        return True
    
    def distribute_to_ondedb(self, book_id: str, book_category: str, version: str):
        """Verifica che libro sia in OndeDB"""
        
        print(f"\n📚 CANALE: ONDEDB REPOSITORY")
        print("=" * 60)
        
        exists = self.check_book_exists_ondedb(book_category, version)
        
        if exists:
            print(f"✅ Libro già presente in OndeDB")
            print(f"   Path: OndeDB/final-versions/{book_category}/{version}")
            return True
        else:
            print(f"❌ Libro NON presente in OndeDB")
            print(f"   Eseguire prima: Salva libro in OndeDB")
            return False
    
    def distribute_book(self, book_id: str, book_category: str, version: str, channel: str):
        """Distribuisce libro sul canale specificato"""
        
        print(f"\n🔍 PROCEDURA DISTRIBUISCI LIBRO")
        print("=" * 60)
        print(f"📚 Libro: {book_id}")
        print(f"📦 Versione: {version}")
        print(f"📁 Categoria: {book_category}")
        print(f"📡 Canale: {channel}")
        print("=" * 60)
        
        if channel not in self.channels:
            print(f"❌ ERRORE: Canale '{channel}' non valido")
            print(f"Canali disponibili: {', '.join(self.channels.keys())}")
            return False
        
        # Distribuisci in base al canale
        if channel == 'ondedb':
            return self.distribute_to_ondedb(book_id, book_category, version)
        
        elif channel == 'portal':
            return self.distribute_to_portal(book_id, book_category, version)
        
        elif channel == 'kdp':
            print(f"\n📦 CANALE: AMAZON KDP")
            print(f"⚠️  Da implementare")
            return False
        
        elif channel == 'all':
            print(f"\n📡 DISTRIBUZIONE SU TUTTI I CANALI:")
            success = True
            success &= self.distribute_to_ondedb(book_id, book_category, version)
            success &= self.distribute_to_portal(book_id, book_category, version)
            return success
        
        return False

def main():
    if len(sys.argv) < 4:
        print("Usage: python distribute-book.py <book-id> <version> <channel>")
        print("\nChannels:")
        print("  ondedb  - OndeDB Repository (versioni finali)")
        print("  portal  - Portale onde.la (via Tech Support)")
        print("  kdp     - Amazon KDP (pubblicazione)")
        print("  all     - Tutti i canali")
        print("\nExample:")
        print("  python distribute-book.py meditations Meditations-Eng-v1 ondedb")
        print("  python distribute-book.py meditations Meditations-Eng-v1 portal")
        sys.exit(1)
    
    book_id = sys.argv[1]
    version = sys.argv[2]
    channel = sys.argv[3]
    
    # Determina categoria dal book_id
    book_category = book_id
    
    # Trova root di Onde
    onde_root = Path(__file__).parent.parent
    
    distributor = BookDistributor(onde_root)
    success = distributor.distribute_book(book_id, book_category, version, channel)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
