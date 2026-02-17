#!/usr/bin/env python3
"""Translate using Qwen 32B on AMD GPU via tinygrad"""
import os
os.environ["AMD"] = "1"

from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

print("Loading Qwen 32B model...")
model_name = "Qwen/Qwen2.5-Coder-32B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True
)

print("Model loaded! Starting translation...")

# Read source text
with open('/Users/mattia/Projects/Onde/traduzioni/capussela-spirito-EN.txt', 'r') as f:
    text = f.read()

# Split into chunks of ~2000 words
words = text.split()
chunk_size = 2000
chunks = [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

print(f"Splitting into {len(chunks)} chunks...")

translated = []
for i, chunk in enumerate(chunks):
    print(f"Translating chunk {i+1}/{len(chunks)}...")
    
    prompt = f"""Traduci il seguente testo dall'inglese all'italiano. Mantieni lo stile accademico e formale. Traduci SOLO il testo, senza commenti.

Testo inglese:
{chunk}

Traduzione italiana:"""

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=4096,
        temperature=0.3,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Extract just the translation part
    if "Traduzione italiana:" in response:
        translation = response.split("Traduzione italiana:")[-1].strip()
    else:
        translation = response[len(prompt):].strip()
    
    translated.append(translation)

# Save result
result = '\n\n'.join(translated)
with open('/Users/mattia/Projects/Onde/traduzioni/capussela-spirito-IT.md', 'w') as f:
    f.write("# Lo Spirito Repubblicano\n\n")
    f.write("*Traduzione italiana di \"The Republic of Innovation\"*\n\n---\n\n")
    f.write(result)

print(f"Done! Saved to capussela-spirito-IT.md")
