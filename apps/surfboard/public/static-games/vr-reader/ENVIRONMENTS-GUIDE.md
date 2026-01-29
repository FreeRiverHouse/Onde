# Guida Ambienti di Lettura VR - Onde Books

Sistema di selezione ambiente per personalizzare l'esperienza di lettura immersiva.

## Indice

1. [Panoramica](#panoramica)
2. [Ambienti Disponibili](#ambienti-disponibili)
3. [Implementazione Tecnica](#implementazione-tecnica)
4. [Configurazione Audio](#configurazione-audio)
5. [Varianti Temporali](#varianti-temporali)
6. [Performance](#performance)

---

## Panoramica

### Filosofia di Design

Gli ambienti Onde Books VR seguono questi principi:

1. **Comfort visivo** - Illuminazione calda, niente contrasti estremi
2. **Atmosfera rilassante** - Favorisce la concentrazione sulla lettura
3. **Immersione audio** - Suoni ambientali per ogni scenario
4. **Personalizzazione** - L'utente sceglie il proprio spazio ideale

### Categorie Ambienti

| Categoria | Ambienti | Mood |
|-----------|----------|------|
| **Interni** | Biblioteca, Studio, Baita | Accogliente, tradizionale |
| **Natura** | Foresta, Giardino, Montagna | Sereno, rigenerante |
| **Acqua** | Spiaggia, Lago, Acquario | Rilassante, contemplativo |
| **Fantasy** | Spazio, Nuvole, Grotta | Onirico, immaginativo |

---

## Ambienti Disponibili

### 1. BIBLIOTECA CLASSICA (Default)

**ID**: `library`
**Descrizione**: Biblioteca vittoriana con camino acceso, scaffali di legno, poltrona in pelle.

```javascript
const LIBRARY_CONFIG = {
  id: 'library',
  name: 'Biblioteca Classica',
  icon: '📚',

  // Illuminazione
  lighting: {
    ambient: '#ff9955',
    ambientIntensity: 0.3,
    mainLight: {
      type: 'point',
      color: '#ff6622',
      intensity: 1.5,
      position: { x: 2, y: 1.5, z: -3 }  // Posizione camino
    }
  },

  // Colori base
  colors: {
    floor: '#3d2817',      // Parquet scuro
    walls: '#4a3728',      // Legno caldo
    ceiling: '#2d1f14',    // Legno scuro
    accent: '#8b6914'      // Oro antico
  },

  // Audio
  audio: {
    ambient: 'fire-ambient',
    volume: 0.3,
    effects: ['page-turn', 'clock-tick']
  },

  // Elementi decorativi
  decorations: [
    'bookshelf',
    'fireplace',
    'armchair',
    'window-moon',
    'candles',
    'globe',
    'persian-rug'
  ]
};
```

**Elementi 3D**:
- Scaffali con libri colorati
- Camino con fiamme animate
- Poltrona in pelle
- Finestra con luce lunare
- Tappeto persiano
- Globo antico
- Candele

---

### 2. GIARDINO SEGRETO

**ID**: `garden`
**Descrizione**: Angolo tranquillo in un giardino all'italiana, con pergola, fontana, e fiori.

```javascript
const GARDEN_CONFIG = {
  id: 'garden',
  name: 'Giardino Segreto',
  icon: '🌸',

  lighting: {
    ambient: '#fffacd',
    ambientIntensity: 0.6,
    mainLight: {
      type: 'directional',
      color: '#fff8dc',
      intensity: 1.2,
      position: { x: 5, y: 10, z: 5 }
    }
  },

  colors: {
    ground: '#4a7c3c',     // Erba
    structures: '#d4a76a', // Pietra chiara
    foliage: '#228b22',    // Verde foglia
    flowers: '#ff69b4'     // Rosa
  },

  audio: {
    ambient: 'garden-birds',
    volume: 0.25,
    effects: ['fountain', 'wind-chimes', 'bees']
  },

  decorations: [
    'pergola',
    'fountain',
    'stone-bench',
    'flower-beds',
    'ivy-walls',
    'butterflies',
    'sundial'
  ],

  skybox: 'sunny-day'
};
```

**Elementi 3D**:
- Pergola con glicine
- Fontana centrale
- Panchina in pietra (posizione lettura)
- Aiuole fiorite
- Muri con edera
- Farfalle animate
- Meridiana

---

### 3. SPIAGGIA AL TRAMONTO

**ID**: `beach`
**Descrizione**: Spiaggia caraibica con amaca, tramonto dorato, onde dolci.

```javascript
const BEACH_CONFIG = {
  id: 'beach',
  name: 'Spiaggia al Tramonto',
  icon: '🏖️',

  lighting: {
    ambient: '#ff8c42',
    ambientIntensity: 0.5,
    mainLight: {
      type: 'directional',
      color: '#ff6b2b',
      intensity: 1.0,
      position: { x: -10, y: 5, z: -10 }  // Sole tramonto
    }
  },

  colors: {
    sand: '#f5deb3',
    water: '#4169e1',
    sky: '#ff7f50',
    palms: '#228b22'
  },

  audio: {
    ambient: 'ocean-waves',
    volume: 0.4,
    effects: ['seagulls', 'wind-palm']
  },

  decorations: [
    'hammock',
    'palm-trees',
    'beach-umbrella',
    'shells',
    'driftwood',
    'lantern'
  ],

  skybox: 'sunset-ocean',

  // Effetti speciali
  effects: {
    waves: true,
    particles: 'sand-dust',
    reflections: true
  }
};
```

**Elementi 3D**:
- Amaca tra palme (posizione lettura)
- Palme con fronde animate
- Ombrellone
- Conchiglie decorative
- Legno galleggiante
- Lanterna per illuminazione serale
- Onde animate

---

### 4. BAITA DI MONTAGNA

**ID**: `cabin`
**Descrizione**: Rifugio alpino con finestra panoramica su montagne innevate, stufa a legna.

```javascript
const CABIN_CONFIG = {
  id: 'cabin',
  name: 'Baita di Montagna',
  icon: '🏔️',

  lighting: {
    ambient: '#ffd700',
    ambientIntensity: 0.25,
    mainLight: {
      type: 'point',
      color: '#ff4500',
      intensity: 1.3,
      position: { x: -2, y: 1, z: 2 }  // Stufa
    }
  },

  colors: {
    floor: '#8b4513',      // Legno pino
    walls: '#deb887',      // Legno chiaro
    ceiling: '#a0522d',    // Travi scure
    exterior: '#fffafa'    // Neve
  },

  audio: {
    ambient: 'cabin-fire',
    volume: 0.35,
    effects: ['wind-outside', 'wood-crackle', 'snow-fall']
  },

  decorations: [
    'wood-stove',
    'panoramic-window',
    'fur-rug',
    'antlers',
    'skis',
    'hot-cocoa',
    'blanket'
  ],

  skybox: 'snowy-mountains'
};
```

**Elementi 3D**:
- Stufa a legna con fuoco
- Finestra panoramica su Alpi
- Tappeto in pelliccia
- Corna decorative
- Sci appesi
- Tazza di cioccolata
- Coperta sul divano

---

### 5. FORESTA INCANTATA

**ID**: `forest`
**Descrizione**: Radura nella foresta con luce filtrata, creature magiche, atmosfera fiabesca.

```javascript
const FOREST_CONFIG = {
  id: 'forest',
  name: 'Foresta Incantata',
  icon: '🌲',

  lighting: {
    ambient: '#90ee90',
    ambientIntensity: 0.4,
    mainLight: {
      type: 'directional',
      color: '#ffffe0',
      intensity: 0.8,
      position: { x: 3, y: 15, z: 3 }
    },
    spotlights: [
      { color: '#00ff7f', intensity: 0.3, position: { x: -2, y: 0.5, z: -2 } }
    ]
  },

  colors: {
    ground: '#2e4a2e',     // Muschio
    trees: '#228b22',      // Verde bosco
    bark: '#8b4513',       // Corteccia
    magic: '#e6e6fa'       // Luce magica
  },

  audio: {
    ambient: 'forest-ambient',
    volume: 0.35,
    effects: ['owl', 'stream', 'rustling-leaves', 'fairy-bells']
  },

  decorations: [
    'giant-mushrooms',
    'tree-stump-seat',
    'fireflies',
    'ferns',
    'moss-rocks',
    'fairy-lights',
    'woodland-creatures'
  ],

  skybox: 'forest-canopy',

  effects: {
    godRays: true,
    particles: 'fireflies',
    fog: { density: 0.02, color: '#d4edda' }
  }
};
```

**Elementi 3D**:
- Funghi giganti luminosi
- Ceppo come seduta
- Lucciole animate
- Felci e muschio
- Rocce coperte di muschio
- Luci fatate
- Animali del bosco (scoiattoli, cervi)

---

### 6. STAZIONE SPAZIALE

**ID**: `space`
**Descrizione**: Modulo di una stazione spaziale con vista sulla Terra, atmosfera sci-fi rilassante.

```javascript
const SPACE_CONFIG = {
  id: 'space',
  name: 'Stazione Spaziale',
  icon: '🚀',

  lighting: {
    ambient: '#1a1a2e',
    ambientIntensity: 0.2,
    mainLight: {
      type: 'directional',
      color: '#add8e6',
      intensity: 0.9,
      position: { x: 10, y: 5, z: -5 }  // Luce Terra
    },
    panels: [
      { color: '#00ffff', intensity: 0.4, position: { x: 0, y: 2.5, z: 0 } }
    ]
  },

  colors: {
    walls: '#2f4f4f',      // Metallo scuro
    panels: '#4682b4',     // Blu acciaio
    accent: '#00ced1',     // Cyan
    screens: '#00ff00'     // Verde terminale
  },

  audio: {
    ambient: 'space-station-hum',
    volume: 0.2,
    effects: ['beeps', 'air-circulation', 'distant-comms']
  },

  decorations: [
    'earth-viewport',
    'zero-g-plants',
    'control-panels',
    'floating-objects',
    'spacesuit',
    'mission-patches'
  ],

  skybox: 'starfield',

  effects: {
    earthRotation: true,
    starTwinkle: true,
    screenGlow: true
  }
};
```

**Elementi 3D**:
- Grande oblò con vista Terra
- Piante in idroponica
- Pannelli di controllo con schermi
- Oggetti fluttuanti in zero-g
- Tuta spaziale appesa
- Patch missioni

---

### 7. TEMPIO ZEN

**ID**: `zen`
**Descrizione**: Giardino giapponese con tempio, ruscello, bonsai, massima tranquillita.

```javascript
const ZEN_CONFIG = {
  id: 'zen',
  name: 'Tempio Zen',
  icon: '🎋',

  lighting: {
    ambient: '#f5f5dc',
    ambientIntensity: 0.5,
    mainLight: {
      type: 'directional',
      color: '#ffefd5',
      intensity: 0.9,
      position: { x: 5, y: 8, z: -3 }
    }
  },

  colors: {
    tatami: '#c4a35a',     // Stuoia
    wood: '#deb887',       // Legno chiaro
    stone: '#808080',      // Pietra
    bamboo: '#6b8e23'      // Bambù
  },

  audio: {
    ambient: 'zen-garden',
    volume: 0.25,
    effects: ['shishi-odoshi', 'wind-chimes-bamboo', 'koi-splash']
  },

  decorations: [
    'torii-gate',
    'rock-garden',
    'bonsai-collection',
    'koi-pond',
    'bamboo-fence',
    'stone-lantern',
    'meditation-cushion'
  ],

  skybox: 'cherry-blossom'
};
```

**Elementi 3D**:
- Torii rosso in lontananza
- Giardino di rocce rastrellato
- Collezione bonsai
- Laghetto con carpe koi
- Recinto di bambù
- Lanterna in pietra
- Cuscino meditazione (posizione lettura)

---

### 8. GROTTA CRISTALLINA

**ID**: `crystal`
**Descrizione**: Grotta magica con cristalli luminosi, stalattiti, atmosfera mistica.

```javascript
const CRYSTAL_CONFIG = {
  id: 'crystal',
  name: 'Grotta Cristallina',
  icon: '💎',

  lighting: {
    ambient: '#483d8b',
    ambientIntensity: 0.2,
    crystalLights: [
      { color: '#9370db', intensity: 0.6, position: { x: -3, y: 2, z: -2 } },
      { color: '#00ced1', intensity: 0.5, position: { x: 2, y: 1.5, z: -3 } },
      { color: '#ff69b4', intensity: 0.4, position: { x: 0, y: 3, z: -4 } }
    ]
  },

  colors: {
    rock: '#2f2f4f',       // Roccia scura
    crystals: '#e6e6fa',   // Cristallo
    water: '#4169e1',      // Acqua
    glow: '#da70d6'        // Bagliore
  },

  audio: {
    ambient: 'cave-drips',
    volume: 0.3,
    effects: ['crystal-hum', 'underground-stream', 'echo']
  },

  decorations: [
    'crystal-formations',
    'stalactites',
    'underground-lake',
    'glowing-mushrooms',
    'crystal-throne',
    'floating-orbs'
  ],

  effects: {
    crystalPulse: true,
    waterReflections: true,
    particles: 'magic-dust'
  }
};
```

---

### 9. NUVOLE SOFFICI

**ID**: `clouds`
**Descrizione**: Sopra le nuvole al tramonto, atmosfera onirica e leggera.

```javascript
const CLOUDS_CONFIG = {
  id: 'clouds',
  name: 'Tra le Nuvole',
  icon: '☁️',

  lighting: {
    ambient: '#ffe4b5',
    ambientIntensity: 0.7,
    mainLight: {
      type: 'directional',
      color: '#ffdab9',
      intensity: 1.4,
      position: { x: -8, y: 3, z: -8 }
    }
  },

  colors: {
    clouds: '#fff8dc',
    sky: '#87ceeb',
    sunset: '#ff7f50',
    gold: '#ffd700'
  },

  audio: {
    ambient: 'wind-high-altitude',
    volume: 0.2,
    effects: ['bird-distant', 'wind-soft']
  },

  decorations: [
    'cloud-platform',
    'floating-islands',
    'rainbow-arc',
    'hot-air-balloon',
    'birds-flying',
    'sun-rays'
  ],

  skybox: 'sunset-clouds',

  effects: {
    cloudMovement: true,
    godRays: true,
    particles: 'sparkles'
  }
};
```

---

### 10. ACQUARIO SOTTOMARINO

**ID**: `aquarium`
**Descrizione**: Cupola sottomarina circondata da vita marina, luce blu rilassante.

```javascript
const AQUARIUM_CONFIG = {
  id: 'aquarium',
  name: 'Acquario Sottomarino',
  icon: '🐠',

  lighting: {
    ambient: '#4682b4',
    ambientIntensity: 0.4,
    mainLight: {
      type: 'directional',
      color: '#87ceeb',
      intensity: 0.7,
      position: { x: 0, y: 10, z: 0 }
    }
  },

  colors: {
    dome: '#b0e0e6',       // Vetro
    floor: '#2f4f4f',      // Fondale
    coral: '#ff7f50',      // Corallo
    seaweed: '#3cb371'     // Alghe
  },

  audio: {
    ambient: 'underwater-ambience',
    volume: 0.35,
    effects: ['bubbles', 'whale-song', 'dolphin-clicks']
  },

  decorations: [
    'glass-dome',
    'coral-reef',
    'fish-schools',
    'jellyfish',
    'sea-turtle',
    'manta-ray',
    'shipwreck-distant'
  ],

  effects: {
    caustics: true,        // Luci rifratte
    fishSwimming: true,
    bubbles: true,
    waterDistortion: true
  }
};
```

---

## Implementazione Tecnica

### Struttura Component A-Frame

```javascript
// components/environment-selector.js

AFRAME.registerComponent('environment-selector', {
  schema: {
    current: { type: 'string', default: 'library' },
    transitionDuration: { type: 'number', default: 1500 }
  },

  environments: {},  // Caricati da config

  init: function() {
    this.loadEnvironments();
    this.setupUI();
    this.applyEnvironment(this.data.current);
  },

  loadEnvironments: function() {
    this.environments = {
      library: LIBRARY_CONFIG,
      garden: GARDEN_CONFIG,
      beach: BEACH_CONFIG,
      cabin: CABIN_CONFIG,
      forest: FOREST_CONFIG,
      space: SPACE_CONFIG,
      zen: ZEN_CONFIG,
      crystal: CRYSTAL_CONFIG,
      clouds: CLOUDS_CONFIG,
      aquarium: AQUARIUM_CONFIG
    };
  },

  setupUI: function() {
    // Crea menu selezione ambiente
    const menu = document.createElement('a-entity');
    menu.setAttribute('id', 'environment-menu');
    menu.setAttribute('position', '0 2 -3');
    menu.setAttribute('visible', 'false');

    Object.entries(this.environments).forEach(([id, config], index) => {
      const button = this.createEnvButton(id, config, index);
      menu.appendChild(button);
    });

    this.el.appendChild(menu);
  },

  createEnvButton: function(id, config, index) {
    const button = document.createElement('a-entity');
    const row = Math.floor(index / 5);
    const col = index % 5;

    button.setAttribute('position', `${(col - 2) * 0.8} ${-row * 0.6} 0`);
    button.setAttribute('geometry', 'primitive: plane; width: 0.7; height: 0.5');
    button.setAttribute('material', `color: ${config.colors.walls || '#333'}`);
    button.setAttribute('text', `value: ${config.icon}\n${config.name}; align: center; width: 2`);
    button.setAttribute('class', 'clickable');

    button.addEventListener('click', () => {
      this.changeEnvironment(id);
    });

    return button;
  },

  changeEnvironment: function(newEnvId) {
    const oldEnv = this.data.current;
    if (oldEnv === newEnvId) return;

    // Fade out
    this.fadeOut(() => {
      // Pulisci vecchio ambiente
      this.cleanupEnvironment(oldEnv);

      // Applica nuovo
      this.applyEnvironment(newEnvId);

      // Fade in
      this.fadeIn();
    });

    this.data.current = newEnvId;
    this.savePreference(newEnvId);
  },

  applyEnvironment: function(envId) {
    const config = this.environments[envId];
    if (!config) return;

    // Applica illuminazione
    this.applyLighting(config.lighting);

    // Applica skybox
    if (config.skybox) {
      this.applySkybox(config.skybox);
    }

    // Carica decorazioni
    this.loadDecorations(config.decorations);

    // Avvia audio ambientale
    this.startAmbientAudio(config.audio);

    // Applica effetti speciali
    if (config.effects) {
      this.applyEffects(config.effects);
    }
  },

  applyLighting: function(lightingConfig) {
    const scene = this.el.sceneEl;

    // Ambient light
    let ambientLight = scene.querySelector('#ambient-light');
    if (!ambientLight) {
      ambientLight = document.createElement('a-light');
      ambientLight.setAttribute('id', 'ambient-light');
      scene.appendChild(ambientLight);
    }
    ambientLight.setAttribute('type', 'ambient');
    ambientLight.setAttribute('color', lightingConfig.ambient);
    ambientLight.setAttribute('intensity', lightingConfig.ambientIntensity);

    // Main light
    if (lightingConfig.mainLight) {
      let mainLight = scene.querySelector('#main-light');
      if (!mainLight) {
        mainLight = document.createElement('a-light');
        mainLight.setAttribute('id', 'main-light');
        scene.appendChild(mainLight);
      }
      mainLight.setAttribute('type', lightingConfig.mainLight.type);
      mainLight.setAttribute('color', lightingConfig.mainLight.color);
      mainLight.setAttribute('intensity', lightingConfig.mainLight.intensity);
      mainLight.setAttribute('position', lightingConfig.mainLight.position);
    }
  },

  applySkybox: function(skyboxId) {
    const sky = this.el.sceneEl.querySelector('a-sky');
    if (sky) {
      sky.setAttribute('src', `#skybox-${skyboxId}`);
    }
  },

  loadDecorations: function(decorations) {
    const container = document.querySelector('#decorations-container') ||
                      this.createDecorationsContainer();

    decorations.forEach(decorationId => {
      const decoration = this.createDecoration(decorationId);
      if (decoration) {
        container.appendChild(decoration);
      }
    });
  },

  startAmbientAudio: function(audioConfig) {
    // Ferma audio precedente
    document.querySelectorAll('audio').forEach(a => {
      a.pause();
      a.currentTime = 0;
    });

    // Avvia nuovo ambient
    const ambient = document.querySelector(`#${audioConfig.ambient}`);
    if (ambient) {
      ambient.volume = audioConfig.volume;
      ambient.play().catch(e => console.log('Audio autoplay blocked'));
    }
  },

  fadeOut: function(callback) {
    const overlay = document.querySelector('#transition-overlay');
    overlay.setAttribute('animation', {
      property: 'material.opacity',
      to: 1,
      dur: this.data.transitionDuration / 2,
      easing: 'easeInQuad'
    });

    setTimeout(callback, this.data.transitionDuration / 2);
  },

  fadeIn: function() {
    const overlay = document.querySelector('#transition-overlay');
    overlay.setAttribute('animation', {
      property: 'material.opacity',
      to: 0,
      dur: this.data.transitionDuration / 2,
      easing: 'easeOutQuad'
    });
  },

  savePreference: function(envId) {
    localStorage.setItem('onde-vr-environment', envId);
  },

  loadPreference: function() {
    return localStorage.getItem('onde-vr-environment') || 'library';
  }
});
```

### Menu Selezione Rapida

```html
<!-- Menu circolare in VR -->
<a-entity id="quick-env-menu" position="0 1.2 -0.8" visible="false">
  <!-- Titolo -->
  <a-text
    value="Scegli Ambiente"
    position="0 0.4 0"
    align="center"
    color="#f4e4c1"
    width="2"
  ></a-text>

  <!-- Griglia icone -->
  <a-entity id="env-grid">
    <!-- Row 1 -->
    <a-entity class="env-option" data-env="library" position="-0.6 0.2 0">
      <a-plane width="0.25" height="0.25" material="src: #env-icon-library"></a-plane>
      <a-text value="Biblioteca" position="0 -0.18 0" align="center" width="0.8" color="#c4a461"></a-text>
    </a-entity>

    <a-entity class="env-option" data-env="garden" position="-0.2 0.2 0">
      <a-plane width="0.25" height="0.25" material="src: #env-icon-garden"></a-plane>
      <a-text value="Giardino" position="0 -0.18 0" align="center" width="0.8" color="#c4a461"></a-text>
    </a-entity>

    <a-entity class="env-option" data-env="beach" position="0.2 0.2 0">
      <a-plane width="0.25" height="0.25" material="src: #env-icon-beach"></a-plane>
      <a-text value="Spiaggia" position="0 -0.18 0" align="center" width="0.8" color="#c4a461"></a-text>
    </a-entity>

    <a-entity class="env-option" data-env="forest" position="0.6 0.2 0">
      <a-plane width="0.25" height="0.25" material="src: #env-icon-forest"></a-plane>
      <a-text value="Foresta" position="0 -0.18 0" align="center" width="0.8" color="#c4a461"></a-text>
    </a-entity>

    <!-- Row 2 -->
    <a-entity class="env-option" data-env="cabin" position="-0.6 -0.15 0">
      <a-plane width="0.25" height="0.25" material="src: #env-icon-cabin"></a-plane>
      <a-text value="Baita" position="0 -0.18 0" align="center" width="0.8" color="#c4a461"></a-text>
    </a-entity>

    <a-entity class="env-option" data-env="space" position="-0.2 -0.15 0">
      <a-plane width="0.25" height="0.25" material="src: #env-icon-space"></a-plane>
      <a-text value="Spazio" position="0 -0.18 0" align="center" width="0.8" color="#c4a461"></a-text>
    </a-entity>

    <a-entity class="env-option" data-env="zen" position="0.2 -0.15 0">
      <a-plane width="0.25" height="0.25" material="src: #env-icon-zen"></a-plane>
      <a-text value="Zen" position="0 -0.18 0" align="center" width="0.8" color="#c4a461"></a-text>
    </a-entity>

    <a-entity class="env-option" data-env="aquarium" position="0.6 -0.15 0">
      <a-plane width="0.25" height="0.25" material="src: #env-icon-aquarium"></a-plane>
      <a-text value="Acquario" position="0 -0.18 0" align="center" width="0.8" color="#c4a461"></a-text>
    </a-entity>
  </a-entity>
</a-entity>
```

---

## Configurazione Audio

### File Audio Richiesti

```
assets/audio/
├── ambient/
│   ├── fire-ambient.mp3       # Camino scoppiettante
│   ├── garden-birds.mp3       # Uccelli giardino
│   ├── ocean-waves.mp3        # Onde mare
│   ├── cabin-fire.mp3         # Stufa legna + vento
│   ├── forest-ambient.mp3     # Foresta con animali
│   ├── space-station-hum.mp3  # Ronzio stazione
│   ├── zen-garden.mp3         # Giardino zen
│   ├── cave-drips.mp3         # Gocce grotta
│   ├── wind-high-altitude.mp3 # Vento alta quota
│   └── underwater-ambience.mp3# Suoni subacquei
│
├── effects/
│   ├── page-turn.mp3          # Pagina girata
│   ├── fountain.mp3           # Fontana
│   ├── shishi-odoshi.mp3      # Bambù acqua giapponese
│   ├── crystal-hum.mp3        # Vibrazione cristalli
│   ├── bubbles.mp3            # Bolle
│   └── whale-song.mp3         # Canto balene
│
└── music/
    ├── library-piano.mp3      # Piano soft
    ├── garden-strings.mp3     # Archi leggeri
    ├── beach-ukulele.mp3      # Ukulele relax
    ├── forest-flute.mp3       # Flauto
    ├── space-synth.mp3        # Synth ambientale
    └── zen-koto.mp3           # Koto giapponese
```

### Audio Manager

```javascript
// audio-manager.js

class EnvironmentAudioManager {
  constructor() {
    this.currentAmbient = null;
    this.currentMusic = null;
    this.effectsPool = {};
    this.masterVolume = 1.0;
  }

  setEnvironmentAudio(envConfig) {
    // Crossfade ambient
    this.crossfadeAmbient(envConfig.audio.ambient, envConfig.audio.volume);

    // Prepara effetti
    envConfig.audio.effects.forEach(effect => {
      this.preloadEffect(effect);
    });
  }

  crossfadeAmbient(newAmbientId, targetVolume) {
    const newAmbient = document.getElementById(newAmbientId);
    if (!newAmbient) return;

    // Fade out vecchio
    if (this.currentAmbient) {
      this.fadeAudio(this.currentAmbient, 0, 1000, () => {
        this.currentAmbient.pause();
      });
    }

    // Fade in nuovo
    newAmbient.volume = 0;
    newAmbient.play().then(() => {
      this.fadeAudio(newAmbient, targetVolume * this.masterVolume, 1000);
    }).catch(e => console.log('Audio blocked'));

    this.currentAmbient = newAmbient;
  }

  fadeAudio(audioElement, targetVolume, duration, callback) {
    const startVolume = audioElement.volume;
    const volumeDiff = targetVolume - startVolume;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      audioElement.volume = startVolume + (volumeDiff * progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    };

    requestAnimationFrame(animate);
  }

  playEffect(effectId) {
    const effect = document.getElementById(effectId);
    if (effect) {
      effect.currentTime = 0;
      effect.volume = 0.5 * this.masterVolume;
      effect.play();
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.currentAmbient) {
      this.currentAmbient.volume *= this.masterVolume;
    }
  }
}
```

---

## Varianti Temporali

Ogni ambiente puo avere varianti per ora del giorno:

```javascript
const TIME_VARIANTS = {
  library: {
    morning: {
      lighting: { ambient: '#fff8dc', ambientIntensity: 0.5 },
      audio: { ambient: 'morning-birds-distant' }
    },
    afternoon: {
      lighting: { ambient: '#ffd700', ambientIntensity: 0.4 }
    },
    evening: {
      lighting: { ambient: '#ff9955', ambientIntensity: 0.3 }
    },
    night: {
      lighting: { ambient: '#2f2f4f', ambientIntensity: 0.15 }
    }
  },

  garden: {
    morning: {
      skybox: 'morning-garden',
      audio: { ambient: 'dawn-chorus' }
    },
    afternoon: {
      skybox: 'sunny-day',
      effects: { butterflies: true }
    },
    evening: {
      skybox: 'golden-hour',
      lighting: { ambient: '#ffa500' }
    },
    night: {
      skybox: 'starry-garden',
      audio: { ambient: 'crickets' },
      effects: { fireflies: true }
    }
  },

  beach: {
    morning: {
      skybox: 'sunrise-ocean',
      lighting: { mainLight: { color: '#ffb6c1' } }
    },
    afternoon: {
      skybox: 'midday-tropical'
    },
    evening: {
      skybox: 'sunset-ocean'  // Default
    },
    night: {
      skybox: 'moonlit-beach',
      effects: { bioluminescence: true }
    }
  }
};

// Applica variante temporale
function applyTimeVariant(envId, timeOfDay) {
  const baseConfig = ENVIRONMENTS[envId];
  const timeVariant = TIME_VARIANTS[envId]?.[timeOfDay];

  if (!timeVariant) return baseConfig;

  // Merge configs
  return deepMerge(baseConfig, timeVariant);
}
```

### Sincronizzazione Ora Reale

```javascript
// Opzione: ambiente cambia con ora reale
function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

// Attiva sync automatico
function enableRealtimeSync() {
  setInterval(() => {
    const currentTime = getTimeOfDay();
    const currentEnv = getCurrentEnvironment();
    applyTimeVariant(currentEnv, currentTime);
  }, 60000);  // Check ogni minuto
}
```

---

## Performance

### Ottimizzazioni per Quest

```javascript
const PERFORMANCE_SETTINGS = {
  // Quest 2
  quest2: {
    shadowsEnabled: false,
    maxLights: 2,
    textureQuality: 'medium',
    particleCount: 50,
    drawDistance: 50
  },

  // Quest 3
  quest3: {
    shadowsEnabled: true,
    maxLights: 4,
    textureQuality: 'high',
    particleCount: 150,
    drawDistance: 100
  },

  // PC VR
  pcvr: {
    shadowsEnabled: true,
    maxLights: 8,
    textureQuality: 'ultra',
    particleCount: 500,
    drawDistance: 200
  }
};

function detectPlatform() {
  const ua = navigator.userAgent;
  if (ua.includes('Quest 3')) return 'quest3';
  if (ua.includes('Quest')) return 'quest2';
  return 'pcvr';
}

function applyPerformanceSettings() {
  const platform = detectPlatform();
  const settings = PERFORMANCE_SETTINGS[platform];

  // Applica settings
  const scene = document.querySelector('a-scene');
  scene.setAttribute('renderer', {
    antialias: platform !== 'quest2',
    colorManagement: true,
    physicallyCorrectLights: platform === 'pcvr'
  });
}
```

### LOD (Level of Detail)

```javascript
// Decorazioni con LOD
const DECORATION_LOD = {
  bookshelf: {
    high: 'bookshelf-detailed.glb',
    medium: 'bookshelf-medium.glb',
    low: 'bookshelf-simple.glb'
  },
  tree: {
    high: 'tree-full.glb',
    medium: 'tree-billboard.glb',
    low: 'tree-sprite.png'
  }
};

function loadDecorationWithLOD(decorationId, distance) {
  const lod = DECORATION_LOD[decorationId];
  if (!lod) return;

  let quality;
  if (distance < 3) quality = 'high';
  else if (distance < 10) quality = 'medium';
  else quality = 'low';

  return lod[quality];
}
```

### Preloading Ambienti

```javascript
// Precarica ambienti vicini per transizioni smooth
function preloadNearbyEnvironments(currentEnvId) {
  const order = ['library', 'garden', 'beach', 'cabin', 'forest',
                 'space', 'zen', 'crystal', 'clouds', 'aquarium'];
  const currentIndex = order.indexOf(currentEnvId);

  // Precarica precedente e successivo
  const toPreload = [
    order[(currentIndex - 1 + order.length) % order.length],
    order[(currentIndex + 1) % order.length]
  ];

  toPreload.forEach(envId => {
    preloadEnvironmentAssets(envId);
  });
}

function preloadEnvironmentAssets(envId) {
  const config = ENVIRONMENTS[envId];
  if (!config) return;

  // Preload skybox
  if (config.skybox) {
    const img = new Image();
    img.src = `assets/skyboxes/${config.skybox}.jpg`;
  }

  // Preload audio
  if (config.audio?.ambient) {
    const audio = document.getElementById(config.audio.ambient);
    if (audio) audio.load();
  }
}
```

---

## Implementazione UI Selezione

### Menu Desktop/Mobile

```html
<!-- Bottone apertura menu -->
<button id="env-menu-toggle" class="ui-button" onclick="toggleEnvMenu()">
  🌍 Ambiente
</button>

<!-- Panel selezione -->
<div id="env-selection-panel" class="hidden">
  <h3>Scegli il tuo ambiente di lettura</h3>

  <div class="env-grid">
    <div class="env-card" onclick="selectEnvironment('library')">
      <img src="assets/env-previews/library.jpg" alt="Biblioteca">
      <span>📚 Biblioteca</span>
    </div>

    <div class="env-card" onclick="selectEnvironment('garden')">
      <img src="assets/env-previews/garden.jpg" alt="Giardino">
      <span>🌸 Giardino</span>
    </div>

    <div class="env-card" onclick="selectEnvironment('beach')">
      <img src="assets/env-previews/beach.jpg" alt="Spiaggia">
      <span>🏖️ Spiaggia</span>
    </div>

    <!-- ... altri ambienti ... -->
  </div>

  <div class="env-options">
    <label>
      <input type="checkbox" id="realtime-sync">
      Sincronizza con ora reale
    </label>

    <label>
      Volume ambiente:
      <input type="range" id="ambient-volume" min="0" max="100" value="30">
    </label>
  </div>
</div>
```

### Stili Menu

```css
#env-selection-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(44, 24, 16, 0.95);
  border: 2px solid #8b6914;
  border-radius: 16px;
  padding: 24px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 2000;
}

#env-selection-panel.hidden {
  display: none;
}

.env-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.env-card {
  cursor: pointer;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(139, 105, 20, 0.2);
  transition: all 0.3s ease;
}

.env-card:hover {
  background: rgba(139, 105, 20, 0.4);
  transform: scale(1.05);
}

.env-card.selected {
  border: 2px solid #ffd700;
  background: rgba(139, 105, 20, 0.5);
}

.env-card img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.env-card span {
  color: #f4e4c1;
  font-family: 'Georgia', serif;
}
```

---

## Prossimi Passi

### Priorita Alta
- [ ] Implementare component `environment-selector`
- [ ] Creare assets audio per tutti gli ambienti
- [ ] Testare performance su Quest 2

### Priorita Media
- [ ] Aggiungere varianti temporali
- [ ] Creare skybox per ogni ambiente
- [ ] Implementare preloading

### Priorita Bassa
- [ ] Ambienti stagionali (Natale, Halloween)
- [ ] Ambienti personalizzati utente
- [ ] Marketplace ambienti premium

---

*Guida creata per Onde Books VR - Gennaio 2026*
