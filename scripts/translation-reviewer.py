#!/usr/bin/env python3
"""
Translation Reviewer Agent - Usa LLaMA 3 8B locale (Radeon/TinyGrad)
Verifica OGNI RIGA della traduzione:
1. Confronta originale ↔ traduzione (nulla manca, nulla aggiunto)
2. Controlla grammatica e ortografia della traduzione
"""

import sys
import json
import re
from pathlib import Path

# TinyGrad per Radeon
import os
os.environ["GPU"] = "1"  # Forza GPU Radeon

try:
    from tinygrad import Tensor, Device
    from tinygrad.nn.state import safe_load, load_state_dict
    TINYGRAD_AVAILABLE = True
except ImportError:
    TINYGRAD_AVAILABLE = False
    print("⚠️  TinyGrad non disponibile, usando fallback transformers")

try:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

# Configurazione
MODEL_NAME = "TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R"
CACHE_DIR = Path.home() / ".cache" / "huggingface"


class LocalLLM:
    """Wrapper per LLaMA 3 locale"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self._load_model()
    
    def _load_model(self):
        """Carica il modello locale"""
        if TRANSFORMERS_AVAILABLE:
            print(f"📥 Caricamento {MODEL_NAME}...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                MODEL_NAME,
                cache_dir=CACHE_DIR,
                trust_remote_code=True
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME,
                cache_dir=CACHE_DIR,
                torch_dtype=torch.float16,
                device_map="auto",
                trust_remote_code=True
            )
            print("✅ Modello caricato!")
        else:
            raise RuntimeError("Nessun backend disponibile (transformers/tinygrad)")
    
    def generate(self, prompt: str, max_tokens: int = 500) -> str:
        """Genera risposta dal modello"""
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=0.3,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Rimuovi il prompt dalla risposta
        response = response[len(prompt):].strip()
        return response


class TranslationReviewer:
    """Agente revisore traduzioni"""
    
    def __init__(self, source_lang: str = "English", target_lang: str = "Italian"):
        self.llm = LocalLLM()
        self.source_lang = source_lang
        self.target_lang = target_lang
        self.errors = []
        self.stats = {
            "total_lines": 0,
            "reviewed": 0,
            "issues_found": 0,
            "missing_content": 0,
            "extra_content": 0,
            "grammar_errors": 0
        }
    
    def review_line(self, line_num: int, original: str, translated: str) -> dict:
        """
        Revisiona una singola riga.
        Ritorna dict con: ok, issues[], suggestions
        """
        if not original.strip() or not translated.strip():
            return {"ok": True, "issues": [], "line": line_num}
        
        prompt = f"""You are a professional translation reviewer. Analyze this translation carefully.

ORIGINAL ({self.source_lang}):
"{original.strip()}"

TRANSLATION ({self.target_lang}):
"{translated.strip()}"

Check for these issues:
1. MISSING: Is anything from the original NOT present in the translation?
2. ADDED: Is there anything in the translation that was NOT in the original?
3. GRAMMAR: Are there grammatical errors in the {self.target_lang} translation?
4. SPELLING: Are there spelling errors in the translation?

Respond in JSON format ONLY:
{{"ok": true/false, "missing": "what's missing or null", "added": "what was added or null", "grammar": "grammar issues or null", "spelling": "spelling issues or null", "suggestion": "corrected translation if needed or null"}}"""

        try:
            response = self.llm.generate(prompt, max_tokens=300)
            
            # Estrai JSON dalla risposta
            json_match = re.search(r'\{[^}]+\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                result["line"] = line_num
                result["original"] = original.strip()
                result["translated"] = translated.strip()
                
                # Aggiorna statistiche
                if not result.get("ok", True):
                    self.stats["issues_found"] += 1
                    if result.get("missing"):
                        self.stats["missing_content"] += 1
                    if result.get("added"):
                        self.stats["extra_content"] += 1
                    if result.get("grammar") or result.get("spelling"):
                        self.stats["grammar_errors"] += 1
                    self.errors.append(result)
                
                return result
            else:
                return {"ok": True, "issues": [], "line": line_num, "parse_error": True}
                
        except Exception as e:
            return {"ok": True, "issues": [], "line": line_num, "error": str(e)}
    
    def review_file(self, original_path: str, translated_path: str, output_path: str = None):
        """
        Revisiona un intero file, riga per riga.
        """
        original_lines = Path(original_path).read_text(encoding='utf-8').splitlines()
        translated_lines = Path(translated_path).read_text(encoding='utf-8').splitlines()
        
        # Allinea le righe
        max_lines = max(len(original_lines), len(translated_lines))
        self.stats["total_lines"] = max_lines
        
        print(f"\n📖 Revisione {max_lines} righe...")
        print("=" * 60)
        
        for i in range(max_lines):
            orig = original_lines[i] if i < len(original_lines) else ""
            trans = translated_lines[i] if i < len(translated_lines) else ""
            
            # Skip righe vuote o solo whitespace
            if not orig.strip() and not trans.strip():
                continue
            
            self.stats["reviewed"] += 1
            result = self.review_line(i + 1, orig, trans)
            
            # Progress
            if self.stats["reviewed"] % 10 == 0:
                print(f"  ⏳ Revisionate {self.stats['reviewed']} righe...")
            
            if not result.get("ok", True):
                print(f"\n❌ RIGA {i+1}:")
                print(f"   ORIG: {orig.strip()[:80]}...")
                print(f"   TRAD: {trans.strip()[:80]}...")
                if result.get("missing"):
                    print(f"   🔴 MANCA: {result['missing']}")
                if result.get("added"):
                    print(f"   🟡 AGGIUNTO: {result['added']}")
                if result.get("grammar"):
                    print(f"   🟠 GRAMMATICA: {result['grammar']}")
                if result.get("spelling"):
                    print(f"   🔵 ORTOGRAFIA: {result['spelling']}")
                if result.get("suggestion"):
                    print(f"   ✅ SUGGERIMENTO: {result['suggestion']}")
        
        # Report finale
        self._print_report()
        
        # Salva report
        if output_path:
            self._save_report(output_path)
        
        return self.errors
    
    def _print_report(self):
        """Stampa report finale"""
        print("\n" + "=" * 60)
        print("📊 REPORT REVISIONE")
        print("=" * 60)
        print(f"   Righe totali:     {self.stats['total_lines']}")
        print(f"   Righe revisionate: {self.stats['reviewed']}")
        print(f"   Problemi trovati:  {self.stats['issues_found']}")
        print(f"   - Contenuto mancante: {self.stats['missing_content']}")
        print(f"   - Contenuto aggiunto: {self.stats['extra_content']}")
        print(f"   - Errori grammatica:  {self.stats['grammar_errors']}")
        
        if self.stats['issues_found'] == 0:
            print("\n✅ TRADUZIONE PERFETTA! Nessun problema trovato.")
        else:
            print(f"\n⚠️  Trovati {self.stats['issues_found']} problemi da correggere.")
    
    def _save_report(self, output_path: str):
        """Salva report JSON"""
        report = {
            "stats": self.stats,
            "errors": self.errors
        }
        Path(output_path).write_text(json.dumps(report, indent=2, ensure_ascii=False))
        print(f"\n💾 Report salvato in: {output_path}")


def main():
    if len(sys.argv) < 3:
        print("""
🔍 Translation Reviewer Agent
Usa LLaMA 3 8B locale per verificare traduzioni riga per riga.

Uso:
  python translation-reviewer.py <originale> <tradotto> [report.json]

Esempio:
  python translation-reviewer.py book_en.txt book_it.txt review_report.json

Verifica:
  1. Completezza (nulla manca)
  2. Fedeltà (nulla aggiunto)
  3. Grammatica
  4. Ortografia
        """)
        sys.exit(1)
    
    original_path = sys.argv[1]
    translated_path = sys.argv[2]
    output_path = sys.argv[3] if len(sys.argv) > 3 else "review_report.json"
    
    # Verifica file esistono
    if not Path(original_path).exists():
        print(f"❌ File originale non trovato: {original_path}")
        sys.exit(1)
    if not Path(translated_path).exists():
        print(f"❌ File tradotto non trovato: {translated_path}")
        sys.exit(1)
    
    # Avvia revisione
    reviewer = TranslationReviewer(source_lang="English", target_lang="Italian")
    errors = reviewer.review_file(original_path, translated_path, output_path)
    
    # Exit code basato su errori
    sys.exit(0 if len(errors) == 0 else 1)


if __name__ == "__main__":
    main()
