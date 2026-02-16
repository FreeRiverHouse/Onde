'use client';

import { useState, useCallback, useRef } from 'react';

// ─── Name Parts Database ───
const ADJECTIVES = [
  'Shadow', 'Dark', 'Ice', 'Fire', 'Storm', 'Thunder', 'Crystal', 'Golden',
  'Silver', 'Iron', 'Diamond', 'Emerald', 'Obsidian', 'Nether', 'Ender',
  'Phantom', 'Blaze', 'Frost', 'Lava', 'Mystic', 'Ancient', 'Void',
  'Crimson', 'Azure', 'Toxic', 'Stealth', 'Savage', 'Swift', 'Lucky',
  'Epic', 'Mega', 'Ultra', 'Super', 'Hyper', 'Turbo', 'Pixel', 'Glitch',
  'Cosmic', 'Lunar', 'Solar', 'Stellar', 'Nova', 'Atomic', 'Primal',
  'Elite', 'Pro', 'Alpha', 'Omega', 'Beta', 'Delta', 'Sigma', 'Rogue',
  'Wild', 'Brave', 'Bold', 'Fierce', 'Silent', 'Hidden', 'Lost',
  'Frozen', 'Burning', 'Electric', 'Cursed', 'Blessed', 'Sacred',
  'Wicked', 'Noble', 'Royal', 'Chaos', 'Zen', 'Radiant', 'Spectral',
];

const NOUNS = [
  'Wolf', 'Dragon', 'Phoenix', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Hawk',
  'Viper', 'Cobra', 'Shark', 'Panther', 'Fox', 'Raven', 'Falcon',
  'Knight', 'Warrior', 'Mage', 'Wizard', 'Ninja', 'Samurai', 'Archer',
  'Hunter', 'Assassin', 'Pirate', 'Viking', 'Gladiator', 'Paladin',
  'Creeper', 'Enderman', 'Wither', 'Ghast', 'Skeleton', 'Zombie',
  'Slayer', 'Crusher', 'Breaker', 'Builder', 'Crafter', 'Miner',
  'Gamer', 'Player', 'Legend', 'Hero', 'Champion', 'Master', 'Boss',
  'King', 'Queen', 'Lord', 'Chief', 'Captain', 'Commander', 'General',
  'Storm', 'Blade', 'Flame', 'Frost', 'Thunder', 'Shadow', 'Star',
  'Pixel', 'Block', 'Cube', 'Craft', 'Forge', 'Anvil', 'Beacon',
  'Demon', 'Angel', 'Spirit', 'Ghost', 'Specter', 'Reaper', 'Titan',
];

const SUFFIXES = [
  '', '', '', '', '', // Empty more often (cleaner names)
  'X', 'Z', 'HD', 'YT', 'TV', 'GG', 'OP', 'XD',
  '_', '0', '1', '7', '9', '99', '69', '420',
  'Jr', 'Sr', 'III', 'V2', 'OG', 'IRL', 'MC',
];

const LEET_MAP: Record<string, string> = {
  a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', l: '1', b: '8',
};

type Style = 'cool' | 'funny' | 'pro' | 'cute' | 'scary' | 'random';

interface StyleDef {
  id: Style;
  label: string;
  emoji: string;
  desc: string;
}

const STYLES: StyleDef[] = [
  { id: 'cool', label: 'Cool', emoji: '😎', desc: 'Epic & badass names' },
  { id: 'funny', label: 'Funny', emoji: '😂', desc: 'Silly & hilarious names' },
  { id: 'pro', label: 'Pro', emoji: '🏆', desc: 'Competitive & clean names' },
  { id: 'cute', label: 'Cute', emoji: '🥰', desc: 'Adorable & sweet names' },
  { id: 'scary', label: 'Scary', emoji: '💀', desc: 'Dark & spooky names' },
  { id: 'random', label: 'Random', emoji: '🎲', desc: 'Totally random mix' },
];

const COOL_ADJ = ['Shadow', 'Dark', 'Ice', 'Storm', 'Thunder', 'Blaze', 'Void', 'Crimson', 'Phantom', 'Elite', 'Alpha', 'Omega', 'Sigma', 'Stealth', 'Rogue', 'Savage'];
const COOL_NOUN = ['Wolf', 'Dragon', 'Phoenix', 'Knight', 'Ninja', 'Samurai', 'Slayer', 'Blade', 'Reaper', 'Legend', 'Titan', 'Wither', 'Enderman'];

const FUNNY_ADJ = ['Derpy', 'Chunky', 'Wobbly', 'Sneaky', 'Silly', 'Clumsy', 'Bouncy', 'Wiggly', 'Crispy', 'Crunchy', 'Soggy', 'Flappy', 'Noodle', 'Pickle', 'Waffle', 'Cheese'];
const FUNNY_NOUN = ['Potato', 'Chicken', 'Nugget', 'Pancake', 'Burrito', 'Taco', 'Noodle', 'Muffin', 'Cookie', 'Banana', 'Penguin', 'Hamster', 'Llama', 'Walrus', 'Platypus', 'Toast'];

const PRO_ADJ = ['Pro', 'Elite', 'Swift', 'Alpha', 'Prime', 'Ace', 'Sharp', 'Clean', 'Fast', 'Top', 'High', 'Max', 'Ultra', 'Peak', 'True', 'Pure'];
const PRO_NOUN = ['Gamer', 'Player', 'Champion', 'Master', 'Leader', 'Winner', 'Sniper', 'Builder', 'Crafter', 'Miner', 'Hunter', 'Captain', 'General', 'Boss', 'King', 'Hero'];

const CUTE_ADJ = ['Little', 'Tiny', 'Baby', 'Sweet', 'Fluffy', 'Soft', 'Fuzzy', 'Cozy', 'Dreamy', 'Sparkle', 'Sunny', 'Happy', 'Lucky', 'Lovely', 'Peachy', 'Starry'];
const CUTE_NOUN = ['Bunny', 'Kitten', 'Puppy', 'Panda', 'Duckling', 'Butterfly', 'Cupcake', 'Blossom', 'Sprinkle', 'Daisy', 'Berry', 'Cloud', 'Angel', 'Fairy', 'Star', 'Heart'];

const SCARY_ADJ = ['Dark', 'Grim', 'Cursed', 'Wicked', 'Dread', 'Hollow', 'Sinister', 'Twisted', 'Venom', 'Toxic', 'Undead', 'Haunted', 'Forsaken', 'Doomed', 'Fallen', 'Corrupted'];
const SCARY_NOUN = ['Reaper', 'Demon', 'Ghost', 'Specter', 'Skeleton', 'Zombie', 'Phantom', 'Wraith', 'Ghoul', 'Creeper', 'Shade', 'Horror', 'Terror', 'Fiend', 'Beast', 'Crypt'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(style: Style, useNumbers: boolean, useLeet: boolean, maxLen: number): string {
  let adj: string, noun: string;

  switch (style) {
    case 'cool':
      adj = pick(COOL_ADJ); noun = pick(COOL_NOUN); break;
    case 'funny':
      adj = pick(FUNNY_ADJ); noun = pick(FUNNY_NOUN); break;
    case 'pro':
      adj = pick(PRO_ADJ); noun = pick(PRO_NOUN); break;
    case 'cute':
      adj = pick(CUTE_ADJ); noun = pick(CUTE_NOUN); break;
    case 'scary':
      adj = pick(SCARY_ADJ); noun = pick(SCARY_NOUN); break;
    default:
      adj = pick(ADJECTIVES); noun = pick(NOUNS); break;
  }

  // Random separator
  const separators = ['', '_', '', '', '']; // mostly no separator
  const sep = pick(separators);

  let name = `${adj}${sep}${noun}`;

  // Add suffix sometimes
  if (useNumbers && Math.random() > 0.5) {
    const suffix = pick(SUFFIXES);
    if (suffix) name += suffix;
  }

  // Leet speak
  if (useLeet && Math.random() > 0.6) {
    name = name.split('').map(c => {
      const lower = c.toLowerCase();
      return (Math.random() > 0.7 && LEET_MAP[lower]) ? LEET_MAP[lower] : c;
    }).join('');
  }

  // Trim to max length (Minecraft limit is 16)
  if (name.length > maxLen) {
    name = name.slice(0, maxLen);
  }

  return name;
}

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

export default function NameGeneratorPage() {
  const [style, setStyle] = useState<Style>('cool');
  const [useNumbers, setUseNumbers] = useState(true);
  const [useLeet, setUseLeet] = useState(false);
  const [maxLen, setMaxLen] = useState(16);
  const [names, setNames] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const namesRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(() => {
    setAnimating(true);
    const newNames: string[] = [];
    const seen = new Set<string>();
    
    while (newNames.length < 10) {
      const name = generateName(style, useNumbers, useLeet, maxLen);
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        newNames.push(name);
      }
    }
    
    setNames(newNames);
    setTimeout(() => setAnimating(false), 300);
  }, [style, useNumbers, useLeet, maxLen]);

  const handleCopy = (name: string) => {
    copyToClipboard(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const charCount = (name: string) => {
    const len = name.length;
    if (len <= 12) return 'text-green-400';
    if (len <= 14) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <a href="/games/" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
          ← Back to Games
        </a>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
          ⚒️ Minecraft Name Generator
        </h1>
        <p className="text-center text-gray-400 text-lg mb-2">
          Generate cool, funny, and unique Minecraft usernames instantly!
        </p>
        <p className="text-center text-gray-500 text-sm">
          Max 16 characters • Over 10,000+ combinations • Free & No Ads
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Style Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">Choose your style:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-3 rounded-xl text-center transition-all ${
                  style === s.id
                    ? 'bg-green-600 ring-2 ring-green-400 scale-105'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-sm font-medium">{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4 mb-6">
          <label className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={e => setUseNumbers(e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm">Add numbers</span>
          </label>
          <label className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={useLeet}
              onChange={e => setUseLeet(e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm">L33t speak</span>
          </label>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-400">Max:</span>
            <select
              value={maxLen}
              onChange={e => setMaxLen(Number(e.target.value))}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1"
            >
              <option value={10}>10 chars</option>
              <option value={12}>12 chars</option>
              <option value={14}>14 chars</option>
              <option value={16}>16 chars</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generate}
          className="w-full py-4 bg-green-600 hover:bg-green-500 active:bg-green-700 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] active:scale-95 mb-8 shadow-lg shadow-green-600/20"
        >
          ⚡ Generate Names
        </button>

        {/* Names Grid */}
        {names.length > 0 && (
          <div ref={namesRef} className={`transition-opacity duration-300 ${animating ? 'opacity-50' : 'opacity-100'}`}>
            <h2 className="text-lg font-semibold mb-3 text-gray-300">
              {STYLES.find(s => s.id === style)?.emoji} Your names:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {names.map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-750 rounded-xl px-4 py-3 group transition-all"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                    <span className="font-mono text-lg font-semibold">{name}</span>
                    <span className={`text-xs ${charCount(name)}`}>
                      {name.length}ch
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(name)}
                      className="text-xl hover:scale-125 transition-transform"
                      title={favorites.includes(name) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.includes(name) ? '⭐' : '☆'}
                    </button>
                    <button
                      onClick={() => handleCopy(name)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        copied === name
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {copied === name ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-yellow-400">
              ⭐ Your Favorites ({favorites.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {favorites.map((name, i) => (
                <div
                  key={name}
                  className="flex items-center justify-between bg-yellow-900/20 border border-yellow-800/30 rounded-xl px-4 py-3"
                >
                  <span className="font-mono text-lg">{name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(name)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => toggleFavorite(name)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {names.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">⚒️</div>
            <p className="text-lg">Click the button above to generate cool names!</p>
            <p className="text-sm mt-2">Choose a style and customize your options first</p>
          </div>
        )}

        {/* Cross-promo */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-800/20">
          <h3 className="text-lg font-semibold mb-2">🎨 Got your name? Now make your skin!</h3>
          <p className="text-gray-400 mb-4">
            Use our free Minecraft Skin Creator to design a custom skin that matches your new username.
          </p>
          <a
            href="/games/skin-creator/"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all hover:scale-105"
          >
            🎨 Open Skin Creator →
          </a>
        </div>

        {/* SEO Content */}
        <div className="mt-12 space-y-6 text-gray-400 text-sm">
          <h2 className="text-2xl font-bold text-gray-200">How to Pick the Perfect Minecraft Username</h2>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">📏 Minecraft Name Rules</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Minecraft usernames can be 3-16 characters long</li>
              <li>Only letters, numbers, and underscores are allowed</li>
              <li>Names are case-insensitive (but display your casing)</li>
              <li>You can change your Java Edition name every 30 days</li>
              <li>Bedrock Edition names follow Xbox/PSN/Nintendo rules</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">💡 Tips for a Great Username</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Keep it short:</strong> 8-12 characters are easiest to remember</li>
              <li><strong>Make it unique:</strong> Combine unexpected words for originality</li>
              <li><strong>Avoid numbers at the end:</strong> &quot;Player123&quot; feels generic</li>
              <li><strong>Match your playstyle:</strong> Builder? Try crafting-themed names. PvP? Go for warrior names</li>
              <li><strong>Check availability:</strong> Search your name on namemc.com before committing</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">🎮 Popular Name Styles</h3>
            <p>
              <strong>OG Style:</strong> Short, clean, one-word names (rare and valuable). 
              <strong> Competitive:</strong> Clean names with clan tags or &quot;Pro&quot;/&quot;YT&quot; suffixes. 
              <strong> Creative:</strong> Unique combinations that tell a story about your character. 
              <strong> Funny:</strong> Silly combinations that make people laugh in chat.
            </p>
          </div>
        </div>

        {/* More tools */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/games/skin-creator/" className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-center transition-all">
            <div className="text-3xl mb-2">🎨</div>
            <div className="font-semibold">Skin Creator</div>
            <div className="text-xs text-gray-400">Design Minecraft skins</div>
          </a>
          <a href="/games/enchant-calc/" className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-center transition-all">
            <div className="text-3xl mb-2">✨</div>
            <div className="font-semibold">Enchant Calculator</div>
            <div className="text-xs text-gray-400">Plan your enchantments</div>
          </a>
          <a href="/games/pixel-art/" className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-center transition-all">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="font-semibold">Pixel Art</div>
            <div className="text-xs text-gray-400">Create pixel artwork</div>
          </a>
        </div>
      </div>
    </div>
  );
}
