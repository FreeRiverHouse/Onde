# Moonlight House - Roadmap

## Versione Attuale: 1.0.0
- ✅ 3 stanze (Camera, Cucina, Giardino)
- ✅ Personaggio Luna con animazione float
- ✅ 4 stats (Salute, Fame, Energia, Felicità)
- ✅ 3 azioni (Mangia, Gioca, Dormi)
- ✅ Sistema monete
- ✅ Multilingua ITA/ENG
- ✅ Sfondi illustrati HD
- ✅ UI Glassmorphism 2026

---

## 🚀 Versione 1.1 - Biblioteca (PROSSIMA)

### Nuova Stanza: Biblioteca 📚
Una stanza speciale dove Luna può leggere i libri Onde Kids.

**Funzionalità:**
- Scaffali con libri interattivi
- Preview pagine del libro
- Acquisto in-app (link a store Onde/Amazon)
- Libri sbloccabili con monete (demo gratuita)
- Animazione Luna che legge
- Bonus stats quando legge (+Felicità, +Salute)

**Libri Disponibili (Add-on):**

| Libro | Collana | Età | Prezzo |
|-------|---------|-----|--------|
| **AIKO e l'Intelligenza Artificiale** | Tech | 5-10 | €4.99 |
| **Il Salmo 23 per Bambini** | Spiritualità | 4-8 | €3.99 |
| **Piccole Rime** | Poesia | 3-6 | €2.99 |
| **Il Potere dei Desideri** | Crescita | 6-10 | €4.99 |
| **Il Respiro Magico** | Mindfulness | 4-8 | €3.99 |
| **Il Piccolo Inventore** | Tech | 6-10 | €4.99 |
| **I Cinque Sensi di Luna** | Sensoriale | 3-6 | €3.99 |

**Integrazione:**
- Ogni libro ha 2-3 pagine gratis come demo
- Acquisto sblocca libro completo
- Libri letti aumentano collezione di Luna
- Badge/achievement per libri completati

**UI Biblioteca:**
```
┌─────────────────────────────────┐
│  📚 Biblioteca di Luna          │
├─────────────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│  │🤖│ │✨│ │📖│ │🧘│        │
│  │   │ │   │ │   │ │   │        │
│  └───┘ └───┘ └───┘ └───┘      │
│  AIKO  Salmo Rime  Respiro     │
│                                 │
│  [Luna seduta che legge]        │
│                                 │
│  "Vuoi leggere con me?" 💖     │
└─────────────────────────────────┘
```

---

## 🎯 Versione 1.2 - Personalizzazione

### Customization Luna
- Accessori (cappelli, fiocchi, occhiali)
- Colori (Luna dorata, Luna rosa, Luna blu)
- Sfondi camera personalizzabili
- Acquistabili con monete o IAP

### Nuove Azioni
- 🛁 Bagnetto (recupera Salute)
- 🎵 Musica (aumenta Felicità)
- 🎨 Disegna (guadagna monete)

---

## 🌟 Versione 1.3 - Social

### Amici di Luna
- Visita case di altri giocatori
- Scambia regali
- Classifica felicità settimanale
- Eventi speciali (Natale, Pasqua, Halloween)

---

## 🔮 Versione 2.0 - Luna Universe

### Espansione Mondo
- Nuovi personaggi (amici di Luna)
- Mappa esplorabile
- Mini-giochi educativi
- Integrazione con altri personaggi Onde (Sofia, AIKO)

---

## Priorità Sviluppo

| Priorità | Feature | Effort | Impatto |
|----------|---------|--------|---------|
| 🔴 Alta | Biblioteca + Libri | Media | Alto (revenue) |
| 🟡 Media | Personalizzazione | Bassa | Medio |
| 🟡 Media | Nuove azioni | Bassa | Medio |
| 🟢 Bassa | Social | Alta | Alto |
| 🟢 Bassa | Luna Universe | Alta | Alto |

---

## Note Tecniche

### Biblioteca - Implementazione
```typescript
// Nuova stanza
const roomData = [
  { key: 'bedroom', icon: '🛏️', bg: '...' },
  { key: 'kitchen', icon: '🍳', bg: '...' },
  { key: 'garden', icon: '🌙', bg: '...' },
  { key: 'library', icon: '📚', bg: '/assets/backgrounds/room-library.jpg' }, // NUOVO
];

// Libri come prodotti
interface Book {
  id: string;
  title: { it: string; en: string };
  cover: string;
  pages: number;
  freePreview: number; // pagine gratis
  price: number;
  owned: boolean;
  storeUrl: string;
}
```

### Asset Richiesti per Biblioteca
- [ ] Sfondo biblioteca (Grok)
- [ ] Luna che legge (sprite)
- [ ] Copertine libri (già esistenti)
- [ ] Icone scaffale
- [ ] Animazione pagine che girano

---

*Roadmap creata: 2026-01-17*
*Prossimo update: dopo rilascio v1.1*
