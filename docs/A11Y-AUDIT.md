# Accessibility Audit - onde.la

**Data:** 2026-02-03

## 📊 Stato Attuale

### Problemi Trovati
- ⚠️ Mancano aria-labels sulle pagine principali
- ⚠️ Nessun skip-to-content link
- ⚠️ Possibili problemi contrast ratio (testo chiaro su sfondo chiaro)
- ⚠️ Immagini senza alt text in alcuni punti

### Pagine Controllate
| Pagina | aria-* | role | alt text | Score |
|--------|--------|------|----------|-------|
| / (home) | 0 | 0 | Parziale | ⚠️ |
| /games | 0 | 0 | Parziale | ⚠️ |
| /libri | Da verificare | Da verificare | Sì | ⭐ |

## 🔧 Fix Prioritari

### 1. Skip to Content
```html
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### 2. Aria Labels per Navigazione
```html
<nav aria-label="Main navigation">
  ...
</nav>
```

### 3. Alt Text per Immagini
- Tutte le immagini decorative: `alt=""`
- Immagini contenuto: descrizione chiara

### 4. Contrast Ratio
- Minimo 4.5:1 per testo normale
- Minimo 3:1 per testo grande

## Strumenti Test
- WAVE: https://wave.webaim.org/
- axe DevTools: Chrome extension
- Lighthouse Accessibility audit

## WCAG 2.1 Checklist
- [ ] Level A compliance
- [ ] Level AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader compatible
