# 🤖 Come parlare con Grok via Browser Tool

## Setup
- Browser profilo "clawd" con tab su `x.com/i/grok`
- Account X loggato (MagmaticMa67558)

## Workflow

### 1. Apri nuova chat
```
browser action=snapshot profile=clawd  → trova "New Chat" button
browser action=act → click "New Chat"
```

### 2. Scrivi il prompt
```
browser action=act → type nella textbox "Ask anything"
browser action=act → click "Grok something"
```

### 3. Aspetta risposta (~15-30 sec)
```
browser action=act → wait 15000ms
browser action=snapshot → leggi la risposta
```

### 4. Follow-up (se serve)
```
browser action=act → type nella textbox
browser action=act → click submit
```

## ⚠️ Limiti
- **Upload immagini NON funziona** — React di X blocca il file input
- Workaround: descrivi l'immagine in dettaglio nel prompt
- Alternative: host l'immagine su un URL pubblico e includi il link

## Esempio: Review immagine
```
Prompt: "Rate this children's book illustration 1-10. 
It shows: [descrizione dettagliata dell'immagine].
Check anatomy, style, appeal. If <8/10, rewrite the prompt."
```

Grok risponde con rating + prompt migliorato. Iterare fino a ≥9/10.
