# Moonlight House - Redesign Spec 2026

## Obiettivo
Trasformare l'app da MVP funzionale a prodotto premium moderno.

---

## Stato Attuale vs Target

| Elemento | Attuale | Target 2026 |
|----------|---------|-------------|
| Sfondi | Colori CSS solidi | Illustrazioni HD |
| Personaggio | Emoji (^_^) | Sprite animato |
| UI | Bottoni basic | Glassmorphism + glow |
| Animazioni | Bounce semplice | Smooth + particles |
| Transizioni | Nessuna | Fade + slide |

---

## Design System 2026

### Glassmorphism UI
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Glow Effects
```css
.glow-gold {
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.4),
    0 0 40px rgba(255, 215, 0, 0.2);
}

.glow-purple {
  box-shadow:
    0 0 20px rgba(155, 89, 182, 0.4),
    0 0 40px rgba(155, 89, 182, 0.2);
}
```

### Animazioni Moderne
```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
}
```

---

## Struttura Componenti

### 1. Background Component
```tsx
// Sfondo illustrato con parallax leggero
<Background room={currentRoom}>
  <ParallaxLayer depth={0.2}> {/* Stelle lontane */}
  <ParallaxLayer depth={0.5}> {/* Elementi medi */}
  <ParallaxLayer depth={1.0}> {/* Primo piano */}
</Background>
```

### 2. Character Component
```tsx
// Personaggio con sprite sheet animato
<Character
  mood={mood}
  isActing={isActing}
  animation="float" // idle, eating, playing, sleeping
/>
```

### 3. Stats Component
```tsx
// Barre stat con gradient e glow
<StatBar
  label="Energia"
  value={90}
  color="blue"
  icon={<EnergyIcon />}
  showSparkles={value > 80}
/>
```

### 4. Action Buttons
```tsx
// Bottoni con hover glow e press feedback
<ActionButton
  icon={<FoodIcon />}
  label="Mangia"
  cost={-5}
  disabled={isActing}
  glowColor="gold"
/>
```

---

## Integrazioni Asset

### Sfondi
```tsx
const roomBackgrounds = {
  bedroom: '/assets/backgrounds/room-bedroom.png',
  kitchen: '/assets/backgrounds/room-kitchen.png',
  garden: '/assets/backgrounds/room-garden.png',
};

// In CSS
.room-background {
  background-size: cover;
  background-position: center;
  transition: background-image 0.5s ease-in-out;
}
```

### Personaggio Sprite
```tsx
const characterSprites = {
  happy: '/assets/character/luna-happy.png',
  sleepy: '/assets/character/luna-sleepy.png',
  hungry: '/assets/character/luna-hungry.png',
  sad: '/assets/character/luna-sad.png',
};
```

---

## Particles System
Aggiungere particelle per atmosfera magica:

```tsx
// Stelle che brillano
<Particles type="stars" count={20} />

// Lucciole nel giardino
<Particles type="fireflies" count={10} room="garden" />

// Sparkles quando si guadagnano coins
<Particles type="sparkles" trigger={onCoinEarn} />
```

---

## Transizioni Stanze
```tsx
const roomTransition = {
  initial: { opacity: 0, scale: 1.1 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.4, ease: "easeInOut" }
};
```

---

## Suoni (Opzionale)
```
sounds/
├── ambient-night.mp3      // Loop sottile
├── action-feed.mp3        // Munch sound
├── action-play.mp3        // Cheerful jingle
├── action-sleep.mp3       // Soft lullaby
├── coin-earn.mp3          // Sparkle sound
└── room-change.mp3        // Whoosh
```

---

## Checklist Implementazione

### Fase 1: Asset Integration
- [ ] Creare cartella `/public/assets/`
- [ ] Integrare sfondi come background-image
- [ ] Sostituire emoji con sprite personaggio
- [ ] Aggiungere icone UI custom

### Fase 2: Design System
- [ ] Implementare glassmorphism cards
- [ ] Aggiungere glow effects
- [ ] Migliorare stat bars con gradient
- [ ] Redesign bottoni azioni

### Fase 3: Animazioni
- [ ] Float animation personaggio
- [ ] Transizioni cambio stanza
- [ ] Particle system stelle
- [ ] Feedback animati azioni

### Fase 4: Polish
- [ ] Responsive check
- [ ] Performance optimization
- [ ] Test su mobile
- [ ] Screenshot finali

---

## Risultato Atteso
Un'app che sembra uscita da uno studio AAA di giochi per bambini, non un progetto hobby. Qualità App Store featured.

---

*Spec Engineering - Gennaio 2026*
