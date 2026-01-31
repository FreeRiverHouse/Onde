# Istruzioni per Ondinho - Minecraft Skin con LLM Locale

**Agente:** Ondinho
**Task:** Generazione/modifica Minecraft Skin
**LLM:** LLaMA 3.1 8B su Radeon RX 7900 XTX

---

## Endpoint API

```
http://192.168.1.111:8080/v1/chat/completions
```

**GUI Web:** `http://192.168.1.111:8080/`

---

## Come Usare per Minecraft Skin

### 1. Generare idee per skin

```bash
curl -s http://192.168.1.111:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Suggest 5 creative Minecraft skin ideas for a cyberpunk theme"}],
    "max_tokens": 300
  }'
```

### 2. Descrivere palette colori

```bash
curl -s http://192.168.1.111:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What RGB colors should I use for a Minecraft skin of a fire mage? Give me hex codes."}],
    "max_tokens": 200
  }'
```

### 3. Generare pixel art description

```bash
curl -s http://192.168.1.111:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Describe pixel by pixel how to draw a robot face on a 8x8 Minecraft skin head area"}],
    "max_tokens": 400
  }'
```

### 4. Code per manipolare skin PNG

```bash
curl -s http://192.168.1.111:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Write Python code using PIL to load a Minecraft skin PNG and change all red pixels to blue"}],
    "max_tokens": 300
  }'
```

---

## Da Python

```python
import requests

def ask_llm(prompt, max_tokens=200):
    response = requests.post(
        "http://192.168.1.111:8080/v1/chat/completions",
        json={
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens
        }
    )
    return response.json()["choices"][0]["message"]["content"]

# Esempio
colors = ask_llm("Give me 5 hex colors for an ice wizard Minecraft skin")
print(colors)
```

---

## Limiti

- **Latenza:** 4-6 secondi per risposta
- **Non genera immagini** - solo testo/codice
- **Max tokens:** consigliato 200-300 per risposte veloci

---

## Workflow Consigliato

1. **Ideazione:** Chiedi idee al LLM
2. **Palette:** Chiedi colori specifici
3. **Codice:** Chiedi script Python per manipolare PNG
4. **Esecuzione:** Esegui gli script generati

---

**Server attivo su:** `192.168.1.111:8080`
