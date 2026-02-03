# Google Search Console - Submission Checklist

## Pre-requisiti
- [x] Sitemap.xml include /games/skin-creator
- [ ] **Deploy onde.la** per aggiornare sitemap
- [x] OG image creata (og-skin-creator.png)
- [x] Meta tags configurati

## Passi per Submit

### 1. Verifica Sitemap Deployato
```bash
curl -s "https://onde.la/sitemap.xml" | grep "skin-creator"
```
Deve mostrare: `<loc>https://onde.la/games/skin-creator</loc>`

### 2. Accedi a Google Search Console
- URL: https://search.google.com/search-console
- Seleziona proprietà `onde.la`

### 3. Submit Sitemap (se non già fatto)
- Vai a "Sitemaps" nel menu laterale
- Aggiungi: `sitemap.xml`
- Clicca "Submit"

### 4. Request Indexing per Skin Creator
- Vai a "URL Inspection"
- Inserisci: `https://onde.la/games/skin-creator/`
- Clicca "Request Indexing"

### 5. Verifica dopo 24-48h
- Cerca su Google: `site:onde.la skin creator`
- Dovrebbe apparire nei risultati

## URL da Indicizzare (priorità)
1. https://onde.la/games/skin-creator/ ⭐ TOP PRIORITY
2. https://onde.la/games/
3. https://onde.la/

## Note
- GSC può impiegare 1-7 giorni per indicizzare
- Monitorare "Coverage" per errori
- Se bloccato, verificare robots.txt
