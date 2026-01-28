#!/usr/bin/env python3
"""
Traduzione EN→IT usando Helsinki-NLP - OTTIMIZZATO
Carica il modello UNA volta, poi traduce tutto
"""

import sys
import os
import warnings
warnings.filterwarnings("ignore")

try:
    from transformers import MarianMTModel, MarianTokenizer
    import torch
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "transformers", "torch", "sentencepiece", "-q"])
    from transformers import MarianMTModel, MarianTokenizer
    import torch

MODEL_NAME = "Helsinki-NLP/opus-mt-en-it"

# Globals - caricati UNA volta
_model = None
_tokenizer = None
_device = None

def load_model():
    """Carica modello e tokenizer UNA volta sola"""
    global _model, _tokenizer, _device
    
    if _model is None:
        print("Loading Helsinki-NLP model (one time only)...")
        _tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
        _model = MarianMTModel.from_pretrained(MODEL_NAME)
        
        # Use MPS (Apple Silicon) if available
        if torch.backends.mps.is_available():
            _device = "mps"
        elif torch.cuda.is_available():
            _device = "cuda"
        else:
            _device = "cpu"
        
        _model = _model.to(_device)
        print(f"Model loaded on {_device.upper()}")
    
    return _model, _tokenizer, _device

def translate_batch(texts: list, max_length: int = 512) -> list:
    """Traduce un batch di testi - molto più veloce"""
    model, tokenizer, device = load_model()
    
    results = []
    for text in texts:
        if not text.strip():
            results.append('')
            continue
            
        # Split into sentences for better quality
        sentences = [s.strip() + '.' for s in text.replace('\n', ' ').split('. ') if s.strip()]
        
        if not sentences:
            results.append('')
            continue
        
        # Batch encode sentences
        inputs = tokenizer(sentences, return_tensors="pt", padding=True, truncation=True, max_length=max_length)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate translations
        with torch.no_grad():
            translated = model.generate(**inputs, max_length=max_length)
        
        # Decode all at once
        decoded = [tokenizer.decode(t, skip_special_tokens=True) for t in translated]
        results.append(' '.join(decoded))
    
    return results

def translate(text: str) -> str:
    """Traduce un singolo testo"""
    return translate_batch([text])[0]

def translate_file(input_path: str, output_path: str, batch_size: int = 10):
    """Traduce un file in batch"""
    with open(input_path, 'r') as f:
        text = f.read()
    
    # Split into paragraphs
    paragraphs = text.split('\n\n')
    total = len(paragraphs)
    translated = []
    
    print(f"Translating {total} paragraphs in batches of {batch_size}...")
    
    # Process in batches
    for i in range(0, total, batch_size):
        batch = paragraphs[i:i+batch_size]
        batch_num = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size
        print(f"Batch {batch_num}/{total_batches} (paragraphs {i+1}-{min(i+batch_size, total)})...")
        
        results = translate_batch(batch)
        translated.extend(results)
        
        # Save progress every batch
        with open(output_path, 'w') as f:
            f.write('\n\n'.join(translated))
    
    print(f"✅ Done! Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python translate-amd.py 'text to translate'")
        print("       python translate-amd.py --file input.txt --output output.txt")
        sys.exit(1)
    
    if sys.argv[1] == "--file":
        if len(sys.argv) < 5:
            print("Usage: python translate-amd.py --file input.txt --output output.txt")
            sys.exit(1)
        translate_file(sys.argv[2], sys.argv[4])
    else:
        text = ' '.join(sys.argv[1:])
        print(translate(text))
