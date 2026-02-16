'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ─── Types ───────────────────────────────────────────────────── */

interface Building {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  baseCps: number; // cookies per second
  description: string;
  owned: number;
}

interface Upgrade {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  multiplier: number;
  target: string; // building id or 'click'
  purchased: boolean;
  requirement: { type: 'building' | 'cookies'; id?: string; amount: number };
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  opacity: number;
}

/* ─── Data ────────────────────────────────────────────────────── */

const INITIAL_BUILDINGS: Building[] = [
  { id: 'cursor', name: 'Cursor', emoji: '👆', baseCost: 15, baseCps: 0.1, description: 'Autoclicks once every 10 seconds', owned: 0 },
  { id: 'grandma', name: 'Grandma', emoji: '👵', baseCost: 100, baseCps: 1, description: 'A nice grandma to bake more cookies', owned: 0 },
  { id: 'farm', name: 'Farm', emoji: '🌾', baseCost: 1_100, baseCps: 8, description: 'Grows cookie plants from cookie seeds', owned: 0 },
  { id: 'mine', name: 'Mine', emoji: '⛏️', baseCost: 12_000, baseCps: 47, description: 'Mines out cookie dough and chips', owned: 0 },
  { id: 'factory', name: 'Factory', emoji: '🏭', baseCost: 130_000, baseCps: 260, description: 'Produces large quantities of cookies', owned: 0 },
  { id: 'bank', name: 'Bank', emoji: '🏦', baseCost: 1_400_000, baseCps: 1_400, description: 'Generates cookies from sheer interest', owned: 0 },
  { id: 'temple', name: 'Temple', emoji: '⛪', baseCost: 20_000_000, baseCps: 7_800, description: 'Full of praying grannies. Generates cookies', owned: 0 },
  { id: 'wizard', name: 'Wizard Tower', emoji: '🧙', baseCost: 330_000_000, baseCps: 44_000, description: 'Summons cookies with magic spells', owned: 0 },
  { id: 'shipment', name: 'Shipment', emoji: '🚀', baseCost: 5_100_000_000, baseCps: 260_000, description: 'Brings in cookies from the cookie planet', owned: 0 },
  { id: 'alchemy', name: 'Alchemy Lab', emoji: '⚗️', baseCost: 75_000_000_000, baseCps: 1_600_000, description: 'Turns gold into cookies!', owned: 0 },
  { id: 'portal', name: 'Portal', emoji: '🌀', baseCost: 1_000_000_000_000, baseCps: 10_000_000, description: 'Opens a door to the cookieverse', owned: 0 },
  { id: 'timemachine', name: 'Time Machine', emoji: '⏰', baseCost: 14_000_000_000_000, baseCps: 65_000_000, description: 'Brings cookies from the past', owned: 0 },
];

const INITIAL_UPGRADES: Upgrade[] = [
  // Click upgrades
  { id: 'click1', name: 'Reinforced Index Finger', emoji: '☝️', cost: 100, description: 'Mouse clicks gain +1 cookie', multiplier: 2, target: 'click', purchased: false, requirement: { type: 'building', id: 'cursor', amount: 1 } },
  { id: 'click2', name: 'Carpal Tunnel Prevention', emoji: '🖐️', cost: 500, description: 'Mouse clicks are twice as efficient', multiplier: 2, target: 'click', purchased: false, requirement: { type: 'building', id: 'cursor', amount: 1 } },
  { id: 'click3', name: 'Ambidextrous', emoji: '👐', cost: 10_000, description: 'Mouse clicks are twice as efficient', multiplier: 2, target: 'click', purchased: false, requirement: { type: 'cookies', amount: 1_000 } },
  // Cursor upgrades
  { id: 'cursor1', name: 'Thousand Fingers', emoji: '🖱️', cost: 500, description: 'Cursors are twice as efficient', multiplier: 2, target: 'cursor', purchased: false, requirement: { type: 'building', id: 'cursor', amount: 1 } },
  { id: 'cursor2', name: 'Million Fingers', emoji: '🖲️', cost: 5_000, description: 'Cursors are twice as efficient', multiplier: 2, target: 'cursor', purchased: false, requirement: { type: 'building', id: 'cursor', amount: 5 } },
  // Grandma upgrades
  { id: 'grandma1', name: 'Forwards from Grandma', emoji: '📧', cost: 1_000, description: 'Grandmas are twice as efficient', multiplier: 2, target: 'grandma', purchased: false, requirement: { type: 'building', id: 'grandma', amount: 1 } },
  { id: 'grandma2', name: 'Steel-plated Rolling Pins', emoji: '🪵', cost: 5_000, description: 'Grandmas are twice as efficient', multiplier: 2, target: 'grandma', purchased: false, requirement: { type: 'building', id: 'grandma', amount: 5 } },
  { id: 'grandma3', name: 'Lubricated Dentures', emoji: '🦷', cost: 50_000, description: 'Grandmas are twice as efficient', multiplier: 2, target: 'grandma', purchased: false, requirement: { type: 'building', id: 'grandma', amount: 25 } },
  // Farm upgrades
  { id: 'farm1', name: 'Cheap Hoes', emoji: '🌱', cost: 11_000, description: 'Farms are twice as efficient', multiplier: 2, target: 'farm', purchased: false, requirement: { type: 'building', id: 'farm', amount: 1 } },
  { id: 'farm2', name: 'Fertilizer', emoji: '💩', cost: 55_000, description: 'Farms are twice as efficient', multiplier: 2, target: 'farm', purchased: false, requirement: { type: 'building', id: 'farm', amount: 5 } },
  // Mine upgrades
  { id: 'mine1', name: 'Sugar Gas', emoji: '💨', cost: 120_000, description: 'Mines are twice as efficient', multiplier: 2, target: 'mine', purchased: false, requirement: { type: 'building', id: 'mine', amount: 1 } },
  { id: 'mine2', name: 'Megadrill', emoji: '🔩', cost: 600_000, description: 'Mines are twice as efficient', multiplier: 2, target: 'mine', purchased: false, requirement: { type: 'building', id: 'mine', amount: 5 } },
  // Factory upgrades
  { id: 'factory1', name: 'Sturdier Conveyor Belts', emoji: '🔧', cost: 1_300_000, description: 'Factories are twice as efficient', multiplier: 2, target: 'factory', purchased: false, requirement: { type: 'building', id: 'factory', amount: 1 } },
  { id: 'factory2', name: 'Child Labor', emoji: '👷', cost: 6_500_000, description: 'Factories are twice as efficient', multiplier: 2, target: 'factory', purchased: false, requirement: { type: 'building', id: 'factory', amount: 5 } },
  // Bank upgrades
  { id: 'bank1', name: 'Taller Tellers', emoji: '🧑‍💼', cost: 14_000_000, description: 'Banks are twice as efficient', multiplier: 2, target: 'bank', purchased: false, requirement: { type: 'building', id: 'bank', amount: 1 } },
  // Global multipliers
  { id: 'global1', name: 'Kitten Helpers', emoji: '🐱', cost: 900_000, description: 'Milk+10% CpS per achievement', multiplier: 1.5, target: 'all', purchased: false, requirement: { type: 'cookies', amount: 500_000 } },
  { id: 'global2', name: 'Lucky Day', emoji: '🍀', cost: 7_777_777, description: 'All production +25%', multiplier: 1.25, target: 'all', purchased: false, requirement: { type: 'cookies', amount: 7_777_777 } },
];

/* ─── Utility ─────────────────────────────────────────────────── */

function formatNumber(n: number): string {
  if (n >= 1e15) return (n / 1e15).toFixed(1) + ' quadrillion';
  if (n >= 1e12) return (n / 1e12).toFixed(1) + ' trillion';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' billion';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' million';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'k';
  if (n >= 10) return Math.floor(n).toLocaleString();
  if (n >= 1) return n.toFixed(1);
  return n.toFixed(2);
}

function getBuildingCost(base: number, owned: number) {
  return Math.ceil(base * Math.pow(1.15, owned));
}

const SAVE_KEY = 'onde_cookie_clicker_v1';

interface SaveData {
  cookies: number;
  totalBaked: number;
  buildings: { id: string; owned: number }[];
  upgrades: string[];
  startTime: number;
}

/* ─── Achievements ─────────────────────────────────────────────── */

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (state: { cookies: number; totalBaked: number; cps: number; buildings: Building[]; clicks: number }) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'First Cookie', emoji: '🍪', description: 'Bake your first cookie', check: (s) => s.totalBaked >= 1 },
  { id: 'baker', name: 'Baker', emoji: '👨‍🍳', description: 'Bake 100 cookies', check: (s) => s.totalBaked >= 100 },
  { id: 'confectioner', name: 'Confectioner', emoji: '🧁', description: 'Bake 10,000 cookies', check: (s) => s.totalBaked >= 10_000 },
  { id: 'fortune', name: 'Fortune', emoji: '💰', description: 'Bake 1 million cookies', check: (s) => s.totalBaked >= 1_000_000 },
  { id: 'mass', name: 'Mass Production', emoji: '🏭', description: 'Bake 1 billion cookies', check: (s) => s.totalBaked >= 1_000_000_000 },
  { id: 'clicker', name: 'Click Frenzy', emoji: '🖱️', description: 'Click 100 times', check: (s) => s.clicks >= 100 },
  { id: 'megaclick', name: 'Mega Clicker', emoji: '⚡', description: 'Click 1,000 times', check: (s) => s.clicks >= 1_000 },
  { id: 'builder', name: 'Builder', emoji: '🏗️', description: 'Own 10 buildings total', check: (s) => s.buildings.reduce((a, b) => a + b.owned, 0) >= 10 },
  { id: 'tycoon', name: 'Cookie Tycoon', emoji: '👑', description: 'Reach 100 CpS', check: (s) => s.cps >= 100 },
  { id: 'mogul', name: 'Cookie Mogul', emoji: '🎩', description: 'Reach 10,000 CpS', check: (s) => s.cps >= 10_000 },
  { id: 'grandmaArmy', name: 'Grandma Army', emoji: '👵', description: 'Own 10 grandmas', check: (s) => (s.buildings.find((b) => b.id === 'grandma')?.owned ?? 0) >= 10 },
  { id: 'factoryEmpire', name: 'Factory Empire', emoji: '🏭', description: 'Own 5 factories', check: (s) => (s.buildings.find((b) => b.id === 'factory')?.owned ?? 0) >= 5 },
];

/* ─── Component ───────────────────────────────────────────────── */

export default function CookieClickerPage() {
  const [cookies, setCookies] = useState(0);
  const [totalBaked, setTotalBaked] = useState(0);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS.map((b) => ({ ...b })));
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES.map((u) => ({ ...u })));
  const [clickPower, setClickPower] = useState(1);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [cookieScale, setCookieScale] = useState(1);
  const [totalClicks, setTotalClicks] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState<'buildings' | 'upgrades' | 'achievements'>('buildings');
  const [loaded, setLoaded] = useState(false);
  const floatIdRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── CPS calculation ──────────────────────────────────────── */
  const calculateCps = useCallback(() => {
    let globalMult = 1;
    upgrades.forEach((u) => {
      if (u.purchased && u.target === 'all') {
        globalMult *= u.multiplier;
      }
    });

    let cps = 0;
    buildings.forEach((b) => {
      if (b.owned === 0) return;
      let mult = 1;
      upgrades.forEach((u) => {
        if (u.purchased && u.target === b.id) {
          mult *= u.multiplier;
        }
      });
      cps += b.owned * b.baseCps * mult;
    });
    return cps * globalMult;
  }, [buildings, upgrades]);

  const cps = calculateCps();

  /* ─── Calculate click power ─────────────────────────────────── */
  useEffect(() => {
    let power = 1;
    upgrades.forEach((u) => {
      if (u.purchased && u.target === 'click') {
        power *= u.multiplier;
      }
    });
    setClickPower(power);
  }, [upgrades]);

  /* ─── Tick (produce cookies) ────────────────────────────────── */
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const produced = cps / 20; // 50ms tick
      if (produced > 0) {
        setCookies((c) => c + produced);
        setTotalBaked((t) => t + produced);
      }
    }, 50);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [cps]);

  /* ─── Save / Load ──────────────────────────────────────────── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data: SaveData = JSON.parse(raw);
        setCookies(data.cookies ?? 0);
        setTotalBaked(data.totalBaked ?? 0);
        if (data.buildings) {
          setBuildings((prev) =>
            prev.map((b) => {
              const saved = data.buildings.find((s) => s.id === b.id);
              return saved ? { ...b, owned: saved.owned } : b;
            })
          );
        }
        if (data.upgrades) {
          setUpgrades((prev) =>
            prev.map((u) => (data.upgrades.includes(u.id) ? { ...u, purchased: true } : u))
          );
        }
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveRef.current) clearInterval(saveRef.current);
    saveRef.current = setInterval(() => {
      const data: SaveData = {
        cookies,
        totalBaked,
        buildings: buildings.map((b) => ({ id: b.id, owned: b.owned })),
        upgrades: upgrades.filter((u) => u.purchased).map((u) => u.id),
        startTime: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }, 5000);
    return () => { if (saveRef.current) clearInterval(saveRef.current); };
  }, [loaded, cookies, totalBaked, buildings, upgrades]);

  /* ─── Achievement Checking ──────────────────────────────────── */
  useEffect(() => {
    const state = { cookies, totalBaked, cps, buildings, clicks: totalClicks };
    ACHIEVEMENTS.forEach((a) => {
      if (!unlockedAchievements.has(a.id) && a.check(state)) {
        setUnlockedAchievements((prev) => new Set([...prev, a.id]));
        setShowAchievement(a);
        setTimeout(() => setShowAchievement(null), 3000);
      }
    });
  }, [cookies, totalBaked, cps, buildings, totalClicks, unlockedAchievements]);

  /* ─── Click handler ────────────────────────────────────────── */
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const amount = clickPower;
      setCookies((c) => c + amount);
      setTotalBaked((t) => t + amount);
      setTotalClicks((c) => c + 1);

      // cookie bounce
      setCookieScale(1.12);
      setTimeout(() => setCookieScale(1), 80);

      // floating text
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left + (Math.random() - 0.5) * 40;
      const y = e.clientY - rect.top - 20;
      const id = floatIdRef.current++;
      setFloatingTexts((prev) => [...prev.slice(-8), { id, x, y, text: `+${formatNumber(amount)}`, opacity: 1 }]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((f) => f.id !== id));
      }, 800);
    },
    [clickPower]
  );

  /* ─── Buy building ──────────────────────────────────────────── */
  const buyBuilding = useCallback(
    (buildingId: string) => {
      setBuildings((prev) => {
        const b = prev.find((x) => x.id === buildingId);
        if (!b) return prev;
        const cost = getBuildingCost(b.baseCost, b.owned);
        if (cookies < cost) return prev;
        setCookies((c) => c - cost);
        return prev.map((x) => (x.id === buildingId ? { ...x, owned: x.owned + 1 } : x));
      });
    },
    [cookies]
  );

  /* ─── Buy upgrade ───────────────────────────────────────────── */
  const buyUpgrade = useCallback(
    (upgradeId: string) => {
      setUpgrades((prev) => {
        const u = prev.find((x) => x.id === upgradeId);
        if (!u || u.purchased || cookies < u.cost) return prev;
        setCookies((c) => c - u.cost);
        return prev.map((x) => (x.id === upgradeId ? { ...x, purchased: true } : x));
      });
    },
    [cookies]
  );

  /* ─── Check upgrade requirement ─────────────────────────────── */
  const isUpgradeAvailable = useCallback(
    (u: Upgrade) => {
      if (u.purchased) return false;
      if (u.requirement.type === 'building') {
        const b = buildings.find((x) => x.id === u.requirement.id);
        return b ? b.owned >= u.requirement.amount : false;
      }
      return totalBaked >= u.requirement.amount;
    },
    [buildings, totalBaked]
  );

  const availableUpgrades = upgrades.filter(isUpgradeAvailable);
  const purchasedUpgrades = upgrades.filter((u) => u.purchased);

  /* ─── Reset ─────────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    if (!window.confirm('Are you sure? This will reset ALL your progress!')) return;
    setCookies(0);
    setTotalBaked(0);
    setTotalClicks(0);
    setBuildings(INITIAL_BUILDINGS.map((b) => ({ ...b })));
    setUpgrades(INITIAL_UPGRADES.map((u) => ({ ...u })));
    setUnlockedAchievements(new Set());
    localStorage.removeItem(SAVE_KEY);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 via-amber-900 to-yellow-900 flex items-center justify-center">
        <div className="text-amber-200 text-2xl animate-pulse">Loading cookies...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-amber-900 to-yellow-900 text-amber-100 select-none">
      {/* Achievement Toast */}
      {showAchievement && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-amber-950 px-6 py-3 rounded-xl shadow-2xl animate-bounce font-bold text-lg flex items-center gap-2">
          <span className="text-2xl">{showAchievement.emoji}</span>
          Achievement: {showAchievement.name}!
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-amber-950/90 backdrop-blur border-b border-amber-800/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/games/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Games
          </Link>
          <h1 className="text-xl font-bold text-amber-200">🍪 Cookie Clicker</h1>
          <button
            onClick={handleReset}
            className="text-xs text-amber-500/60 hover:text-red-400 transition-colors"
            title="Reset all progress"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Cookie Counter */}
        <div className="text-center mb-6">
          <div className="text-5xl sm:text-6xl font-black text-amber-200 tabular-nums">
            {formatNumber(cookies)}
          </div>
          <div className="text-amber-400/80 text-lg mt-1">cookies</div>
          <div className="text-amber-500/60 text-sm mt-1">
            per second: <span className="text-amber-300 font-semibold">{formatNumber(cps)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Left: Cookie + Stats */}
          <div className="flex flex-col items-center gap-6">
            {/* Big Cookie */}
            <div className="relative" style={{ width: 240, height: 240 }}>
              {/* Floating texts */}
              {floatingTexts.map((ft) => (
                <div
                  key={ft.id}
                  className="absolute pointer-events-none text-amber-200 font-bold text-xl animate-float-up"
                  style={{ left: ft.x, top: ft.y }}
                >
                  {ft.text}
                </div>
              ))}
              <button
                onClick={handleClick}
                className="w-full h-full rounded-full text-[120px] leading-none flex items-center justify-center cursor-pointer transition-transform duration-75 hover:brightness-110 active:scale-95 focus:outline-none"
                style={{ transform: `scale(${cookieScale})` }}
                aria-label="Click to bake cookies"
              >
                🍪
              </button>
            </div>

            {/* Stats Card */}
            <div className="w-full bg-amber-900/40 border border-amber-800/40 rounded-xl p-4 text-sm space-y-2">
              <h3 className="font-bold text-amber-300 text-base mb-2">📊 Stats</h3>
              <div className="flex justify-between"><span className="text-amber-400/70">Total Baked</span><span className="font-semibold">{formatNumber(totalBaked)}</span></div>
              <div className="flex justify-between"><span className="text-amber-400/70">Cookies/click</span><span className="font-semibold">{formatNumber(clickPower)}</span></div>
              <div className="flex justify-between"><span className="text-amber-400/70">Cookies/sec</span><span className="font-semibold">{formatNumber(cps)}</span></div>
              <div className="flex justify-between"><span className="text-amber-400/70">Total Clicks</span><span className="font-semibold">{totalClicks.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-amber-400/70">Buildings</span><span className="font-semibold">{buildings.reduce((a, b) => a + b.owned, 0)}</span></div>
              <div className="flex justify-between"><span className="text-amber-400/70">Upgrades</span><span className="font-semibold">{purchasedUpgrades.length}/{upgrades.length}</span></div>
              <div className="flex justify-between"><span className="text-amber-400/70">Achievements</span><span className="font-semibold">{unlockedAchievements.size}/{ACHIEVEMENTS.length}</span></div>
            </div>
          </div>

          {/* Right: Shop */}
          <div className="bg-amber-900/30 border border-amber-800/40 rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-amber-800/40">
              {(['buildings', 'upgrades', 'achievements'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-amber-800/40 text-amber-200 border-b-2 border-amber-400'
                      : 'text-amber-400/60 hover:text-amber-300'
                  }`}
                >
                  {tab === 'buildings' ? '🏗️ ' : tab === 'upgrades' ? '⬆️ ' : '🏆 '}
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-3 max-h-[500px] overflow-y-auto space-y-2">
              {activeTab === 'buildings' &&
                buildings.map((b) => {
                  const cost = getBuildingCost(b.baseCost, b.owned);
                  const canAfford = cookies >= cost;
                  return (
                    <button
                      key={b.id}
                      onClick={() => buyBuilding(b.id)}
                      disabled={!canAfford}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        canAfford
                          ? 'bg-amber-800/30 border-amber-700/50 hover:bg-amber-800/50 hover:border-amber-600 cursor-pointer'
                          : 'bg-amber-900/20 border-amber-900/30 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl shrink-0">{b.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-semibold text-amber-200 truncate">{b.name}</div>
                            <div className="text-xs text-amber-400/60 truncate">{b.description}</div>
                            <div className="text-xs text-amber-300/80 mt-0.5">
                              🍪 {formatNumber(cost)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black text-amber-300">{b.owned}</div>
                          <div className="text-[10px] text-amber-400/50">
                            {formatNumber(b.baseCps * b.owned)}/s
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

              {activeTab === 'upgrades' && (
                <>
                  {availableUpgrades.length === 0 && purchasedUpgrades.length === 0 && (
                    <div className="text-center text-amber-400/50 py-8">
                      Buy buildings to unlock upgrades!
                    </div>
                  )}
                  {availableUpgrades.map((u) => {
                    const canAfford = cookies >= u.cost;
                    return (
                      <button
                        key={u.id}
                        onClick={() => buyUpgrade(u.id)}
                        disabled={!canAfford}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          canAfford
                            ? 'bg-green-900/30 border-green-700/50 hover:bg-green-800/40 cursor-pointer'
                            : 'bg-amber-900/20 border-amber-900/30 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl shrink-0">{u.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-semibold text-amber-200 truncate">{u.name}</div>
                            <div className="text-xs text-amber-400/60 truncate">{u.description}</div>
                            <div className="text-xs text-green-400/80 mt-0.5">
                              🍪 {formatNumber(u.cost)}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {purchasedUpgrades.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-amber-800/30">
                      <div className="text-xs text-amber-400/40 mb-2">Purchased ({purchasedUpgrades.length})</div>
                      <div className="flex flex-wrap gap-2">
                        {purchasedUpgrades.map((u) => (
                          <div
                            key={u.id}
                            className="w-9 h-9 bg-amber-800/30 rounded-lg flex items-center justify-center text-lg"
                            title={u.name}
                          >
                            {u.emoji}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-2">
                  {ACHIEVEMENTS.map((a) => {
                    const unlocked = unlockedAchievements.has(a.id);
                    return (
                      <div
                        key={a.id}
                        className={`p-3 rounded-lg border ${
                          unlocked
                            ? 'bg-yellow-900/30 border-yellow-700/50'
                            : 'bg-amber-900/10 border-amber-900/20 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{unlocked ? a.emoji : '❓'}</span>
                          <div>
                            <div className="font-semibold text-amber-200">
                              {unlocked ? a.name : '???'}
                            </div>
                            <div className="text-xs text-amber-400/60">{a.description}</div>
                          </div>
                          {unlocked && <span className="ml-auto text-yellow-400">✅</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <section className="mt-12 prose prose-invert prose-amber max-w-3xl mx-auto text-amber-300/70 text-sm">
          <h2 className="text-amber-200 text-xl">🍪 Cookie Clicker - Free Online Idle Game</h2>
          <p>
            Welcome to Cookie Clicker, the classic idle clicker game! Click the big cookie to start baking,
            then spend your cookies on buildings and upgrades to automate production. From humble cursors
            to mighty wizard towers and time machines, build your cookie empire!
          </p>
          <h3 className="text-amber-200">How to Play</h3>
          <ul>
            <li><strong>Click the cookie</strong> to bake cookies manually</li>
            <li><strong>Buy buildings</strong> like grandmas, farms, and factories to produce cookies automatically</li>
            <li><strong>Purchase upgrades</strong> to multiply your production</li>
            <li><strong>Unlock achievements</strong> for reaching milestones</li>
            <li>Your progress is <strong>saved automatically</strong> every 5 seconds</li>
          </ul>
          <h3 className="text-amber-200">Tips</h3>
          <p>
            Early on, focus on clicking and buying cursors. Once you can afford grandmas, they&apos;ll
            start producing cookies for you even when you&apos;re not clicking. Keep buying buildings and
            upgrades to grow exponentially. Don&apos;t forget to check the upgrades tab — doubling your
            production is always worth it!
          </p>
        </section>
      </main>

      {/* Float animation */}
      <style jsx global>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
