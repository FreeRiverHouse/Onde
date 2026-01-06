# Sistema di Evoluzione Agenti

## Come Funziona

Ogni agente (Pino, Gianni) ha:
1. **Personalità Base** (`*.md`) - Chi sono, stile, regole
2. **Memoria Evolutiva** (`*.memory.json`) - Cosa hanno imparato da Mattia

## Struttura Memoria

```
{
  "learnedPreferences": { ... },    // Preferenze apprese
  "absorbedSensibility": { ... },   // Sensibilità assorbita da Mattia
  "conversationInsights": [ ... ],  // Insight dalle conversazioni
  "evolutionLog": [ ... ]           // Storia dell'evoluzione
}
```

## Dopo Ogni Conversazione

Quando finisci di lavorare con Pino o Gianni:

### 1. Estrai gli Insight
Chiediti:
- Cosa ha preferito Mattia? (stile, tono, scelte)
- Cosa ha corretto o rifiutato?
- Che sensibilità emerge? (valori, emozioni, filosofia)

### 2. Aggiorna la Memoria
Aggiungi al file `.memory.json`:

```json
{
  "absorbedSensibility": {
    "fromMattia": [
      "Preferisce X invece di Y",
      "Vuole sempre che ci sia luce/speranza",
      "Non gli piace il tono predicatorio"
    ]
  },
  "evolutionLog": [
    {
      "date": "2025-01-05",
      "insight": "Mattia vuole che le storie abbiano sempre un elemento di abbondanza",
      "source": "conversazione libro Salmo 23"
    }
  ]
}
```

### 3. Opzionale: Aggiorna la Personalità Base
Se un insight è così importante da diventare regola permanente, aggiungilo al file `.md`

## Prompt Dinamico

Quando attivi un agente, il prompt viene costruito così:

```
[Personalità Base da *.md]
+
[Memoria Recente da *.memory.json]
=
Prompt Completo
```

## Esempio Pratico

**Prima:** Pino crea illustrazioni generiche stile Scarry
**Dopo conversazione:** Mattia dice "voglio più luce, più speranza"
**Memoria aggiornata:**
```json
"absorbedSensibility": {
  "fromMattia": ["La luce rappresenta la presenza divina, sempre"]
}
```
**Prossima volta:** Pino automaticamente include più luce nelle sue proposte

## Portabilità

Quando Claude avrà generazione immagini:
1. La memoria resta identica
2. Cambia solo il "motore" (da Grok a Claude)
3. Pino e Gianni mantengono tutta la sensibilità appresa
