
import requests
import json
import sys

URL = "http://localhost:8765/generate"

text = """Shedding both approaches, neoclassical theory pictures the economy as the web of interactions of a mass of equivalent agents, that can be reduced to one simplifying portrait (the so-called homo economicus, who has rational preferences and self-interestedly maximizes utility): their different endowments of capital or labour determine their incomes, but do not make them different from each other. In models built on these foundations power asymmetries find no room. Few neoclassical economists did or do stop there, of course, but for decades followers of elementary courses in economics have learnt little more. That portrait was thus deposited in our popular culture, next to non-interference."""

prompt = f"Translate the following text into Italian:\n\n{text}\n\nTranslation:"

try:
    print("Sending request...")
    r = requests.post(URL, json={"prompt": prompt, "max_tokens": 500, "temp": 0.0}, timeout=60)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        res = r.json()
        print("--- RESULT START ---")
        print(res.get("result", "NO RESULT"))
        print("--- RESULT END ---")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Exception: {e}")
