import { useState, useEffect } from 'react';
import './App.css';

// Translations
const translations = {
  it: {
    title: 'Moonlight House',
    rooms: {
      bedroom: 'Camera',
      kitchen: 'Cucina',
      garden: 'Giardino',
      living: 'Salotto',
      bathroom: 'Bagno',
      garage: 'Garage',
      shop: 'Negozio',
      supermarket: 'Supermercato',
    },
    actions: {
      bedroom: { primary: 'Dormi', secondary: 'Leggi' },
      kitchen: { primary: 'Mangia', secondary: 'Cucina' },
      garden: { primary: 'Gioca', secondary: 'Innaffia' },
      living: { primary: 'Guarda TV', secondary: 'Rilassati' },
      bathroom: { primary: 'Bagno', secondary: 'Lavati' },
      garage: { primary: 'Guida', secondary: 'Ripara' },
      shop: { primary: 'Compra vestiti', secondary: 'Prova' },
      supermarket: { primary: 'Compra cibo', secondary: 'Esplora' },
    },
    stats: {
      health: 'Salute',
      hunger: 'Fame',
      energy: 'Energia',
      happiness: 'Felicità',
    },
    messages: {
      sleeping: 'Zzz... 💤',
      eating: 'Gnam gnam... 🍪',
      playing: 'Weee! ⭐',
      watching: 'Che bello! 📺',
      bathing: 'Splash! 🛁',
      driving: 'Brum brum! 🚗',
      shopping: 'Bellissimo! 👗',
      buying: 'Comprato! 🛒',
      notEnoughCoins: 'Servono più monete!',
    },
    explore: 'Esplora la casa!',
    footer: 'Onde Kids ✨',
  },
  en: {
    title: 'Moonlight House',
    rooms: {
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      garden: 'Garden',
      living: 'Living Room',
      bathroom: 'Bathroom',
      garage: 'Garage',
      shop: 'Boutique',
      supermarket: 'Supermarket',
    },
    actions: {
      bedroom: { primary: 'Sleep', secondary: 'Read' },
      kitchen: { primary: 'Eat', secondary: 'Cook' },
      garden: { primary: 'Play', secondary: 'Water' },
      living: { primary: 'Watch TV', secondary: 'Relax' },
      bathroom: { primary: 'Bath', secondary: 'Wash' },
      garage: { primary: 'Drive', secondary: 'Fix' },
      shop: { primary: 'Buy clothes', secondary: 'Try on' },
      supermarket: { primary: 'Buy food', secondary: 'Explore' },
    },
    stats: {
      health: 'Health',
      hunger: 'Hunger',
      energy: 'Energy',
      happiness: 'Happiness',
    },
    messages: {
      sleeping: 'Zzz... 💤',
      eating: 'Yum yum... 🍪',
      playing: 'Weee! ⭐',
      watching: 'So cool! 📺',
      bathing: 'Splash! 🛁',
      driving: 'Vroom vroom! 🚗',
      shopping: 'Beautiful! 👗',
      buying: 'Bought! 🛒',
      notEnoughCoins: 'Need more coins!',
    },
    explore: 'Explore the house!',
    footer: 'Onde Kids ✨',
  },
};

type Language = 'it' | 'en';
type RoomKey = 'bedroom' | 'kitchen' | 'garden' | 'living' | 'bathroom' | 'garage' | 'shop' | 'supermarket';

interface PetStats {
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  coins: number;
}

const roomData: { key: RoomKey; icon: string; bg: string; category: 'home' | 'outside' }[] = [
  { key: 'bedroom', icon: '🛏️', bg: '/assets/backgrounds/room-bedroom.jpg', category: 'home' },
  { key: 'kitchen', icon: '🍳', bg: '/assets/backgrounds/room-kitchen.jpg', category: 'home' },
  { key: 'living', icon: '🛋️', bg: '/assets/backgrounds/room-living.jpg', category: 'home' },
  { key: 'bathroom', icon: '🛁', bg: '/assets/backgrounds/room-bathroom.jpg', category: 'home' },
  { key: 'garden', icon: '🌙', bg: '/assets/backgrounds/room-garden.jpg', category: 'home' },
  { key: 'garage', icon: '🚗', bg: '/assets/backgrounds/room-garage.jpg', category: 'home' },
  { key: 'shop', icon: '👗', bg: '/assets/backgrounds/room-shop.jpg', category: 'outside' },
  { key: 'supermarket', icon: '🛒', bg: '/assets/backgrounds/room-supermarket.jpg', category: 'outside' },
];

function App() {
  const [lang, setLang] = useState<Language>('it');
  const t = translations[lang];

  const [stats, setStats] = useState<PetStats>({
    health: 80,
    hunger: 60,
    energy: 90,
    happiness: 75,
    coins: 100,
  });
  const [currentRoom, setCurrentRoom] = useState(0);
  const [isActing, setIsActing] = useState(false);
  const [actionBubble, setActionBubble] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [lunaPosition, setLunaPosition] = useState({ x: 50, y: 50 });
  const [floatPhase, setFloatPhase] = useState(0);

  // Float animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatPhase(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Stat decay over time
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        hunger: Math.max(0, prev.hunger - 1),
        energy: Math.max(0, prev.energy - 0.5),
        happiness: Math.max(0, prev.happiness - 0.3),
        health: prev.hunger < 20 ? Math.max(0, prev.health - 1) : prev.health,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showBubble = (text: string) => {
    setActionBubble(text);
    setTimeout(() => setActionBubble(''), 2000);
  };

  const doAction = (duration: number, callback: () => void) => {
    if (isActing) return;
    setIsActing(true);
    callback();
    setTimeout(() => setIsActing(false), duration);
  };

  const handleRoomAction = (actionType: 'primary' | 'secondary') => {
    const room = roomData[currentRoom];
    const cost = actionType === 'primary' ? 5 : 3;

    if ((room.key === 'shop' || room.key === 'supermarket') && stats.coins < cost) {
      showBubble(t.messages.notEnoughCoins);
      return;
    }

    doAction(2000, () => {
      let message = '';
      let statChanges: Partial<PetStats> = {};

      switch (room.key) {
        case 'bedroom':
          message = t.messages.sleeping;
          statChanges = { energy: Math.min(100, stats.energy + 40), health: Math.min(100, stats.health + 10) };
          break;
        case 'kitchen':
          message = t.messages.eating;
          statChanges = { hunger: Math.min(100, stats.hunger + 30), health: Math.min(100, stats.health + 5) };
          break;
        case 'garden':
          message = t.messages.playing;
          statChanges = { happiness: Math.min(100, stats.happiness + 25), energy: Math.max(0, stats.energy - 10), coins: stats.coins + 10 };
          break;
        case 'living':
          message = t.messages.watching;
          statChanges = { happiness: Math.min(100, stats.happiness + 15), energy: Math.min(100, stats.energy + 5) };
          break;
        case 'bathroom':
          message = t.messages.bathing;
          statChanges = { health: Math.min(100, stats.health + 15), happiness: Math.min(100, stats.happiness + 10) };
          break;
        case 'garage':
          message = t.messages.driving;
          statChanges = { happiness: Math.min(100, stats.happiness + 20), energy: Math.max(0, stats.energy - 5) };
          break;
        case 'shop':
          message = t.messages.shopping;
          statChanges = { happiness: Math.min(100, stats.happiness + 30), coins: stats.coins - cost };
          break;
        case 'supermarket':
          message = t.messages.buying;
          statChanges = { hunger: Math.min(100, stats.hunger + 25), coins: stats.coins - cost };
          break;
      }

      showBubble(message);
      setStats((prev) => ({ ...prev, ...statChanges }));
    });
  };

  const navigateToRoom = (index: number) => {
    setCurrentRoom(index);
    setShowMap(false);
    // Animate Luna to center of room
    setLunaPosition({ x: 50, y: 60 });
  };

  const toggleLanguage = () => {
    setLang(lang === 'it' ? 'en' : 'it');
  };

  const floatY = Math.sin(floatPhase * Math.PI / 180) * 8;

  const currentRoomData = roomData[currentRoom];
  const roomActions = t.actions[currentRoomData.key as keyof typeof t.actions];

  // Map View
  if (showMap) {
    return (
      <div className="full-page-bg map-view" style={{ backgroundImage: `url(/assets/backgrounds/room-living.jpg)` }}>
        <div className="overlay map-overlay" />

        {/* Header */}
        <div className="header glass-card">
          <h1 className="title">{t.title}</h1>
          <div className="header-right">
            <button className="lang-toggle" onClick={toggleLanguage}>
              {lang === 'it' ? '🇮🇹' : '🇬🇧'}
            </button>
            <div className="coin-container">
              <span className="coin-icon">✨</span>
              <span className="coin-text">{stats.coins}</span>
            </div>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="mini-stats glass-card">
          <span>💚 {Math.round(stats.health)}</span>
          <span>🍪 {Math.round(stats.hunger)}</span>
          <span>⚡ {Math.round(stats.energy)}</span>
          <span>💖 {Math.round(stats.happiness)}</span>
        </div>

        {/* Explore Text */}
        <p className="explore-text">{t.explore}</p>

        {/* Room Grid */}
        <div className="room-grid">
          {roomData.map((room, index) => (
            <button
              key={room.key}
              className="room-card glass-card"
              onClick={() => navigateToRoom(index)}
              style={{ backgroundImage: `url(${room.bg})` }}
            >
              <div className="room-card-overlay" />
              <span className="room-card-icon">{room.icon}</span>
              <span className="room-card-name">{t.rooms[room.key]}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="footer">{t.footer}</p>
      </div>
    );
  }

  // Room View
  return (
    <div
      className="full-page-bg room-view"
      style={{ backgroundImage: `url(${currentRoomData.bg})` }}
    >
      <div className="overlay" />

      {/* Floating particles */}
      <div className="particles">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${10 + (i * 12)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>

      {/* Header with back button */}
      <div className="header glass-card">
        <button className="back-btn" onClick={() => setShowMap(true)}>
          ← 🏠
        </button>
        <h1 className="title room-title">
          {currentRoomData.icon} {t.rooms[currentRoomData.key]}
        </h1>
        <div className="header-right">
          <div className="coin-container">
            <span className="coin-icon">✨</span>
            <span className="coin-text">{stats.coins}</span>
          </div>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="mini-stats glass-card">
        <span>💚 {Math.round(stats.health)}</span>
        <span>🍪 {Math.round(stats.hunger)}</span>
        <span>⚡ {Math.round(stats.energy)}</span>
        <span>💖 {Math.round(stats.happiness)}</span>
      </div>

      {/* Luna Character */}
      <div
        className="luna-container"
        style={{
          left: `${lunaPosition.x}%`,
          top: `${lunaPosition.y}%`,
          transform: `translate(-50%, -50%) translateY(${floatY}px)`
        }}
      >
        {/* Action Bubble */}
        {actionBubble && (
          <div className="bubble glass-card">
            <span className="bubble-text">{actionBubble}</span>
          </div>
        )}

        <img
          src="/assets/character/luna-happy.jpg"
          alt="Luna"
          className={`luna-img ${isActing ? 'acting' : ''}`}
        />
        <div className="luna-glow" />
      </div>

      {/* Action Buttons */}
      <div className="room-actions">
        <button
          className={`action-btn glass-card ${isActing ? 'disabled' : ''}`}
          onClick={() => handleRoomAction('primary')}
          disabled={isActing}
        >
          <span className="action-label">{roomActions.primary}</span>
          {(currentRoomData.key === 'shop' || currentRoomData.key === 'supermarket') && (
            <span className="action-cost">-5 ✨</span>
          )}
        </button>

        <button
          className={`action-btn secondary glass-card ${isActing ? 'disabled' : ''}`}
          onClick={() => handleRoomAction('secondary')}
          disabled={isActing}
        >
          <span className="action-label">{roomActions.secondary}</span>
        </button>
      </div>

      {/* Footer */}
      <p className="footer">{t.footer}</p>
    </div>
  );
}

export default App;
