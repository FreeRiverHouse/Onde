import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEffect } from '../useSoundManager';
import '../InteractiveObjects.css';

// Types
type RoomKey = 'bedroom' | 'kitchen' | 'garden' | 'living' | 'bathroom' | 'garage' | 'shop' | 'supermarket' | 'attic' | 'basement' | 'library';

interface InteractiveObject {
  id: string;
  name: { it: string; en: string };
  icon: string;
  position: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
  action: 'mini-game' | 'reward' | 'story' | 'surprise' | 'achievement';
  gameType?: 'puzzle' | 'drawing' | 'memory' | 'stars' | 'quiz';
  reward?: { coins?: number; xp?: number; happiness?: number };
  story?: { it: string; en: string };
  cooldown?: number; // seconds before can use again
  unlockLevel?: number;
}

// Interactive objects for each room
const ROOM_OBJECTS: Record<RoomKey, InteractiveObject[]> = {
  bedroom: [
    {
      id: 'tablet',
      name: { it: 'Tablet', en: 'Tablet' },
      icon: '📱',
      position: { x: 25, y: 40 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'puzzle',
    },
    {
      id: 'bookshelf',
      name: { it: 'Libreria', en: 'Bookshelf' },
      icon: '📚',
      position: { x: 75, y: 35 },
      size: 'large',
      action: 'story',
      story: {
        it: '✨ "Un giorno, Moonlight scoprì che la magia era dentro di lei..." ✨',
        en: '✨ "One day, Moonlight discovered that magic was inside her all along..." ✨'
      },
      reward: { happiness: 5, xp: 5 },
    },
    {
      id: 'toybox',
      name: { it: 'Cesta dei Giochi', en: 'Toy Box' },
      icon: '🧸',
      position: { x: 15, y: 70 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'memory',
    },
    {
      id: 'music-box',
      name: { it: 'Carillon', en: 'Music Box' },
      icon: '🎵',
      position: { x: 50, y: 25 },
      size: 'small',
      action: 'reward',
      reward: { happiness: 10, xp: 3 },
      cooldown: 300, // 5 minutes
    },
    {
      id: 'window',
      name: { it: 'Finestra', en: 'Window' },
      icon: '🌙',
      position: { x: 85, y: 20 },
      size: 'large',
      action: 'surprise',
      reward: { coins: 5 },
    },
  ],
  kitchen: [
    {
      id: 'fridge',
      name: { it: 'Frigorifero', en: 'Fridge' },
      icon: '🧊',
      position: { x: 20, y: 40 },
      size: 'large',
      action: 'surprise',
      reward: { coins: 3 },
    },
    {
      id: 'recipe-book',
      name: { it: 'Libro di Ricette', en: 'Recipe Book' },
      icon: '📖',
      position: { x: 60, y: 50 },
      size: 'small',
      action: 'mini-game',
      gameType: 'quiz',
    },
    {
      id: 'cookie-jar',
      name: { it: 'Barattolo di Biscotti', en: 'Cookie Jar' },
      icon: '🍪',
      position: { x: 80, y: 35 },
      size: 'medium',
      action: 'reward',
      reward: { happiness: 8, xp: 2 },
      cooldown: 180,
    },
  ],
  garden: [
    {
      id: 'telescope',
      name: { it: 'Telescopio', en: 'Telescope' },
      icon: '🔭',
      position: { x: 70, y: 30 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'stars',
    },
    {
      id: 'flower-pot',
      name: { it: 'Vaso di Fiori', en: 'Flower Pot' },
      icon: '🌻',
      position: { x: 30, y: 65 },
      size: 'small',
      action: 'reward',
      reward: { happiness: 5, xp: 3 },
      cooldown: 600,
    },
    {
      id: 'treehouse',
      name: { it: 'Casa sull\'Albero', en: 'Treehouse' },
      icon: '🏡',
      position: { x: 15, y: 25 },
      size: 'large',
      action: 'story',
      story: {
        it: '🌳 Dalla casa sull\'albero, Moonlight vede tutto il mondo magico! 🌈',
        en: '🌳 From the treehouse, Moonlight can see the whole magical world! 🌈'
      },
      reward: { happiness: 15 },
    },
    {
      id: 'butterfly',
      name: { it: 'Farfalla', en: 'Butterfly' },
      icon: '🦋',
      position: { x: 50, y: 45 },
      size: 'small',
      action: 'surprise',
    },
  ],
  living: [
    {
      id: 'tv',
      name: { it: 'TV', en: 'TV' },
      icon: '📺',
      position: { x: 50, y: 35 },
      size: 'large',
      action: 'mini-game',
      gameType: 'quiz',
    },
    {
      id: 'piano',
      name: { it: 'Pianoforte', en: 'Piano' },
      icon: '🎹',
      position: { x: 20, y: 60 },
      size: 'large',
      action: 'reward',
      reward: { happiness: 12, xp: 8 },
    },
    {
      id: 'painting',
      name: { it: 'Quadro', en: 'Painting' },
      icon: '🖼️',
      position: { x: 75, y: 25 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'drawing',
    },
  ],
  bathroom: [
    {
      id: 'rubber-duck',
      name: { it: 'Paperella', en: 'Rubber Duck' },
      icon: '🦆',
      position: { x: 35, y: 55 },
      size: 'small',
      action: 'surprise',
      reward: { happiness: 5 },
    },
    {
      id: 'mirror',
      name: { it: 'Specchio', en: 'Mirror' },
      icon: '🪞',
      position: { x: 70, y: 30 },
      size: 'medium',
      action: 'story',
      story: {
        it: '✨ Moonlight si guarda allo specchio e vede quanto è speciale! ✨',
        en: '✨ Moonlight looks in the mirror and sees how special she is! ✨'
      },
      reward: { happiness: 8 },
    },
    {
      id: 'soap-bubbles',
      name: { it: 'Bolle Sapone', en: 'Soap Bubbles' },
      icon: '🫧',
      position: { x: 55, y: 40 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'stars', // Pop the bubbles!
    },
    {
      id: 'toothbrush',
      name: { it: 'Spazzolino', en: 'Toothbrush' },
      icon: '🪥',
      position: { x: 20, y: 35 },
      size: 'small',
      action: 'reward',
      reward: { happiness: 5, xp: 2 },
      cooldown: 300,
    },
    {
      id: 'bath-toy-boat',
      name: { it: 'Barchetta', en: 'Toy Boat' },
      icon: '⛵',
      position: { x: 45, y: 70 },
      size: 'small',
      action: 'story',
      story: {
        it: '⛵ La barchetta naviga nelle onde della vasca! Splash splash! 🌊',
        en: '⛵ The little boat sails through the bathtub waves! Splash splash! 🌊'
      },
      reward: { happiness: 6 },
    },
  ],
  garage: [
    {
      id: 'toolbox',
      name: { it: 'Cassetta Attrezzi', en: 'Toolbox' },
      icon: '🧰',
      position: { x: 25, y: 50 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'puzzle',
    },
    {
      id: 'radio',
      name: { it: 'Radio', en: 'Radio' },
      icon: '📻',
      position: { x: 70, y: 40 },
      size: 'small',
      action: 'reward',
      reward: { happiness: 6 },
    },
    {
      id: 'toy-car',
      name: { it: 'Macchinina', en: 'Toy Car' },
      icon: '🚗',
      position: { x: 50, y: 65 },
      size: 'medium',
      action: 'story',
      story: {
        it: '🏎️ Brum brum! Moonlight immagina di guidare in una gara! Che brivido! 🏁',
        en: '🏎️ Vroom vroom! Moonlight imagines racing in a big race! How thrilling! 🏁'
      },
      reward: { happiness: 8 },
    },
    {
      id: 'bike',
      name: { it: 'Bicicletta', en: 'Bicycle' },
      icon: '🚲',
      position: { x: 80, y: 55 },
      size: 'large',
      action: 'reward',
      reward: { happiness: 10, xp: 5 },
      cooldown: 240,
    },
    {
      id: 'paint-cans',
      name: { it: 'Barattoli Vernice', en: 'Paint Cans' },
      icon: '🎨',
      position: { x: 15, y: 35 },
      size: 'small',
      action: 'mini-game',
      gameType: 'drawing',
    },
  ],
  shop: [
    {
      id: 'mannequin',
      name: { it: 'Manichino', en: 'Mannequin' },
      icon: '👗',
      position: { x: 40, y: 45 },
      size: 'large',
      action: 'surprise',
    },
    {
      id: 'mirror-shop',
      name: { it: 'Specchio Prova', en: 'Fitting Mirror' },
      icon: '🪞',
      position: { x: 70, y: 40 },
      size: 'large',
      action: 'reward',
      reward: { happiness: 8 },
      cooldown: 120,
    },
    {
      id: 'shoe-rack',
      name: { it: 'Scaffale Scarpe', en: 'Shoe Rack' },
      icon: '👠',
      position: { x: 20, y: 55 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'memory',
    },
    {
      id: 'jewelry-box',
      name: { it: 'Portagioie', en: 'Jewelry Box' },
      icon: '💎',
      position: { x: 80, y: 65 },
      size: 'small',
      action: 'surprise',
      reward: { coins: 5, happiness: 5 },
    },
  ],
  supermarket: [
    {
      id: 'cart',
      name: { it: 'Carrello', en: 'Cart' },
      icon: '🛒',
      position: { x: 60, y: 60 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'memory',
    },
    {
      id: 'fruit-stand',
      name: { it: 'Banco Frutta', en: 'Fruit Stand' },
      icon: '🍎',
      position: { x: 25, y: 40 },
      size: 'large',
      action: 'reward',
      reward: { happiness: 5, xp: 3 },
      cooldown: 180,
    },
    {
      id: 'candy-shelf',
      name: { it: 'Scaffale Dolci', en: 'Candy Shelf' },
      icon: '🍬',
      position: { x: 80, y: 45 },
      size: 'medium',
      action: 'surprise',
      reward: { happiness: 10 },
    },
    {
      id: 'fish-tank',
      name: { it: 'Acquario', en: 'Fish Tank' },
      icon: '🐠',
      position: { x: 50, y: 30 },
      size: 'large',
      action: 'story',
      story: {
        it: '🐟 Pesciolini colorati! Nuotano felici... Moonlight vorrebbe un amico pesce! 🐡',
        en: '🐟 Colorful fish! They swim happily... Moonlight would love a fish friend! 🐡'
      },
      reward: { happiness: 8 },
    },
  ],
  // New explorable areas
  attic: [
    {
      id: 'treasure-chest',
      name: { it: 'Baule del Tesoro', en: 'Treasure Chest' },
      icon: '📦',
      position: { x: 50, y: 45 },
      size: 'large',
      action: 'reward',
      reward: { coins: 15, happiness: 15, xp: 10 },
      cooldown: 600, // 10 minutes
    },
    {
      id: 'old-photo-album',
      name: { it: 'Album di Foto', en: 'Photo Album' },
      icon: '📷',
      position: { x: 25, y: 40 },
      size: 'medium',
      action: 'story',
      story: {
        it: '📸 Moonlight da cucciola! Che ricordi meravigliosi... il primo bagnetto, le prime coccole! ✨',
        en: '📸 Baby Moonlight! What wonderful memories... the first bath, the first cuddles! ✨'
      },
      reward: { happiness: 10 },
    },
    {
      id: 'dusty-mirror',
      name: { it: 'Specchio Polveroso', en: 'Dusty Mirror' },
      icon: '🪞',
      position: { x: 75, y: 35 },
      size: 'medium',
      action: 'surprise',
      reward: { xp: 5 },
    },
    {
      id: 'old-toy-box',
      name: { it: 'Scatola Giochi Vecchi', en: 'Old Toy Box' },
      icon: '🎁',
      position: { x: 15, y: 65 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'puzzle',
    },
    {
      id: 'cobweb',
      name: { it: 'Ragnatela', en: 'Cobweb' },
      icon: '🕸️',
      position: { x: 85, y: 20 },
      size: 'small',
      action: 'surprise',
    },
    {
      id: 'magic-book',
      name: { it: 'Libro Magico', en: 'Magic Book' },
      icon: '📕',
      position: { x: 60, y: 70 },
      size: 'medium',
      action: 'story',
      story: {
        it: '✨ "Chi trova questo libro troverà la magia dentro di sé..." - un antico incantesimo! 🌙',
        en: '✨ "Whoever finds this book shall find the magic within..." - an ancient spell! 🌙'
      },
      reward: { happiness: 20, xp: 15 },
      unlockLevel: 3,
    },
  ],
  basement: [
    {
      id: 'workbench',
      name: { it: 'Banco da Lavoro', en: 'Workbench' },
      icon: '🪵',
      position: { x: 50, y: 50 },
      size: 'large',
      action: 'mini-game',
      gameType: 'puzzle',
    },
    {
      id: 'storage-boxes',
      name: { it: 'Scatoloni', en: 'Storage Boxes' },
      icon: '📦',
      position: { x: 20, y: 45 },
      size: 'large',
      action: 'surprise',
      reward: { coins: 5 },
    },
    {
      id: 'secret-door',
      name: { it: 'Porta Segreta', en: 'Secret Door' },
      icon: '🚪',
      position: { x: 80, y: 40 },
      size: 'large',
      action: 'story',
      story: {
        it: '🔮 Dietro questa porta... c\'è un passaggio segreto! Dove porterà? Un giorno lo scopriremo! 🗝️',
        en: '🔮 Behind this door... there\'s a secret passage! Where does it lead? One day we\'ll find out! 🗝️'
      },
      reward: { xp: 20, happiness: 15 },
      unlockLevel: 5,
    },
    {
      id: 'flashlight',
      name: { it: 'Torcia', en: 'Flashlight' },
      icon: '🔦',
      position: { x: 35, y: 65 },
      size: 'small',
      action: 'reward',
      reward: { happiness: 5 },
      cooldown: 120,
    },
    {
      id: 'old-painting',
      name: { it: 'Vecchio Dipinto', en: 'Old Painting' },
      icon: '🖼️',
      position: { x: 65, y: 25 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'drawing',
    },
    {
      id: 'spider',
      name: { it: 'Ragnetto', en: 'Little Spider' },
      icon: '🕷️',
      position: { x: 15, y: 30 },
      size: 'small',
      action: 'surprise',
    },
  ],
  library: [
    {
      id: 'bookshelf',
      name: { it: 'Scaffale Libri', en: 'Bookshelf' },
      icon: '📚',
      position: { x: 20, y: 40 },
      size: 'large',
      action: 'story',
      story: {
        it: '📖 Tanti libri meravigliosi! Quale leggiamo oggi? 🌟',
        en: '📖 So many wonderful books! Which one shall we read? 🌟'
      },
      reward: { happiness: 10, xp: 5 },
    },
    {
      id: 'reading-nook',
      name: { it: 'Angolo Lettura', en: 'Reading Nook' },
      icon: '🛋️',
      position: { x: 70, y: 55 },
      size: 'large',
      action: 'reward',
      reward: { happiness: 15, xp: 5 },
      cooldown: 300,
    },
    {
      id: 'globe',
      name: { it: 'Mappamondo', en: 'Globe' },
      icon: '🌍',
      position: { x: 80, y: 30 },
      size: 'medium',
      action: 'story',
      story: {
        it: '🗺️ Il mondo è grande e pieno di avventure! Dove andremo? 🌏',
        en: '🗺️ The world is big and full of adventures! Where shall we go? 🌏'
      },
      reward: { xp: 10 },
    },
    {
      id: 'magic-lamp',
      name: { it: 'Lampada Magica', en: 'Magic Lamp' },
      icon: '🪔',
      position: { x: 50, y: 25 },
      size: 'small',
      action: 'surprise',
      reward: { happiness: 5, coins: 3 },
    },
    {
      id: 'story-book',
      name: { it: 'Libro di Storie', en: 'Story Book' },
      icon: '📕',
      position: { x: 35, y: 60 },
      size: 'medium',
      action: 'mini-game',
      gameType: 'memory',
    },
  ],
};

// Surprise messages
const SURPRISE_MESSAGES = {
  it: [
    '🌟 Hai trovato una stella! +5 monete!',
    '🎁 Sorpresa! +10 felicità!',
    '✨ Wow! Hai scoperto un segreto!',
    '🦋 Una farfalla magica ti saluta!',
    '🌈 Arcobaleno di fortuna! +3 XP!',
    '🍀 Quadrifoglio fortunato!',
    '🎵 Una melodia magica risuona...',
  ],
  en: [
    '🌟 You found a star! +5 coins!',
    '🎁 Surprise! +10 happiness!',
    '✨ Wow! You discovered a secret!',
    '🦋 A magical butterfly greets you!',
    '🌈 Rainbow of luck! +3 XP!',
    '🍀 Lucky four-leaf clover!',
    '🎵 A magical melody plays...',
  ],
};

interface InteractiveObjectsProps {
  room: RoomKey;
  lang: 'it' | 'en';
  stats: { level: number; coins: number };
  onGameStart: (gameType: string) => void;
  onReward: (reward: { coins?: number; xp?: number; happiness?: number }) => void;
  onStory: (story: string) => void;
  playSound: (sound: SoundEffect) => void;
}

export function InteractiveObjects({
  room,
  lang,
  stats,
  onGameStart,
  onReward,
  onStory,
  playSound,
}: InteractiveObjectsProps) {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [activeObject, setActiveObject] = useState<string | null>(null);
  const [surpriseMessage, setSurpriseMessage] = useState<string | null>(null);

  const objects = ROOM_OBJECTS[room] || [];

  const handleObjectClick = (obj: InteractiveObject) => {
    // Check level requirement
    if (obj.unlockLevel && stats.level < obj.unlockLevel) {
      setSurpriseMessage(lang === 'it' 
        ? `🔒 Sblocca al livello ${obj.unlockLevel}!`
        : `🔒 Unlock at level ${obj.unlockLevel}!`
      );
      setTimeout(() => setSurpriseMessage(null), 2000);
      playSound('ui-error');
      return;
    }

    // Check cooldown
    const now = Date.now();
    if (obj.cooldown && cooldowns[obj.id] && now < cooldowns[obj.id]) {
      const remaining = Math.ceil((cooldowns[obj.id] - now) / 1000);
      setSurpriseMessage(lang === 'it'
        ? `⏳ Aspetta ${remaining}s...`
        : `⏳ Wait ${remaining}s...`
      );
      setTimeout(() => setSurpriseMessage(null), 1500);
      playSound('ui-error');
      return;
    }

    // Set cooldown if applicable
    if (obj.cooldown) {
      setCooldowns(prev => ({ ...prev, [obj.id]: now + obj.cooldown! * 1000 }));
    }

    setActiveObject(obj.id);
    playSound('ui-click');

    // Handle action
    switch (obj.action) {
      case 'mini-game':
        if (obj.gameType) {
          setTimeout(() => {
            onGameStart(obj.gameType!);
            setActiveObject(null);
          }, 300);
        }
        break;

      case 'reward':
        if (obj.reward) {
          onReward(obj.reward);
          setSurpriseMessage(
            lang === 'it'
              ? `✨ ${obj.name.it}! ${obj.reward.happiness ? `+${obj.reward.happiness} 💖` : ''} ${obj.reward.coins ? `+${obj.reward.coins} ✨` : ''} ${obj.reward.xp ? `+${obj.reward.xp} XP` : ''}`
              : `✨ ${obj.name.en}! ${obj.reward.happiness ? `+${obj.reward.happiness} 💖` : ''} ${obj.reward.coins ? `+${obj.reward.coins} ✨` : ''} ${obj.reward.xp ? `+${obj.reward.xp} XP` : ''}`
          );
          playSound('coin-collect');
        }
        setTimeout(() => {
          setSurpriseMessage(null);
          setActiveObject(null);
        }, 2000);
        break;

      case 'story':
        if (obj.story) {
          onStory(obj.story[lang]);
          if (obj.reward) onReward(obj.reward);
        }
        setTimeout(() => setActiveObject(null), 300);
        break;

      case 'surprise':
        const surprises = SURPRISE_MESSAGES[lang];
        const message = surprises[Math.floor(Math.random() * surprises.length)];
        setSurpriseMessage(message);
        // Random small reward
        const randomReward = {
          coins: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0,
          happiness: Math.random() > 0.5 ? Math.floor(Math.random() * 8) + 2 : 0,
          xp: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
        };
        onReward({ ...obj.reward, ...randomReward });
        playSound('ui-success');
        setTimeout(() => {
          setSurpriseMessage(null);
          setActiveObject(null);
        }, 2500);
        break;

      case 'achievement':
        // TODO: Achievement integration
        setActiveObject(null);
        break;
    }
  };

  const getSizeClass = (size?: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'object-small';
      case 'large': return 'object-large';
      default: return 'object-medium';
    }
  };

  return (
    <>
      {/* Interactive Objects Layer */}
      <div className="interactive-objects-layer">
        {objects.map((obj) => {
          const isOnCooldown = obj.cooldown && cooldowns[obj.id] && Date.now() < cooldowns[obj.id];
          const isLocked = obj.unlockLevel && stats.level < obj.unlockLevel;
          
          return (
            <motion.button
              key={obj.id}
              className={`interactive-object ${getSizeClass(obj.size)} ${activeObject === obj.id ? 'active' : ''} ${isOnCooldown ? 'cooldown' : ''} ${isLocked ? 'locked' : ''}`}
              style={{ left: `${obj.position.x}%`, top: `${obj.position.y}%` }}
              onClick={() => handleObjectClick(obj)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * objects.indexOf(obj), type: 'spring' }}
            >
              <span className="object-icon">{obj.icon}</span>
              <span className="object-label">{obj.name[lang]}</span>
              {obj.action === 'mini-game' && <span className="object-badge">🎮</span>}
              {isLocked && <span className="object-lock">🔒</span>}
              <div className="object-glow" />
            </motion.button>
          );
        })}
      </div>

      {/* Surprise Message Popup */}
      <AnimatePresence>
        {surpriseMessage && (
          <motion.div
            className="surprise-popup glass-card"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
          >
            {surpriseMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default InteractiveObjects;
