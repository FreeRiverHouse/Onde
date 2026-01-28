#!/usr/bin/env python3
"""
Traduzione EN→IT usando Helsinki-NLP su AMD GPU via TinyGrad
Usage: python translate-amd.py "English text" 
       python translate-amd.py --file input.txt --output output.txt
"""

import sys
import os

# Check for TinyGrad AMD setup
TINYGRAD_PATH = os.path.expanduser("~/conductor/workspaces/Onde/moscow/tinygrad-fix")
if os.path.exists(TINYGRAD_PATH):
    sys.path.insert(0, TINYGRAD_PATH)
    os.environ["AMD_GPU"] = "1"

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

def translate(text: str, max_length: int = 512) -> str:
    """Translate English text to Italian"""
    tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
    model = MarianMTModel.from_pretrained(MODEL_NAME)
    
    # Use GPU if available
    device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    model = model.to(device)
    
    # Split into sentences for better translation
    sentences = text.replace('\n', ' ').split('. ')
    translated_parts = []
    
    for sent in sentences:
        if not sent.strip():
            continue
        inputs = tokenizer(sent.strip() + '.', return_tensors="pt", padding=True, truncation=True, max_length=max_length)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        translated = model.generate(**inputs, max_length=max_length)
        result = tokenizer.decode(translated[0], skip_special_tokens=True)
        translated_parts.append(result)
    
    return ' '.join(translated_parts)

def translate_file(input_path: str, output_path: str):
    """Translate a file from English to Italian"""
    with open(input_path, 'r') as f:
        text = f.read()
    
    # Split into paragraphs
    paragraphs = text.split('\n\n')
    translated = []
    
    for i, para in enumerate(paragraphs):
        if para.strip():
            print(f"Translating paragraph {i+1}/{len(paragraphs)}...")
            translated.append(translate(para))
        else:
            translated.append('')
    
    result = '\n\n'.join(translated)
    
    with open(output_path, 'w') as f:
        f.write(result)
    
    print(f"Translation saved to {output_path}")

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
