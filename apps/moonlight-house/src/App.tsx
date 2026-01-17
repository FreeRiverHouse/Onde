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
      library: 'Biblioteca', // v1.1
    },
    stats: {
      health: 'Salute',
      hunger: 'Fame',
      energy: 'Energia',
      happiness: 'Felicità',
    },
    actions: {
      feed: 'Mangia',
      play: 'Gioca',
      sleep: 'Dormi',
    },
    messages: {
      notEnoughCoins: 'Non abbastanza monete!',
      eating: 'Gnam gnam... 🍪',
      tooTired: 'Troppo stanco... 😴',
      playing: 'Weee! ⭐',
      sleeping: 'Zzz... 💤',
    },
    footer: 'Onde Kids ✨',
  },
  en: {
    title: 'Moonlight House',
    rooms: {
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      garden: 'Garden',
      library: 'Library', // v1.1
    },
    stats: {
      health: 'Health',
      hunger: 'Hunger',
      energy: 'Energy',
      happiness: 'Happiness',
    },
    actions: {
      feed: 'Feed',
      play: 'Play',
      sleep: 'Sleep',
    },
    messages: {
      notEnoughCoins: 'Not enough coins!',
      eating: 'Yum yum... 🍪',
      tooTired: 'Too tired... 😴',
      playing: 'Weee! ⭐',
      sleeping: 'Zzz... 💤',
    },
    footer: 'Onde Kids ✨',
  },
};

type Language = 'it' | 'en';

interface PetStats {
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  coins: number;
}

const roomData = [
  { key: 'bedroom', icon: '🛏️', bg: '/assets/backgrounds/room-bedroom.jpg' },
  { key: 'kitchen', icon: '🍳', bg: '/assets/backgrounds/room-kitchen.jpg' },
  { key: 'garden', icon: '🌙', bg: '/assets/backgrounds/room-garden.jpg' },
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
  const [mood, setMood] = useState('happy');
  const [floatPhase, setFloatPhase] = useState(0);

  // Float animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatPhase(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Update mood based on stats
  useEffect(() => {
    const avg = (stats.health + stats.hunger + stats.energy + stats.happiness) / 4;
    if (avg < 30) setMood('sad');
    else if (avg < 50) setMood('tired');
    else if (avg < 70) setMood('neutral');
    else setMood('happy');
  }, [stats]);

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

  const feed = () => {
    if (stats.coins < 5) {
      showBubble(t.messages.notEnoughCoins);
      return;
    }
    doAction(2000, () => {
      showBubble(t.messages.eating);
      setStats((prev) => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + 25),
        health: Math.min(100, prev.health + 5),
        coins: prev.coins - 5,
      }));
    });
  };

  const play = () => {
    if (stats.energy < 10) {
      showBubble(t.messages.tooTired);
      return;
    }
    doAction(2500, () => {
      showBubble(t.messages.playing);
      setStats((prev) => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 20),
        energy: Math.max(0, prev.energy - 15),
        coins: prev.coins + 10,
      }));
    });
  };

  const sleep = () => {
    doAction(3000, () => {
      showBubble(t.messages.sleeping);
      setStats((prev) => ({
        ...prev,
        energy: Math.min(100, prev.energy + 40),
        health: Math.min(100, prev.health + 10),
      }));
    });
  };

  const toggleLanguage = () => {
    setLang(lang === 'it' ? 'en' : 'it');
  };

  const floatY = Math.sin(floatPhase * Math.PI / 180) * 12;
  const floatRotate = Math.sin(floatPhase * Math.PI / 180) * 3;

  const getRoomName = (key: string) => {
    return t.rooms[key as keyof typeof t.rooms] || key;
  };

  return (
    <div
      className="full-page-bg"
      style={{ backgroundImage: `url(${roomData[currentRoom].bg})` }}
    >
      {/* Overlay for readability */}
      <div className="overlay" />

      <div className="container">

      {/* Floating particles */}
      <div className="particles">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${10 + (i * 8)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>

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

      {/* Room Tabs */}
      <div className="room-tabs">
        {roomData.map((room, index) => (
          <button
            key={index}
            className={`room-tab glass-card ${currentRoom === index ? 'active' : ''}`}
            onClick={() => setCurrentRoom(index)}
          >
            <span className="room-tab-icon">{room.icon}</span>
            <span className="room-tab-name">{getRoomName(room.key)}</span>
          </button>
        ))}
      </div>

      {/* Character Area */}
      <div className="character-area">
        {/* Action Bubble */}
        {actionBubble && (
          <div className="bubble glass-card">
            <span className="bubble-text">{actionBubble}</span>
          </div>
        )}

        {/* Character - Luna */}
        <div
          className={`character ${isActing ? 'acting' : ''}`}
          style={{
            transform: `translateY(${floatY}px) rotate(${floatRotate}deg)`,
          }}
        >
          <img
            src="/assets/character/luna-happy.jpg"
            alt="Luna"
            className={`character-img ${mood}`}
          />
          <div className="character-glow" />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-container glass-card">
        <StatBar label={t.stats.health} value={stats.health} color="#10b981" icon="💚" />
        <StatBar label={t.stats.hunger} value={stats.hunger} color="#f59e0b" icon="🍪" />
        <StatBar label={t.stats.energy} value={stats.energy} color="#3b82f6" icon="⚡" />
        <StatBar label={t.stats.happiness} value={stats.happiness} color="#ec4899" icon="💖" />
      </div>

      {/* Action Buttons */}
      <div className="actions">
        <button
          className={`action-btn glass-card ${isActing ? 'disabled' : ''}`}
          onClick={feed}
          disabled={isActing}
        >
          <span className="action-icon">🍪</span>
          <span className="action-label">{t.actions.feed}</span>
          <span className="action-cost">-5 ✨</span>
        </button>

        <button
          className={`action-btn glass-card ${isActing ? 'disabled' : ''}`}
          onClick={play}
          disabled={isActing}
        >
          <span className="action-icon">🎮</span>
          <span className="action-label">{t.actions.play}</span>
          <span className="action-cost">+10 ✨</span>
        </button>

        <button
          className={`action-btn glass-card ${isActing ? 'disabled' : ''}`}
          onClick={sleep}
          disabled={isActing}
        >
          <span className="action-icon">💤</span>
          <span className="action-label">{t.actions.sleep}</span>
        </button>
      </div>

      {/* Footer */}
      <p className="footer">{t.footer}</p>
      </div>
    </div>
  );
}

function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="stat-row">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <div className="stat-bar-bg">
        <div
          className="stat-bar-fill"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            boxShadow: `0 0 10px ${color}80`
          }}
        />
      </div>
      <span className="stat-value">{Math.round(value)}</span>
    </div>
  );
}

export default App;
