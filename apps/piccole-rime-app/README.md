# Piccole Rime - App

App React Native per leggere filastrocche italiane della tradizione.

## Caratteristiche

- Collezione di poesie italiane in dominio pubblico
- Interfaccia pulita e leggibile
- Controllo dimensione testo
- Tema caldo color crema
- Design stile Onde Publishing

## Installazione

```bash
cd apps/piccole-rime-app
npm install
npx expo start
```

## Struttura

```
piccole-rime-app/
├── app/
│   ├── _layout.tsx      # Layout principale
│   ├── index.tsx        # Home con lista poesie
│   └── poem/
│       └── [id].tsx     # Vista singola poesia
├── data/
│   └── poems.ts         # Database poesie
└── assets/              # Icone e splash screen
```

## Poesie Incluse

| Titolo | Autore | Tema |
|--------|--------|------|
| Stella Stellina | Lina Schwarz | Ninna nanna |
| Che dice la pioggerellina | A.S. Novaro | Primavera |
| La Befana | Guido Gozzano | Epifania |
| La Lumachella | Trilussa | Animali |

## Note

Tutti i testi sono in dominio pubblico (autori morti da 70+ anni).

## Prossime Feature

- [ ] Audio: lettura con voce narrante
- [ ] Animazioni: illustrazioni animate
- [ ] Offline: salvataggio locale preferiti
- [ ] Notifiche: poesia del giorno

---

*Onde Publishing - 2026*
