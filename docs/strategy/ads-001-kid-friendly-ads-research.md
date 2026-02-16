# ADS-001: Kid-Friendly Ads Research

## 📋 Contesto
onde.la è un portale gratuito con giochi/tool per bambini (5-12 anni).
Vogliamo iniziare a monetizzare con ads non invasivi e kid-safe.

## 🔍 Network Ads Kid-Safe (Research)

### 1. Google AdSense
- **Pro**: Facile setup, grande inventory, paga bene
- **Contro**: Serve COPPA compliance, ads non sempre kid-friendly
- **Setup**: AdSense for content → filtri per contenuti bambini
- **Requisito**: Privacy policy, COPPA compliance tag (`tfcd=1`)
- **Revenue**: ~$1-5 CPM per gaming/educational

### 2. Super Awesome (Epic Games)
- **Pro**: Specializzato in ads per bambini, COPPA/GDPR compliant by design
- **Contro**: Serve contatto commerciale, revenue share non pubblico
- **URL**: https://www.superawesome.com/
- **Best for**: Gaming audience under 16

### 3. Kidoz
- **Pro**: SDK specifico per kids, no data collection
- **Contro**: Più per mobile apps che web
- **URL**: https://kidoz.net/

### 4. Google Ad Manager + Child-directed treatment
- **Pro**: Controllo granulare, header bidding
- **Contro**: Setup complesso
- **Tag**: `<meta name="google" content="notranslate">` + child-directed flag

### 5. Carbon Ads / EthicalAds
- **Pro**: Non-intrusive, tech audience
- **Contro**: Non specificamente per bambini, revenue basso
- **Best for**: Blog/developer content, non gaming

## 🎯 Raccomandazione per onde.la

### Fase 1 (Immediata): Google AdSense
1. Registrarsi su AdSense
2. Aggiungere tag COPPA compliance
3. Posizionamento: 
   - Banner 728x90 sopra i giochi (desktop)
   - Banner 320x50 sotto i giochi (mobile)  
   - Interstitial tra livelli (solo giochi)
4. Filtri: bloccare categorie non kid-safe
5. Privacy Policy aggiornata

### Fase 2 (Dopo 10K+ visite/mese): Super Awesome
1. Contattare per partnership
2. Ads nativi nel feed giochi
3. Rewarded ads nei giochi (guarda video → ricompensa)

## 💰 Revenue Estimates

| Monthly Visitors | AdSense CPM | Est. Monthly Revenue |
|-----------------|-------------|---------------------|
| 1,000 | $2 | $2-5 |
| 5,000 | $2 | $10-25 |
| 10,000 | $3 | $30-75 |
| 50,000 | $3 | $150-375 |
| 100,000 | $4 | $400-1000 |

## ⚖️ COPPA Compliance Checklist
- [ ] Privacy policy menziona raccolta dati minorenni
- [ ] No tracking cookies per utenti <13
- [ ] tfcd=1 tag su AdSense
- [ ] No behavioral targeting
- [ ] Parental consent mechanism (se serve)
- [ ] Terms of Service aggiornati

## 📍 Posizionamento Ads Proposto

```
┌──────────────────────────────────┐
│  Header: Logo + Nav              │
├──────────────────────────────────┤
│  [BANNER AD 728x90]             │  ← Desktop only
├──────────────────────────────────┤
│                                  │
│  GAME CONTENT / SKIN CREATOR     │
│                                  │
├──────────────────────────────────┤
│  [BANNER AD 320x50]             │  ← Mobile friendly
├──────────────────────────────────┤
│  Related Games / Footer          │
└──────────────────────────────────┘
```

## ❓ Per Grok
1. Quale network consigli per un sito gaming/educational per bambini?
2. Rewarded ads nei giochi sono una buona idea per kids?
3. Come bilanciare monetizzazione vs esperienza utente per bambini?
4. Ci sono legal issues specifici per ads in Italia/EU per minori?
