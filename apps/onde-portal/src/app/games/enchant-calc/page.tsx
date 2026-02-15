'use client';

import { useState, useMemo, useCallback } from 'react';

// ─── Item Types ───
type ItemType =
  | 'sword'
  | 'axe'
  | 'pickaxe'
  | 'shovel'
  | 'hoe'
  | 'bow'
  | 'crossbow'
  | 'trident'
  | 'helmet'
  | 'chestplate'
  | 'leggings'
  | 'boots'
  | 'shield'
  | 'fishing_rod'
  | 'elytra'
  | 'mace';

interface ItemDef {
  id: ItemType;
  name: string;
  emoji: string;
}

const ITEMS: ItemDef[] = [
  { id: 'sword', name: 'Sword', emoji: '⚔️' },
  { id: 'axe', name: 'Axe', emoji: '🪓' },
  { id: 'pickaxe', name: 'Pickaxe', emoji: '⛏️' },
  { id: 'shovel', name: 'Shovel', emoji: '🪏' },
  { id: 'hoe', name: 'Hoe', emoji: '🌾' },
  { id: 'bow', name: 'Bow', emoji: '🏹' },
  { id: 'crossbow', name: 'Crossbow', emoji: '🎯' },
  { id: 'trident', name: 'Trident', emoji: '🔱' },
  { id: 'helmet', name: 'Helmet', emoji: '⛑️' },
  { id: 'chestplate', name: 'Chestplate', emoji: '🛡️' },
  { id: 'leggings', name: 'Leggings', emoji: '👖' },
  { id: 'boots', name: 'Boots', emoji: '👢' },
  { id: 'shield', name: 'Shield', emoji: '🛡️' },
  { id: 'fishing_rod', name: 'Fishing Rod', emoji: '🎣' },
  { id: 'elytra', name: 'Elytra', emoji: '🪽' },
  { id: 'mace', name: 'Mace', emoji: '🔨' },
];

// ─── Enchantment Database ───
interface Enchantment {
  id: string;
  name: string;
  maxLevel: number;
  description: string;
  items: ItemType[];
  conflicts: string[]; // ids of conflicting enchantments
  multiplier: number; // anvil cost multiplier per level
  treasure: boolean; // treasure-only enchantment
}

const ENCHANTMENTS: Enchantment[] = [
  // ─── Sword ───
  { id: 'sharpness', name: 'Sharpness', maxLevel: 5, description: 'Increases melee damage', items: ['sword', 'axe'], conflicts: ['smite', 'bane_of_arthropods', 'density', 'breach'], multiplier: 1, treasure: false },
  { id: 'smite', name: 'Smite', maxLevel: 5, description: 'Extra damage to undead mobs (zombies, skeletons, withers)', items: ['sword', 'axe'], conflicts: ['sharpness', 'bane_of_arthropods', 'density', 'breach'], multiplier: 1, treasure: false },
  { id: 'bane_of_arthropods', name: 'Bane of Arthropods', maxLevel: 5, description: 'Extra damage to spiders, silverfish, and bees', items: ['sword', 'axe'], conflicts: ['sharpness', 'smite', 'density', 'breach'], multiplier: 1, treasure: false },
  { id: 'knockback', name: 'Knockback', maxLevel: 2, description: 'Increases knockback dealt to enemies', items: ['sword'], conflicts: [], multiplier: 1, treasure: false },
  { id: 'fire_aspect', name: 'Fire Aspect', maxLevel: 2, description: 'Sets targets on fire when hit', items: ['sword'], conflicts: [], multiplier: 2, treasure: false },
  { id: 'looting', name: 'Looting', maxLevel: 3, description: 'Mobs drop more loot', items: ['sword'], conflicts: [], multiplier: 2, treasure: false },
  { id: 'sweeping_edge', name: 'Sweeping Edge', maxLevel: 3, description: 'Increases sweep attack damage (Java only)', items: ['sword'], conflicts: [], multiplier: 2, treasure: false },

  // ─── Tool (Pickaxe / Axe / Shovel / Hoe) ───
  { id: 'efficiency', name: 'Efficiency', maxLevel: 5, description: 'Increases mining speed', items: ['pickaxe', 'axe', 'shovel', 'hoe'], conflicts: [], multiplier: 1, treasure: false },
  { id: 'fortune', name: 'Fortune', maxLevel: 3, description: 'Increases block drops (ores, crops)', items: ['pickaxe', 'axe', 'shovel', 'hoe'], conflicts: ['silk_touch'], multiplier: 2, treasure: false },
  { id: 'silk_touch', name: 'Silk Touch', maxLevel: 1, description: 'Mined blocks drop themselves (grass, ice, ores)', items: ['pickaxe', 'axe', 'shovel', 'hoe'], conflicts: ['fortune'], multiplier: 4, treasure: false },

  // ─── Bow ───
  { id: 'power', name: 'Power', maxLevel: 5, description: 'Increases arrow damage', items: ['bow'], conflicts: [], multiplier: 1, treasure: false },
  { id: 'punch', name: 'Punch', maxLevel: 2, description: 'Increases arrow knockback', items: ['bow'], conflicts: [], multiplier: 2, treasure: false },
  { id: 'flame', name: 'Flame', maxLevel: 1, description: 'Arrows set targets on fire', items: ['bow'], conflicts: [], multiplier: 2, treasure: false },
  { id: 'infinity', name: 'Infinity', maxLevel: 1, description: 'Shooting consumes no arrows (need 1 arrow)', items: ['bow'], conflicts: ['mending'], multiplier: 4, treasure: false },

  // ─── Crossbow ───
  { id: 'quick_charge', name: 'Quick Charge', maxLevel: 3, description: 'Decreases crossbow reload time', items: ['crossbow'], conflicts: [], multiplier: 1, treasure: false },
  { id: 'multishot', name: 'Multishot', maxLevel: 1, description: 'Fires 3 arrows at once (uses 1 arrow)', items: ['crossbow'], conflicts: ['piercing'], multiplier: 2, treasure: false },
  { id: 'piercing', name: 'Piercing', maxLevel: 4, description: 'Arrows pass through multiple entities', items: ['crossbow'], conflicts: ['multishot'], multiplier: 1, treasure: false },

  // ─── Trident ───
  { id: 'loyalty', name: 'Loyalty', maxLevel: 3, description: 'Trident returns after being thrown', items: ['trident'], conflicts: ['riptide'], multiplier: 1, treasure: false },
  { id: 'impaling', name: 'Impaling', maxLevel: 5, description: 'Extra damage to aquatic mobs (or mobs in water on Bedrock)', items: ['trident'], conflicts: [], multiplier: 2, treasure: false },
  { id: 'riptide', name: 'Riptide', maxLevel: 3, description: 'Launches player when thrown in water or rain', items: ['trident'], conflicts: ['loyalty', 'channeling'], multiplier: 2, treasure: false },
  { id: 'channeling', name: 'Channeling', maxLevel: 1, description: 'Summons a lightning bolt on hit during thunderstorms', items: ['trident'], conflicts: ['riptide'], multiplier: 4, treasure: false },

  // ─── Armor (All) ───
  { id: 'protection', name: 'Protection', maxLevel: 4, description: 'Reduces all damage taken', items: ['helmet', 'chestplate', 'leggings', 'boots'], conflicts: ['blast_protection', 'fire_protection', 'projectile_protection'], multiplier: 1, treasure: false },
  { id: 'fire_protection', name: 'Fire Protection', maxLevel: 4, description: 'Reduces fire and lava damage, reduces burn time', items: ['helmet', 'chestplate', 'leggings', 'boots'], conflicts: ['protection', 'blast_protection', 'projectile_protection'], multiplier: 1, treasure: false },
  { id: 'blast_protection', name: 'Blast Protection', maxLevel: 4, description: 'Reduces explosion damage and knockback', items: ['helmet', 'chestplate', 'leggings', 'boots'], conflicts: ['protection', 'fire_protection', 'projectile_protection'], multiplier: 2, treasure: false },
  { id: 'projectile_protection', name: 'Projectile Protection', maxLevel: 4, description: 'Reduces damage from arrows, fireballs, etc.', items: ['helmet', 'chestplate', 'leggings', 'boots'], conflicts: ['protection', 'fire_protection', 'blast_protection'], multiplier: 1, treasure: false },
  { id: 'thorns', name: 'Thorns', maxLevel: 3, description: 'Reflects damage back to attackers (costs durability)', items: ['helmet', 'chestplate', 'leggings', 'boots'], conflicts: [], multiplier: 4, treasure: false },

  // ─── Helmet ───
  { id: 'aqua_affinity', name: 'Aqua Affinity', maxLevel: 1, description: 'Increases underwater mining speed', items: ['helmet'], conflicts: [], multiplier: 2, treasure: false },
  { id: 'respiration', name: 'Respiration', maxLevel: 3, description: 'Extends underwater breathing time', items: ['helmet'], conflicts: [], multiplier: 2, treasure: false },

  // ─── Boots ───
  { id: 'feather_falling', name: 'Feather Falling', maxLevel: 4, description: 'Reduces fall damage', items: ['boots'], conflicts: [], multiplier: 1, treasure: false },
  { id: 'depth_strider', name: 'Depth Strider', maxLevel: 3, description: 'Increases underwater movement speed', items: ['boots'], conflicts: ['frost_walker'], multiplier: 2, treasure: false },
  { id: 'frost_walker', name: 'Frost Walker', maxLevel: 2, description: 'Turns water under feet into frosted ice', items: ['boots'], conflicts: ['depth_strider'], multiplier: 2, treasure: true },
  { id: 'soul_speed', name: 'Soul Speed', maxLevel: 3, description: 'Increases speed on soul sand and soul soil', items: ['boots'], conflicts: [], multiplier: 4, treasure: true },
  { id: 'swift_sneak', name: 'Swift Sneak', maxLevel: 3, description: 'Increases sneaking speed', items: ['leggings'], conflicts: [], multiplier: 4, treasure: true },

  // ─── Fishing Rod ───
  { id: 'luck_of_the_sea', name: 'Luck of the Sea', maxLevel: 3, description: 'Increases chance of treasure from fishing', items: ['fishing_rod'], conflicts: [], multiplier: 2, treasure: false },
  { id: 'lure', name: 'Lure', maxLevel: 3, description: 'Decreases wait time for fish to bite', items: ['fishing_rod'], conflicts: [], multiplier: 2, treasure: false },

  // ─── Universal (most items) ───
  { id: 'unbreaking', name: 'Unbreaking', maxLevel: 3, description: 'Increases item durability (chance to not use durability)', items: ['sword', 'axe', 'pickaxe', 'shovel', 'hoe', 'bow', 'crossbow', 'trident', 'helmet', 'chestplate', 'leggings', 'boots', 'shield', 'fishing_rod', 'elytra', 'mace'], conflicts: [], multiplier: 1, treasure: false },
  { id: 'mending', name: 'Mending', maxLevel: 1, description: 'Repairs item using XP orbs instead of gaining XP', items: ['sword', 'axe', 'pickaxe', 'shovel', 'hoe', 'bow', 'crossbow', 'trident', 'helmet', 'chestplate', 'leggings', 'boots', 'shield', 'fishing_rod', 'elytra', 'mace'], conflicts: ['infinity'], multiplier: 2, treasure: true },
  { id: 'curse_of_vanishing', name: 'Curse of Vanishing', maxLevel: 1, description: 'Item disappears on death instead of dropping', items: ['sword', 'axe', 'pickaxe', 'shovel', 'hoe', 'bow', 'crossbow', 'trident', 'helmet', 'chestplate', 'leggings', 'boots', 'shield', 'fishing_rod', 'elytra', 'mace'], conflicts: [], multiplier: 1, treasure: true },
  { id: 'curse_of_binding', name: 'Curse of Binding', maxLevel: 1, description: 'Armor cannot be removed once equipped (except by dying)', items: ['helmet', 'chestplate', 'leggings', 'boots', 'elytra'], conflicts: [], multiplier: 4, treasure: true },

  // ─── Mace (1.21+) ───
  { id: 'density', name: 'Density', maxLevel: 5, description: 'Increases damage based on fall distance (mace)', items: ['mace'], conflicts: ['sharpness', 'smite', 'bane_of_arthropods', 'breach'], multiplier: 1, treasure: false },
  { id: 'breach', name: 'Breach', maxLevel: 4, description: 'Reduces effectiveness of target armor', items: ['mace'], conflicts: ['sharpness', 'smite', 'bane_of_arthropods', 'density'], multiplier: 2, treasure: false },
  { id: 'wind_burst', name: 'Wind Burst', maxLevel: 3, description: 'Launches the user upward on a successful hit', items: ['mace'], conflicts: [], multiplier: 2, treasure: true },
];

// ─── Roman numerals helper ───
function toRoman(n: number): string {
  const map: [number, string][] = [[5, 'V'], [4, 'IV'], [3, 'III'], [2, 'II'], [1, 'I']];
  let result = '';
  for (const [value, symbol] of map) {
    while (n >= value) { result += symbol; n -= value; }
  }
  return result;
}

// ─── Anvil XP cost calculation ───
// Simplified model: combining N enchanted books onto an item
// Each combination on an anvil costs: sum of (multiplier * level) for the enchantment being applied
// Plus a prior work penalty that doubles each time
// This is a simplified estimator for total XP levels needed.
function calculateXpCost(selected: { id: string; level: number }[]): { totalLevels: number; steps: { name: string; cost: number }[] } {
  if (selected.length === 0) return { totalLevels: 0, steps: [] };

  const steps: { name: string; cost: number }[] = [];
  let priorWorkPenalty = 0; // starts at 0 for fresh item

  // Sort by multiplier (cheapest first to minimize accumulated penalty)
  const sorted = [...selected].sort((a, b) => {
    const ea = ENCHANTMENTS.find(e => e.id === a.id)!;
    const eb = ENCHANTMENTS.find(e => e.id === b.id)!;
    return (ea.multiplier * a.level) - (eb.multiplier * b.level);
  });

  for (const sel of sorted) {
    const ench = ENCHANTMENTS.find(e => e.id === sel.id)!;
    const enchCost = ench.multiplier * sel.level;
    const stepCost = enchCost + priorWorkPenalty;
    steps.push({ name: `${ench.name} ${toRoman(sel.level)}`, cost: stepCost });
    priorWorkPenalty = (priorWorkPenalty + 1) * 2 - 1; // simplified: each step adds 1 to prior work
  }

  const totalLevels = steps.reduce((sum, s) => sum + s.cost, 0);
  return { totalLevels, steps };
}

export default function EnchantCalcPage() {
  const [selectedItem, setSelectedItem] = useState<ItemType>('sword');
  const [selectedEnchants, setSelectedEnchants] = useState<Map<string, number>>(new Map());
  const [showInfo, setShowInfo] = useState<string | null>(null);

  // Enchantments compatible with the selected item
  const compatibleEnchants = useMemo(
    () => ENCHANTMENTS.filter(e => e.items.includes(selectedItem)),
    [selectedItem],
  );

  // Figure out which enchantments conflict with already-selected ones
  const conflictingIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [enchId] of selectedEnchants) {
      const ench = ENCHANTMENTS.find(e => e.id === enchId);
      if (ench) {
        for (const c of ench.conflicts) ids.add(c);
      }
    }
    return ids;
  }, [selectedEnchants]);

  const toggleEnchant = useCallback((enchId: string, maxLevel: number) => {
    setSelectedEnchants(prev => {
      const next = new Map(prev);
      if (next.has(enchId)) {
        next.delete(enchId);
      } else {
        next.set(enchId, maxLevel);
      }
      return next;
    });
  }, []);

  const setEnchantLevel = useCallback((enchId: string, level: number) => {
    setSelectedEnchants(prev => {
      const next = new Map(prev);
      next.set(enchId, level);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedEnchants(new Map());
  }, []);

  const handleItemChange = useCallback((item: ItemType) => {
    setSelectedItem(item);
    setSelectedEnchants(new Map());
    setShowInfo(null);
  }, []);

  // XP calculation
  const xpResult = useMemo(() => {
    const entries = Array.from(selectedEnchants.entries()).map(([id, level]) => ({ id, level }));
    return calculateXpCost(entries);
  }, [selectedEnchants]);

  const selectedItemDef = ITEMS.find(i => i.id === selectedItem)!;

  return (
    <div
      className="min-h-screen p-3 md:p-6 flex flex-col items-center"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Header */}
      <div className="text-center mb-4 md:mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
            🌙 Moonlight
          </span>
        </div>
        <h1 className="text-2xl md:text-5xl font-black text-white drop-shadow-2xl">
          ✨ Enchantment Calculator
        </h1>
        <p className="text-sm md:text-lg text-white/90 mt-1">
          Find the best Minecraft enchantments for every item ⚔️
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl">
        {/* Left: Item Selection */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 lg:w-56 shrink-0">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">🎒 Item</h2>
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
            {ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemChange(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-center ${
                  selectedItem === item.id
                    ? 'bg-purple-500/60 ring-2 ring-purple-400 scale-105 shadow-lg'
                    : 'bg-white/5 hover:bg-white/15 hover:scale-105'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[10px] md:text-xs text-white/80 font-medium leading-tight">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Enchantment List */}
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              📖 Enchantments for {selectedItemDef.emoji} {selectedItemDef.name}
            </h2>
            {selectedEnchants.size > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-1 bg-red-500/50 hover:bg-red-500 text-white rounded-full text-xs font-bold transition-colors"
              >
                🗑️ Clear
              </button>
            )}
          </div>

          {compatibleEnchants.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-8">No enchantments available for this item.</p>
          ) : (
            <div className="space-y-2">
              {compatibleEnchants.map(ench => {
                const isSelected = selectedEnchants.has(ench.id);
                const isConflicting = !isSelected && conflictingIds.has(ench.id);
                const currentLevel = selectedEnchants.get(ench.id) ?? ench.maxLevel;
                const isCurse = ench.id.startsWith('curse_');

                return (
                  <div
                    key={ench.id}
                    className={`rounded-xl p-3 transition-all ${
                      isSelected
                        ? isCurse
                          ? 'bg-red-500/20 ring-1 ring-red-400/50'
                          : 'bg-purple-500/20 ring-1 ring-purple-400/50'
                        : isConflicting
                          ? 'bg-white/5 opacity-40'
                          : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Toggle checkbox */}
                      <button
                        onClick={() => !isConflicting && toggleEnchant(ench.id, ench.maxLevel)}
                        disabled={isConflicting}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? isCurse
                              ? 'bg-red-500 border-red-400'
                              : 'bg-purple-500 border-purple-400'
                            : isConflicting
                              ? 'border-white/20 bg-white/5 cursor-not-allowed'
                              : 'border-white/30 hover:border-white/50'
                        }`}
                      >
                        {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                        {isConflicting && <span className="text-white/40 text-xs">✕</span>}
                      </button>

                      {/* Name + description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-sm ${isCurse ? 'text-red-300' : 'text-white'}`}>
                            {ench.name}
                          </span>
                          {ench.treasure && (
                            <span className="text-[10px] bg-yellow-500/30 text-yellow-300 px-1.5 py-0.5 rounded-full font-bold">
                              💎 Treasure
                            </span>
                          )}
                          {isConflicting && (
                            <span className="text-[10px] bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded-full font-bold">
                              ⚠️ Conflicts
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 mt-0.5">{ench.description}</p>
                        {/* Show conflicts */}
                        {ench.conflicts.length > 0 && (
                          <p className="text-[10px] text-white/40 mt-1">
                            Conflicts with: {ench.conflicts.map(c => ENCHANTMENTS.find(e => e.id === c)?.name).filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Level selector */}
                      <div className="flex items-center gap-1 shrink-0">
                        {ench.maxLevel === 1 ? (
                          <span className="text-xs text-white/50 font-mono">I</span>
                        ) : (
                          <div className="flex gap-1">
                            {Array.from({ length: ench.maxLevel }, (_, i) => i + 1).map(lvl => (
                              <button
                                key={lvl}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isSelected) toggleEnchant(ench.id, lvl);
                                  else setEnchantLevel(ench.id, lvl);
                                }}
                                disabled={isConflicting}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                  isSelected && currentLevel === lvl
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : isSelected && lvl < currentLevel
                                      ? 'bg-purple-500/30 text-purple-300'
                                      : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80'
                                } ${isConflicting ? 'cursor-not-allowed' : ''}`}
                              >
                                {toRoman(lvl)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Info toggle */}
                      <button
                        onClick={() => setShowInfo(showInfo === ench.id ? null : ench.id)}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/80 text-xs transition-all shrink-0"
                      >
                        ?
                      </button>
                    </div>

                    {/* Expanded info */}
                    {showInfo === ench.id && (
                      <div className="mt-3 p-3 bg-black/20 rounded-lg text-xs text-white/70 space-y-1">
                        <p><strong className="text-white/90">Max Level:</strong> {ench.maxLevel} ({toRoman(ench.maxLevel)})</p>
                        <p><strong className="text-white/90">Anvil Cost Multiplier:</strong> {ench.multiplier}× per level</p>
                        <p><strong className="text-white/90">Applies to:</strong> {ench.items.map(i => ITEMS.find(it => it.id === i)?.name).filter(Boolean).join(', ')}</p>
                        {ench.treasure && <p><strong className="text-yellow-300">⚠️ Treasure only:</strong> Cannot be obtained from enchanting table. Found in loot chests, fishing, or trading.</p>}
                        {ench.conflicts.length > 0 && <p><strong className="text-red-300">⚔️ Conflicts:</strong> {ench.conflicts.map(c => ENCHANTMENTS.find(e => e.id === c)?.name).filter(Boolean).join(', ')}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Cost Calculator */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 lg:w-72 shrink-0">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">💰 XP Cost</h2>

          {selectedEnchants.size === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-3 block">🪄</span>
              <p className="text-white/50 text-sm">
                Select enchantments to calculate the total XP cost!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Selected enchantments summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white/80">Selected ({selectedEnchants.size}):</h3>
                {Array.from(selectedEnchants.entries()).map(([id, level]) => {
                  const ench = ENCHANTMENTS.find(e => e.id === id)!;
                  return (
                    <div key={id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-sm text-white font-medium">
                        {ench.name} {toRoman(level)}
                      </span>
                      <button
                        onClick={() => toggleEnchant(id, level)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Anvil steps */}
              <div className="border-t border-white/10 pt-3">
                <h3 className="text-sm font-semibold text-white/80 mb-2">📋 Anvil Steps (optimal order):</h3>
                <div className="space-y-1">
                  {xpResult.steps.map((step, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-white/70">
                        <span className="text-white/40 font-mono mr-1">{i + 1}.</span>
                        {step.name}
                      </span>
                      <span className="text-green-400 font-bold">{step.cost} lvl</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">Total XP Levels:</span>
                  <span className="text-2xl font-black text-green-400">{xpResult.totalLevels}</span>
                </div>
                <p className="text-[10px] text-white/40 mt-2">
                  * Estimated cost. Actual cost may vary based on item repair cost, prior work penalty, and enchantment source (book vs item).
                </p>
              </div>

              {/* Too expensive warning */}
              {xpResult.totalLevels > 39 && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-xs font-bold">⚠️ Too Expensive!</p>
                  <p className="text-red-300/70 text-[10px] mt-1">
                    In survival mode, anvil operations are limited to 39 levels per step. You may need to combine enchanted books first, then apply to the item.
                  </p>
                </div>
              )}

              {xpResult.steps.some(s => s.cost > 39) && xpResult.totalLevels <= 39 && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-300 text-xs font-bold">⚠️ Some steps exceed 39 levels</p>
                  <p className="text-yellow-300/70 text-[10px] mt-1">
                    Individual anvil steps cannot exceed 39 levels in survival. Try combining books first.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-8 w-full max-w-3xl text-white/70 text-sm space-y-4">
        <h2 className="text-xl font-bold text-white">Minecraft Enchantment Guide</h2>
        <p>
          Enchantments are special bonuses applied to tools, weapons, and armor in Minecraft using an
          Enchanting Table, Anvil, or through loot. Our free Enchantment Calculator helps you find the
          best combinations and calculate the total XP cost before you start.
        </p>
        <h3 className="text-lg font-semibold text-white/90">How Enchanting Works</h3>
        <p>
          Use an Enchanting Table surrounded by bookshelves (up to 15) for random enchantments, or use
          an Anvil to combine enchanted books with your gear. Some enchantments conflict with each other
          (e.g., Sharpness vs Smite) — our tool highlights these conflicts automatically.
        </p>
        <h3 className="text-lg font-semibold text-white/90">Anvil XP Cost Tips</h3>
        <p>
          The order you combine enchantments matters! Each anvil use increases the &quot;prior work penalty&quot;
          making subsequent operations more expensive. Apply cheaper enchantments first, or combine books
          together before applying to your item. Our calculator sorts steps optimally for you.
        </p>
        <h3 className="text-lg font-semibold text-white/90">Compatible Versions</h3>
        <p>
          Enchantment data covers both Minecraft Java Edition and Bedrock Edition. Some enchantments like
          Sweeping Edge are Java-only, while Impaling works differently on Bedrock. The calculator includes
          the latest 1.21+ enchantments including Density, Breach, and Wind Burst for the Mace.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <a
            href="/games/"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            🎮 More Games
          </a>
          <a
            href="/games/banner-maker/"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            🏳️ Banner Maker
          </a>
          <a
            href="/games/skin-creator/"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            🎨 Skin Creator
          </a>
          <a
            href="/libri/"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            📚 Free Books
          </a>
        </div>
      </div>

      <p className="text-white/40 text-xs mt-6">
        Made with 💖 by Onde • Free Minecraft Enchantment Calculator Online
      </p>
    </div>
  );
}
