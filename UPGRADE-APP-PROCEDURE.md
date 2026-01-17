# Procedura Upgrade App - Onde

## Principi Agentici

### 1. MAI chiedere se qualcosa funziona - PROVARE
- Se Chrome extension sembra disconnessa → **riprova 2-3 volte**
- Se un comando fallisce → **riprova con variazioni**
- Solo dopo 3+ tentativi falliti → chiedi all'utente

### 2. Upgrade = Iterazione Continua
Ogni upgrade segue questo ciclo:
1. **Analizza** stato attuale
2. **Pianifica** modifiche
3. **Genera** asset (Grok per immagini)
4. **Implementa** codice
5. **Testa** visivamente (screenshot)
6. **Committa** con messaggio descrittivo
7. **Ripeti** fino a completamento

---

## Workflow Upgrade Grafico

### Quando serve nuovo asset grafico:

```
1. Vai su x.com/i/grok
2. Clicca "Create Images"
3. Usa prompt coerente con stile esistente
4. Scarica immagine (upscale se disponibile)
5. Copia in /public/assets/[categoria]/
6. Aggiorna codice per usare nuovo asset
7. Screenshot per verificare
```

### Prompt Template (Stile Moonlight House)
```
[AMBIENTE] at night, magical atmosphere, soft [COLORI] lighting,
[DETTAGLI SPECIFICI], cozy and safe feeling, stars visible,
same style as cozy children's bedroom, children's game illustration, 4k
```

---

## Workflow Upgrade UI/UX

### Passi:
1. **Screenshot** stato attuale
2. **Identifica** problemi (es. "linee al centro brutto")
3. **Proponi** nuovo layout
4. **Implementa** in piccoli step
5. **Screenshot** dopo ogni step
6. **Confronta** prima/dopo

### Checklist UI
- [ ] Layout responsive
- [ ] Full-page (no spazi vuoti)
- [ ] Touch-friendly (bottoni grandi)
- [ ] Feedback visivo azioni
- [ ] Animazioni smooth

---

## Workflow Aggiunta Stanze/Features

### Per ogni nuova stanza:
1. Genera sfondo con Grok (stesso stile)
2. Aggiungi a array `roomData`
3. Aggiungi traduzioni IT/EN
4. Definisci azioni specifiche stanza
5. Testa navigazione
6. Screenshot finale

### Template Nuova Stanza
```typescript
// In roomData array
{
  key: 'nuova-stanza',
  icon: '🆕',
  bg: '/assets/backgrounds/room-nuova-stanza.jpg',
  actions: ['azione1', 'azione2']
}

// In translations
rooms: {
  'nuova-stanza': 'Nome Italiano', // IT
  'nuova-stanza': 'English Name',  // EN
}
```

---

## Lezioni Imparate

### 2026-01-17
- **Chrome Extension**: Se dice "not connected", riprova 2-3 volte prima di chiedere
- **Full-page layout**: Vite default centra contenuto, serve fix CSS
- **Background full-page**: Usare wrapper esterno, non solo container
- **Port convention**: DEV 8889+, PROD 111X

---

## Checklist Pre-Upgrade

- [ ] App attualmente funzionante (screenshot)
- [ ] Backup codice (git commit)
- [ ] Lista chiara delle modifiche richieste
- [ ] Asset necessari identificati
- [ ] Traduzioni preparate (se multilingua)

## Checklist Post-Upgrade

- [ ] Tutte le nuove features funzionano (screenshot)
- [ ] Nessuna regressione (test vecchie features)
- [ ] Codice committato
- [ ] Procedura aggiornata con lezioni imparate

---

*Procedura creata: 2026-01-17*
*Agente: Continuous Improvement + Engineering Dept*
