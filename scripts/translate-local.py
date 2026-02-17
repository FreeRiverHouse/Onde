#!/usr/bin/env python3
"""
Local Translation Agent - Usa LLaMA 3 8B locale (Radeon/TinyGrad)
Traduce testi riga per riga usando modelli LOCALI.
"""

import sys
import os
from pathlib import Path

# TinyGrad per Radeon
os.environ["GPU"] = "1"

try:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
    AVAILABLE = True
except ImportError:
    AVAILABLE = False
    print("❌ transformers non installato. Esegui: pip install transformers torch")
    sys.exit(1)

# Configurazione
MODEL_NAME = "TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R"
CACHE_DIR = Path.home() / ".cache" / "huggingface"


class LocalTranslator:
    """Traduttore usando LLaMA 3 locale"""
    
    def __init__(self, source_lang: str = "English", target_lang: str = "Italian"):
        self.source_lang = source_lang
        self.target_lang = target_lang
        self.model = None
        self.tokenizer = None
        self._load_model()
    
    def _load_model(self):
        """Carica il modello"""
        print(f"📥 Caricamento {MODEL_NAME}...")
        print("   (Prima volta: download ~16GB, ~10 min)")
        
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
        
        # Set pad token
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        print("✅ Modello caricato!")
    
    def translate_line(self, text: str) -> str:
        """Traduce una singola riga"""
        if not text.strip():
            return text  # Preserva righe vuote
        
        prompt = f"""Translate the following text from {self.source_lang} to {self.target_lang}.
Translate ONLY the text, nothing else. Keep the same formatting.

{self.source_lang}: {text.strip()}
{self.target_lang}:"""

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=len(text.split()) * 3,  # Stima token output
                temperature=0.3,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Estrai solo la traduzione
        if f"{self.target_lang}:" in response:
            translation = response.split(f"{self.target_lang}:")[-1].strip()
            # Prendi solo la prima riga (evita generazioni extra)
            translation = translation.split('\n')[0].strip()
            return translation
        
        return text  # Fallback all'originale se parsing fallisce
    
    def translate_file(self, input_path: str, output_path: str):
        """Traduce un intero file riga per riga"""
        lines = Path(input_path).read_text(encoding='utf-8').splitlines()
        translated = []
        
        print(f"\n📖 Traduzione {len(lines)} righe...")
        print("=" * 60)
        
        for i, line in enumerate(lines):
            if line.strip():
                trans = self.translate_line(line)
                translated.append(trans)
                
                # Progress ogni 10 righe
                if (i + 1) % 10 == 0:
                    print(f"  ⏳ Tradotte {i+1}/{len(lines)} righe...")
            else:
                translated.append(line)  # Preserva righe vuote
        
        # Salva output
        Path(output_path).write_text('\n'.join(translated), encoding='utf-8')
        print(f"\n✅ Traduzione completata!")
        print(f"💾 Salvato in: {output_path}")
        
        return output_path


def main():
    if len(sys.argv) < 2:
        print("""
🌍 Local Translation Agent
Usa LLaMA 3 8B locale per traduzioni.

Uso:
  python translate-local.py <input> [output] [source_lang] [target_lang]

Esempi:
  python translate-local.py book_en.txt
  python translate-local.py book_en.txt book_it.txt
  python translate-local.py libro_es.txt libro_it.txt Spanish Italian

Default: English → Italian
        """)
        sys.exit(1)
    
    input_path = sys.argv[1]
    
    # Output path
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    else:
        # Auto-genera nome output
        p = Path(input_path)
        output_path = str(p.parent / f"{p.stem}_translated{p.suffix}")
    
    # Lingue
    source_lang = sys.argv[3] if len(sys.argv) > 3 else "English"
    target_lang = sys.argv[4] if len(sys.argv) > 4 else "Italian"
    
    # Verifica file esiste
    if not Path(input_path).exists():
        print(f"❌ File non trovato: {input_path}")
        sys.exit(1)
    
    # Traduci
    translator = LocalTranslator(source_lang, target_lang)
    translator.translate_file(input_path, output_path)
    
    print(f"\n💡 Ora puoi verificare con:")
    print(f"   python scripts/translation-reviewer.py {input_path} {output_path}")


if __name__ == "__main__":
    main()
