#!/usr/bin/env python3
"""
Traduzione EN→IT con Helsinki-NLP opus-mt su AMD Radeon via TinyGrad ONNX
Modello caricato UNA volta, batch processing efficiente.

Usage: 
  python translate-radeon.py "English text"
  python translate-radeon.py --file input.txt --output output.txt
"""

import sys
import os
import argparse
import numpy as np

# TinyGrad AMD setup
TINYGRAD_PATH = os.path.expanduser("~/conductor/workspaces/Onde/moscow/tinygrad-fix")
sys.path.insert(0, TINYGRAD_PATH)
os.environ["AMD"] = "1"
os.environ["AMD_LLVM"] = "1"

MODEL_PATH = os.path.join(TINYGRAD_PATH, "weights/opus-mt-en-it")

# Globals - load once
_encoder = None
_decoder = None  
_tokenizer_src = None
_tokenizer_tgt = None

def load_model():
    """Load model once"""
    global _encoder, _decoder, _tokenizer_src, _tokenizer_tgt
    
    if _encoder is None:
        print("Loading Helsinki-NLP opus-mt-en-it on AMD Radeon...")
        
        from tinygrad import Tensor
        from tinygrad.nn.onnx import OnnxRunner
        import sentencepiece as spm
        
        # Load tokenizers
        _tokenizer_src = spm.SentencePieceProcessor()
        _tokenizer_src.Load(os.path.join(MODEL_PATH, "source.spm"))
        
        _tokenizer_tgt = spm.SentencePieceProcessor()
        _tokenizer_tgt.Load(os.path.join(MODEL_PATH, "target.spm"))
        
        # Load ONNX models
        print("Loading encoder...")
        _encoder = OnnxRunner(os.path.join(MODEL_PATH, "encoder_model.onnx"))
        
        print("Loading decoder...")
        _decoder = OnnxRunner(os.path.join(MODEL_PATH, "decoder_model.onnx"))
        
        print("Models loaded on AMD Radeon! ✅")
    
    return _encoder, _decoder, _tokenizer_src, _tokenizer_tgt

def translate(text: str, max_length: int = 128) -> str:
    """Translate English to Italian"""
    from tinygrad import Tensor
    
    encoder, decoder, tok_src, tok_tgt = load_model()
    
    # Tokenize input (don't add special tokens manually - they're handled differently)
    input_ids = tok_src.EncodeAsIds(text)
    seq_len = len(input_ids)
    
    # Create attention mask
    attention_mask = [1] * seq_len
    
    # Convert to tensors - shape: (1, seq_len)
    input_tensor = Tensor(np.array([input_ids], dtype=np.int64))
    attention_tensor = Tensor(np.array([attention_mask], dtype=np.int64))
    
    # Encode
    encoder_output = encoder({
        "input_ids": input_tensor,
        "attention_mask": attention_tensor
    })
    
    # Get encoder hidden states (first output)
    encoder_hidden = list(encoder_output.values())[0]
    
    # Decoder start token (usually 0 or special token)
    decoder_start_token = 80034  # From config.json decoder_start_token_id
    eos_token = 0  # From config.json eos_token_id
    
    # Start with decoder start token - shape: (1, 1)
    decoder_input = [decoder_start_token]
    
    generated = []
    
    for _ in range(max_length):
        # Decoder input tensor
        decoder_input_tensor = Tensor(np.array([decoder_input], dtype=np.int64))
        
        try:
            output = decoder({
                "input_ids": decoder_input_tensor,
                "encoder_hidden_states": encoder_hidden,
                "encoder_attention_mask": attention_tensor
            })
        except Exception as e:
            print(f"Decoder error: {e}")
            break
        
        # Get logits and next token
        logits = list(output.values())[0].numpy()
        next_token = int(np.argmax(logits[0, -1, :]))
        
        # Check for EOS
        if next_token == eos_token:
            break
        
        generated.append(next_token)
        decoder_input.append(next_token)
    
    # Decode output
    return tok_tgt.DecodeIds(generated)

def translate_file(input_path: str, output_path: str, batch_size: int = 10):
    """Translate file paragraph by paragraph"""
    with open(input_path) as f:
        text = f.read()
    
    paragraphs = text.split('\n\n')
    total = len(paragraphs)
    translated = []
    
    print(f"Translating {total} paragraphs...")
    
    for i, para in enumerate(paragraphs):
        if para.strip():
            print(f"Paragraph {i+1}/{total}...")
            translated.append(translate(para))
        else:
            translated.append('')
        
        # Save progress
        if (i + 1) % batch_size == 0:
            with open(output_path, 'w') as f:
                f.write('\n\n'.join(translated))
    
    # Final save
    with open(output_path, 'w') as f:
        f.write('\n\n'.join(translated))
    
    print(f"✅ Done! Saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Translate EN→IT on AMD Radeon")
    parser.add_argument("text", nargs="?", help="Text to translate")
    parser.add_argument("--file", "-f", help="Input file")
    parser.add_argument("--output", "-o", help="Output file")
    args = parser.parse_args()
    
    if args.file:
        if not args.output:
            args.output = args.file.replace('.txt', '-IT.md').replace('.md', '-IT.md')
        translate_file(args.file, args.output)
    elif args.text:
        print(translate(args.text))
    else:
        print("Usage: translate-radeon.py 'text' or --file input.txt")
        sys.exit(1)

if __name__ == "__main__":
    main()
