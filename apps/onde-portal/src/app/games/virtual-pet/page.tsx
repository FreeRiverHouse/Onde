'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────── */

interface PetState {
  name: string;
  species: string;
  emoji: string;
  hunger: number;      // 0-100 (100=full)
  happiness: number;   // 0-100
  energy: number;      // 0-100
  cleanliness: number; // 0-100
  health: number;      // 0-100
  age: number;         // in minutes
  xp: number;
  level: number;
  stage: number;       // 0=egg, 1=baby, 2=child, 3=teen, 4=adult
  born: number;        // timestamp
  lastTick: number;
  coins: number;
  tricks: string[];
  outfit: string | null;
}

interface FeedItem {
  name: string;
  emoji: string;
  hunger: number;
  happiness: number;
  cost: number;
}

interface Activity {
  name: string;
  emoji: string;
  happiness: number;
  energy: number;
  xp: number;
  cost: number;
}

/* ─── Data ──────────────────────────────────────────────── */

const SPECIES = [
  { id: 'cat', name: 'Cat', emoji: '🐱', baby: '🐱', child: '😺', teen: '😸', adult: '🐈' },
  { id: 'dog', name: 'Dog', emoji: '🐶', baby: '🐶', child: '🐕', teen: '🐕‍🦺', adult: '🦮' },
  { id: 'bunny', name: 'Bunny', emoji: '🐰', baby: '🐰', child: '🐇', teen: '🐇', adult: '🐇' },
  { id: 'bear', name: 'Bear', emoji: '🐻', baby: '🧸', child: '🐻', teen: '🐻', adult: '🐻‍❄️' },
  { id: 'penguin', name: 'Penguin', emoji: '🐧', baby: '🐧', child: '🐧', teen: '🐧', adult: '🐧' },
  { id: 'dragon', name: 'Dragon', emoji: '🐲', baby: '🥚', child: '🐉', teen: '🐲', adult: '🐲' },
  { id: 'fox', name: 'Fox', emoji: '🦊', baby: '🦊', child: '🦊', teen: '🦊', adult: '🦊' },
  { id: 'panda', name: 'Panda', emoji: '🐼', baby: '🐼', child: '🐼', teen: '🐼', adult: '🐼' },
];

const FOODS: FeedItem[] = [
  { name: 'Apple', emoji: '🍎', hunger: 15, happiness: 2, cost: 0 },
  { name: 'Cookie', emoji: '🍪', hunger: 10, happiness: 8, cost: 5 },
  { name: 'Cake', emoji: '🎂', hunger: 25, happiness: 15, cost: 15 },
  { name: 'Fish', emoji: '🐟', hunger: 30, happiness: 5, cost: 10 },
  { name: 'Pizza', emoji: '🍕', hunger: 35, happiness: 12, cost: 20 },
  { name: 'Ice Cream', emoji: '🍦', hunger: 15, happiness: 20, cost: 25 },
  { name: 'Steak', emoji: '🥩', hunger: 50, happiness: 10, cost: 40 },
  { name: 'Golden Apple', emoji: '✨🍎', hunger: 100, happiness: 50, cost: 200 },
];

const ACTIVITIES: Activity[] = [
  { name: 'Pet', emoji: '🤗', happiness: 10, energy: -2, xp: 5, cost: 0 },
  { name: 'Play Ball', emoji: '⚽', happiness: 20, energy: -15, xp: 15, cost: 0 },
  { name: 'Fetch', emoji: '🦴', happiness: 15, energy: -10, xp: 10, cost: 0 },
  { name: 'Walk', emoji: '🚶', happiness: 15, energy: -20, xp: 20, cost: 0 },
  { name: 'Toy', emoji: '🧸', happiness: 25, energy: -10, xp: 12, cost: 15 },
  { name: 'Swim', emoji: '🏊', happiness: 30, energy: -25, xp: 25, cost: 10 },
  { name: 'Adventure', emoji: '🗺️', happiness: 40, energy: -35, xp: 50, cost: 30 },
  { name: 'Spa Day', emoji: '💆', happiness: 50, energy: 30, xp: 30, cost: 50 },
];

const OUTFITS = [
  { id: 'hat', name: 'Party Hat', emoji: '🎩', cost: 50 },
  { id: 'bow', name: 'Bow Tie', emoji: '🎀', cost: 30 },
  { id: 'crown', name: 'Crown', emoji: '👑', cost: 100 },
  { id: 'glasses', name: 'Sunglasses', emoji: '🕶️', cost: 40 },
  { id: 'scarf', name: 'Scarf', emoji: '🧣', cost: 35 },
  { id: 'cape', name: 'Cape', emoji: '🦸', cost: 75 },
];

const TRICKS = [
  { name: 'Sit', xpReq: 0 },
  { name: 'Shake', xpReq: 50 },
  { name: 'Roll Over', xpReq: 150 },
  { name: 'Spin', xpReq: 300 },
  { name: 'Dance', xpReq: 600 },
  { name: 'Backflip', xpReq: 1200 },
];

const STAGE_NAMES = ['Egg', 'Baby', 'Child', 'Teen', 'Adult'];
const XP_PER_LEVEL = 100;
const SAVE_KEY = 'onde_virtual_pet_v1';

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function getStage(age: number): number {
  if (age < 2) return 0;      // egg: first 2 min
  if (age < 10) return 1;     // baby
  if (age < 30) return 2;     // child
  if (age < 60) return 3;     // teen
  return 4;                    // adult
}

function getEmoji(species: typeof SPECIES[0], stage: number): string {
  switch (stage) {
    case 0: return '🥚';
    case 1: return species.baby;
    case 2: return species.child;
    case 3: return species.teen;
    case 4: return species.adult;
    default: return species.emoji;
  }
}

function getMood(pet: PetState): { emoji: string; text: string; color: string } {
  const avg = (pet.hunger + pet.happiness + pet.energy + pet.cleanliness) / 4;
  if (avg >= 80) return { emoji: '😊', text: 'Very Happy', color: 'text-green-400' };
  if (avg >= 60) return { emoji: '🙂', text: 'Happy', color: 'text-lime-400' };
  if (avg >= 40) return { emoji: '😐', text: 'Okay', color: 'text-yellow-400' };
  if (avg >= 20) return { emoji: '😟', text: 'Sad', color: 'text-orange-400' };
  return { emoji: '😢', text: 'Very Sad', color: 'text-red-400' };
}

/* ─── Component ─────────────────────────────────────────── */

export default function VirtualPetPage() {
  const [pet, setPet] = useState<PetState | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [petName, setPetName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState(0);
  const [activeTab, setActiveTab] = useState<'feed' | 'play' | 'care' | 'shop'>('feed');
  const [message, setMessage] = useState('');
  const [bounce, setBounce] = useState(false);
  const [ownedOutfits, setOwnedOutfits] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Show message ─────────────────────────────────── */
  const showMsg = useCallback((text: string) => {
    setMessage(text);
    if (msgTimeout.current) clearTimeout(msgTimeout.current);
    msgTimeout.current = setTimeout(() => setMessage(''), 3000);
  }, []);

  /* ─── Load ──────────────────────────────────────────── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.pet) {
          setPet(data.pet);
          setOwnedOutfits(new Set(data.ownedOutfits ?? []));
        } else {
          setChoosing(true);
        }
      } else {
        setChoosing(true);
      }
    } catch {
      setChoosing(true);
    }
    setLoaded(true);
  }, []);

  /* ─── Save ──────────────────────────────────────────── */
  useEffect(() => {
    if (!loaded || !pet) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ pet, ownedOutfits: [...ownedOutfits] }));
  }, [loaded, pet, ownedOutfits]);

  /* ─── Tick (stat decay) ─────────────────────────────── */
  useEffect(() => {
    if (!pet) return;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setPet((prev) => {
        if (!prev) return prev;
        const now = Date.now();
        const elapsed = (now - prev.lastTick) / 1000; // seconds
        if (elapsed < 1) return prev;
        const decay = elapsed / 60; // per minute rate
        const newAge = (now - prev.born) / 60000;
        const newStage = getStage(newAge);
        // Earn coins passively based on level
        const coinsEarned = prev.level * 0.02 * decay;
        return {
          ...prev,
          hunger: clamp(prev.hunger - decay * 2),
          happiness: clamp(prev.happiness - decay * 1.5),
          energy: clamp(prev.energy + decay * 3), // energy recovers
          cleanliness: clamp(prev.cleanliness - decay * 1),
          health: clamp(
            prev.hunger < 10 || prev.cleanliness < 10
              ? prev.health - decay * 2
              : prev.health + decay * 0.5
          ),
          age: newAge,
          stage: newStage,
          lastTick: now,
          coins: prev.coins + coinsEarned,
        };
      });
    }, 2000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [pet?.born]);

  /* ─── Create pet ────────────────────────────────────── */
  const createPet = useCallback(() => {
    const sp = SPECIES[selectedSpecies];
    const name = petName.trim() || sp.name;
    const now = Date.now();
    const newPet: PetState = {
      name,
      species: sp.id,
      emoji: sp.emoji,
      hunger: 80,
      happiness: 80,
      energy: 100,
      cleanliness: 100,
      health: 100,
      age: 0,
      xp: 0,
      level: 1,
      stage: 0,
      born: now,
      lastTick: now,
      coins: 20,
      tricks: [],
      outfit: null,
    };
    setPet(newPet);
    setChoosing(false);
    showMsg(`${name} has been born! 🎉`);
  }, [petName, selectedSpecies, showMsg]);

  /* ─── Actions ───────────────────────────────────────── */
  const feedPet = useCallback((food: FeedItem) => {
    setPet((prev) => {
      if (!prev) return prev;
      if (prev.coins < food.cost) { showMsg("Not enough coins! 💰"); return prev; }
      setBounce(true); setTimeout(() => setBounce(false), 300);
      showMsg(`${prev.name} ate a ${food.name}! ${food.emoji}`);
      return {
        ...prev,
        hunger: clamp(prev.hunger + food.hunger),
        happiness: clamp(prev.happiness + food.happiness),
        coins: prev.coins - food.cost,
        xp: prev.xp + 3,
        level: Math.floor((prev.xp + 3) / XP_PER_LEVEL) + 1,
      };
    });
  }, [showMsg]);

  const playWith = useCallback((activity: Activity) => {
    setPet((prev) => {
      if (!prev) return prev;
      if (prev.energy < Math.abs(activity.energy) && activity.energy < 0) {
        showMsg(`${prev.name} is too tired! 😴`);
        return prev;
      }
      if (prev.coins < activity.cost) { showMsg("Not enough coins! 💰"); return prev; }
      setBounce(true); setTimeout(() => setBounce(false), 300);
      showMsg(`${prev.name} enjoyed ${activity.name}! ${activity.emoji}`);
      const newXp = prev.xp + activity.xp;
      // Check trick unlocks
      const newTricks = [...prev.tricks];
      TRICKS.forEach((t) => {
        if (newXp >= t.xpReq && !newTricks.includes(t.name)) {
          newTricks.push(t.name);
          showMsg(`🎓 ${prev.name} learned: ${t.name}!`);
        }
      });
      return {
        ...prev,
        happiness: clamp(prev.happiness + activity.happiness),
        energy: clamp(prev.energy + activity.energy),
        coins: prev.coins - activity.cost + Math.floor(activity.xp / 5),
        xp: newXp,
        level: Math.floor(newXp / XP_PER_LEVEL) + 1,
        tricks: newTricks,
      };
    });
  }, [showMsg]);

  const cleanPet = useCallback(() => {
    setPet((prev) => {
      if (!prev) return prev;
      setBounce(true); setTimeout(() => setBounce(false), 300);
      showMsg(`${prev.name} is squeaky clean! 🛁`);
      return {
        ...prev,
        cleanliness: 100,
        happiness: clamp(prev.happiness + 5),
        xp: prev.xp + 5,
        level: Math.floor((prev.xp + 5) / XP_PER_LEVEL) + 1,
      };
    });
  }, [showMsg]);

  const sleepPet = useCallback(() => {
    setPet((prev) => {
      if (!prev) return prev;
      showMsg(`${prev.name} takes a nap... 💤`);
      return {
        ...prev,
        energy: 100,
        health: clamp(prev.health + 10),
        xp: prev.xp + 2,
        level: Math.floor((prev.xp + 2) / XP_PER_LEVEL) + 1,
      };
    });
  }, [showMsg]);

  const healPet = useCallback(() => {
    setPet((prev) => {
      if (!prev) return prev;
      if (prev.coins < 30) { showMsg("Not enough coins for medicine! 💰"); return prev; }
      showMsg(`${prev.name} took medicine! 💊`);
      return { ...prev, health: 100, coins: prev.coins - 30 };
    });
  }, [showMsg]);

  const buyOutfit = useCallback((outfit: typeof OUTFITS[0]) => {
    if (ownedOutfits.has(outfit.id)) {
      setPet((prev) => prev ? { ...prev, outfit: prev.outfit === outfit.id ? null : outfit.id } : prev);
      return;
    }
    setPet((prev) => {
      if (!prev) return prev;
      if (prev.coins < outfit.cost) { showMsg("Not enough coins! 💰"); return prev; }
      setOwnedOutfits((o) => new Set([...o, outfit.id]));
      showMsg(`Bought ${outfit.name}! ${outfit.emoji}`);
      return { ...prev, coins: prev.coins - outfit.cost, outfit: outfit.id };
    });
  }, [ownedOutfits, showMsg]);

  const abandonPet = useCallback(() => {
    if (!window.confirm('Are you sure? Your pet will be gone forever! 😢')) return;
    setPet(null);
    setOwnedOutfits(new Set());
    setChoosing(true);
    localStorage.removeItem(SAVE_KEY);
  }, []);

  /* ─── Render ────────────────────────────────────────── */
  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-blue-950 flex items-center justify-center">
        <div className="text-purple-200 text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  /* ─── Choose pet ────────────────────────────────────── */
  if (choosing || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-blue-950 text-purple-100">
        <header className="px-4 py-3 border-b border-purple-800/40">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/games/" className="text-purple-400 hover:text-purple-300 text-sm">← Back to Games</Link>
            <h1 className="text-xl font-bold text-purple-200">🐾 Virtual Pet</h1>
            <div />
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-black text-purple-200 mb-2">Adopt a Pet!</h2>
          <p className="text-purple-300/70 mb-8">Choose a species and give it a name</p>

          {/* Species grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {SPECIES.map((sp, i) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpecies(i)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedSpecies === i
                    ? 'border-purple-400 bg-purple-800/40 scale-110'
                    : 'border-purple-800/40 bg-purple-900/20 hover:border-purple-600'
                }`}
              >
                <div className="text-3xl">{sp.emoji}</div>
                <div className="text-xs mt-1 text-purple-300">{sp.name}</div>
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Name your pet..."
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl bg-purple-900/40 border border-purple-700/50 text-purple-100 placeholder-purple-400/50 text-center text-lg mb-6 focus:outline-none focus:border-purple-400"
          />

          <button
            onClick={createPet}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95"
          >
            🥚 Adopt {SPECIES[selectedSpecies].name}!
          </button>
        </main>
      </div>
    );
  }

  /* ─── Main game ─────────────────────────────────────── */
  const sp = SPECIES.find((s) => s.id === pet.species) ?? SPECIES[0];
  const petEmoji = getEmoji(sp, pet.stage);
  const mood = getMood(pet);
  const outfit = OUTFITS.find((o) => o.id === pet.outfit);
  const xpProgress = ((pet.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  const StatBar = ({ label, value, emoji, color }: { label: string; value: number; emoji: string; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-purple-300/70">{emoji} {label}</span>
        <span className="font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 bg-purple-900/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-blue-950 text-purple-100 select-none">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-5 py-2.5 rounded-xl shadow-xl text-sm font-semibold animate-bounce">
          {message}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-purple-950/90 backdrop-blur border-b border-purple-800/40 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/games/" className="text-purple-400 hover:text-purple-300 text-sm">← Back</Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">{petEmoji}</span>
            <h1 className="text-lg font-bold text-purple-200">{pet.name}</h1>
            <span className="text-xs bg-purple-700/50 px-2 py-0.5 rounded-full">Lv.{pet.level}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 font-semibold text-sm">
            💰 {Math.floor(pet.coins)}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Pet Display */}
        <div className="text-center mb-4">
          <div className={`relative inline-block transition-transform duration-200 ${bounce ? 'scale-125' : ''}`}>
            <span className="text-[96px] leading-none">{petEmoji}</span>
            {outfit && <span className="absolute -top-2 -right-2 text-3xl">{outfit.emoji}</span>}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className={`text-sm font-semibold ${mood.color}`}>
              {mood.emoji} {mood.text}
            </span>
            <span className="text-purple-400/40">•</span>
            <span className="text-xs text-purple-400/60">{STAGE_NAMES[pet.stage]}</span>
            <span className="text-purple-400/40">•</span>
            <span className="text-xs text-purple-400/60">{Math.floor(pet.age)} min old</span>
          </div>
          {/* XP bar */}
          <div className="max-w-xs mx-auto mt-2">
            <div className="flex justify-between text-[10px] text-purple-400/60 mb-0.5">
              <span>Level {pet.level}</span>
              <span>{Math.floor(pet.xp % XP_PER_LEVEL)}/{XP_PER_LEVEL} XP</span>
            </div>
            <div className="h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Stat Bars */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatBar label="Hunger" value={pet.hunger} emoji="🍖" color="bg-orange-500" />
          <StatBar label="Happiness" value={pet.happiness} emoji="😊" color="bg-pink-500" />
          <StatBar label="Energy" value={pet.energy} emoji="⚡" color="bg-yellow-500" />
          <StatBar label="Clean" value={pet.cleanliness} emoji="✨" color="bg-cyan-500" />
          <StatBar label="Health" value={pet.health} emoji="❤️" color="bg-red-500" />
        </div>

        {/* Tricks */}
        {pet.tricks.length > 0 && (
          <div className="mb-4 text-center">
            <div className="text-xs text-purple-400/60 mb-1">🎓 Tricks learned:</div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {pet.tricks.map((t) => (
                <span key={t} className="text-xs bg-purple-800/40 px-2 py-0.5 rounded-full text-purple-300">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex border-b border-purple-800/40 mb-3">
          {(['feed', 'play', 'care', 'shop'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-purple-200 border-b-2 border-purple-400'
                  : 'text-purple-400/50 hover:text-purple-300'
              }`}
            >
              {tab === 'feed' ? '🍎' : tab === 'play' ? '🎾' : tab === 'care' ? '🛁' : '🛍️'} {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-2">
          {activeTab === 'feed' && FOODS.map((food) => (
            <button
              key={food.name}
              onClick={() => feedPet(food)}
              className="w-full text-left p-3 rounded-lg bg-purple-900/30 border border-purple-800/30 hover:bg-purple-800/40 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">{food.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-purple-200">{food.name}</div>
                <div className="text-xs text-purple-400/60">
                  🍖+{food.hunger} 😊+{food.happiness}
                </div>
              </div>
              {food.cost > 0 && <span className="text-amber-300 text-sm font-semibold">💰{food.cost}</span>}
              {food.cost === 0 && <span className="text-green-400 text-xs">Free</span>}
            </button>
          ))}

          {activeTab === 'play' && ACTIVITIES.map((act) => (
            <button
              key={act.name}
              onClick={() => playWith(act)}
              className="w-full text-left p-3 rounded-lg bg-purple-900/30 border border-purple-800/30 hover:bg-purple-800/40 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">{act.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-purple-200">{act.name}</div>
                <div className="text-xs text-purple-400/60">
                  😊+{act.happiness} ⚡{act.energy > 0 ? '+' : ''}{act.energy} ⭐+{act.xp}xp
                </div>
              </div>
              {act.cost > 0 && <span className="text-amber-300 text-sm font-semibold">💰{act.cost}</span>}
              {act.cost === 0 && <span className="text-green-400 text-xs">Free</span>}
            </button>
          ))}

          {activeTab === 'care' && (
            <div className="space-y-2">
              <button onClick={cleanPet} className="w-full text-left p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30 hover:bg-cyan-800/30 transition-all flex items-center gap-3">
                <span className="text-3xl">🛁</span>
                <div><div className="font-semibold text-cyan-200">Bath</div><div className="text-xs text-cyan-400/60">Clean your pet (✨ → 100%)</div></div>
                <span className="text-green-400 text-xs ml-auto">Free</span>
              </button>
              <button onClick={sleepPet} className="w-full text-left p-4 rounded-lg bg-indigo-900/20 border border-indigo-800/30 hover:bg-indigo-800/30 transition-all flex items-center gap-3">
                <span className="text-3xl">😴</span>
                <div><div className="font-semibold text-indigo-200">Nap</div><div className="text-xs text-indigo-400/60">Rest and recover energy (⚡ → 100%)</div></div>
                <span className="text-green-400 text-xs ml-auto">Free</span>
              </button>
              <button onClick={healPet} className="w-full text-left p-4 rounded-lg bg-red-900/20 border border-red-800/30 hover:bg-red-800/30 transition-all flex items-center gap-3">
                <span className="text-3xl">💊</span>
                <div><div className="font-semibold text-red-200">Medicine</div><div className="text-xs text-red-400/60">Heal your pet (❤️ → 100%)</div></div>
                <span className="text-amber-300 text-sm font-semibold ml-auto">💰30</span>
              </button>
              <button onClick={abandonPet} className="w-full text-left p-4 rounded-lg bg-gray-900/20 border border-gray-800/30 hover:bg-gray-800/30 transition-all flex items-center gap-3 mt-6 opacity-50 hover:opacity-100">
                <span className="text-3xl">💔</span>
                <div><div className="font-semibold text-gray-300">Release Pet</div><div className="text-xs text-gray-400/60">Say goodbye forever...</div></div>
              </button>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="space-y-2">
              <div className="text-xs text-purple-400/60 mb-2">🎽 Outfits — tap to buy or equip/unequip</div>
              {OUTFITS.map((o) => {
                const owned = ownedOutfits.has(o.id);
                const equipped = pet.outfit === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => buyOutfit(o)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                      equipped
                        ? 'bg-purple-700/40 border-purple-500/50'
                        : owned
                        ? 'bg-purple-900/20 border-purple-800/30 hover:bg-purple-800/30'
                        : 'bg-purple-900/30 border-purple-800/30 hover:bg-purple-800/40'
                    }`}
                  >
                    <span className="text-2xl">{o.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-200">{o.name}</div>
                    </div>
                    {equipped && <span className="text-green-400 text-xs font-semibold">Equipped ✓</span>}
                    {owned && !equipped && <span className="text-purple-300 text-xs">Tap to equip</span>}
                    {!owned && <span className="text-amber-300 text-sm font-semibold">💰{o.cost}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SEO Content */}
        <section className="mt-12 prose prose-invert prose-purple max-w-3xl mx-auto text-purple-300/70 text-sm">
          <h2 className="text-purple-200 text-xl">🐾 Virtual Pet - Free Online Tamagotchi Game</h2>
          <p>
            Adopt your very own virtual pet! Choose from cats, dogs, bunnies, bears, penguins, dragons,
            foxes, and pandas. Feed them, play with them, keep them clean, and watch them grow from an
            egg to a full adult.
          </p>
          <h3 className="text-purple-200">How to Play</h3>
          <ul>
            <li><strong>Feed</strong> your pet to keep it happy and full</li>
            <li><strong>Play</strong> games and activities to earn XP and coins</li>
            <li><strong>Care</strong> for your pet with baths, naps, and medicine</li>
            <li><strong>Shop</strong> for cute outfits and accessories</li>
            <li>Watch your pet <strong>evolve</strong> through 5 life stages!</li>
            <li>Your pet is <strong>saved automatically</strong> — come back anytime!</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
