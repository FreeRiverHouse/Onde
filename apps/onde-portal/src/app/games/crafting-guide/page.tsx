'use client';

import { useState, useMemo } from 'react';
import { usePlayerName } from '@/hooks/usePlayerName';

// ─── Types ───────────────────────────────────────────
type Category =
  | 'All'
  | 'Tools'
  | 'Weapons'
  | 'Armor'
  | 'Building'
  | 'Decoration'
  | 'Redstone'
  | 'Food'
  | 'Brewing'
  | 'Transportation'
  | 'Misc';

interface Recipe {
  name: string;
  category: Exclude<Category, 'All'>;
  grid: (string | null)[][]; // 3x3, null = empty
  result: string; // emoji for the result
  resultCount?: number;
  ingredients: string[];
  description: string;
}

// ─── Ingredient emoji map ────────────────────────────
const I: Record<string, string> = {
  // Raw materials
  OAK: '🪵', PLANK: '🟫', STICK: '🥢', COBBLE: '⬜', STONE: '🪨',
  IRON: '🔩', GOLD: '🟡', DIAMOND: '💎', NETHERITE: '🟤', EMERALD: '💚',
  COAL: '⚫', REDSTONE: '🔴', LAPIS: '🔵', QUARTZ: '🤍', OBSIDIAN: '🟪',
  LEATHER: '🟤', STRING: '🧵', FEATHER: '🪶', FLINT: '🔘', PAPER: '📄',
  GLASS: '🔲', WOOL: '🐑', SLIME: '🟢', BLAZE_ROD: '🔥', ENDER_PEARL: '👁️',
  GHAST_TEAR: '💧', NETHER_WART: '🍄', GLOWSTONE: '✨', BONE: '🦴',
  SUGAR_CANE: '🎋', CLAY: '🧱', SAND: '🟨', GRAVEL: '⬛', GUNPOWDER: '💥',
  BUCKET: '🪣', BOOK: '📕', EGG: '🥚', WHEAT: '🌾', SUGAR: '🧂',
  MILK: '🥛', COCOA: '🟤', PUMPKIN: '🎃', MELON: '🍉', APPLE: '🍎',
  CHEST: '📦', TORCH: '🔦', FURNACE: '🔥', INK: '🖤', DYE: '🎨',
  SNOWBALL: '⚪', BRICK: '🧱', NETHER_BRICK: '🟥', DRIED_KELP: '🌿',
  BAMBOO: '🎍', COPPER: '🟠', AMETHYST: '🔮', CHAIN: '⛓️', PRISMARINE: '🐚',
  HONEYCOMB: '🍯', RABBIT_HIDE: '🐰', PHANTOM_MEMBRANE: '👻', TRIPWIRE_HOOK: '🪝',
  PLANK_SLAB: '📏', IRON_NUGGET: '⚙️', GOLD_NUGGET: '✴️',
};

// ─── All Recipes ─────────────────────────────────────
const RECIPES: Recipe[] = [
  // ═══ TOOLS ═══
  {
    name: 'Wooden Pickaxe',
    category: 'Tools',
    grid: [
      [I.PLANK, I.PLANK, I.PLANK],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '⛏️',
    ingredients: ['3 Wooden Planks', '2 Sticks'],
    description: 'The first pickaxe you can craft. Mines stone and coal ore.',
  },
  {
    name: 'Stone Pickaxe',
    category: 'Tools',
    grid: [
      [I.COBBLE, I.COBBLE, I.COBBLE],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '⛏️',
    ingredients: ['3 Cobblestone', '2 Sticks'],
    description: 'Upgrade from wood. Can mine iron ore.',
  },
  {
    name: 'Iron Pickaxe',
    category: 'Tools',
    grid: [
      [I.IRON, I.IRON, I.IRON],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '⛏️',
    ingredients: ['3 Iron Ingots', '2 Sticks'],
    description: 'Can mine gold, diamond, and redstone ores.',
  },
  {
    name: 'Gold Pickaxe',
    category: 'Tools',
    grid: [
      [I.GOLD, I.GOLD, I.GOLD],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '⛏️',
    ingredients: ['3 Gold Ingots', '2 Sticks'],
    description: 'Fastest mining speed but very low durability.',
  },
  {
    name: 'Diamond Pickaxe',
    category: 'Tools',
    grid: [
      [I.DIAMOND, I.DIAMOND, I.DIAMOND],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '⛏️',
    ingredients: ['3 Diamonds', '2 Sticks'],
    description: 'Can mine obsidian. Essential for reaching the Nether.',
  },
  {
    name: 'Wooden Axe',
    category: 'Tools',
    grid: [
      [I.PLANK, I.PLANK, null],
      [I.PLANK, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '🪓',
    ingredients: ['3 Wooden Planks', '2 Sticks'],
    description: 'Basic axe for chopping wood faster.',
  },
  {
    name: 'Iron Axe',
    category: 'Tools',
    grid: [
      [I.IRON, I.IRON, null],
      [I.IRON, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '🪓',
    ingredients: ['3 Iron Ingots', '2 Sticks'],
    description: 'Fast wood chopping. Also deals good melee damage.',
  },
  {
    name: 'Diamond Axe',
    category: 'Tools',
    grid: [
      [I.DIAMOND, I.DIAMOND, null],
      [I.DIAMOND, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '🪓',
    ingredients: ['3 Diamonds', '2 Sticks'],
    description: 'Top-tier axe. Great durability and damage.',
  },
  {
    name: 'Wooden Shovel',
    category: 'Tools',
    grid: [
      [null, I.PLANK, null],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '🥄',
    ingredients: ['1 Wooden Plank', '2 Sticks'],
    description: 'Dig dirt, sand, and gravel faster.',
  },
  {
    name: 'Iron Shovel',
    category: 'Tools',
    grid: [
      [null, I.IRON, null],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '🥄',
    ingredients: ['1 Iron Ingot', '2 Sticks'],
    description: 'Efficient digging tool for most blocks.',
  },
  {
    name: 'Diamond Shovel',
    category: 'Tools',
    grid: [
      [null, I.DIAMOND, null],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '🥄',
    ingredients: ['1 Diamond', '2 Sticks'],
    description: 'Best durability shovel. Can create paths.',
  },
  {
    name: 'Wooden Hoe',
    category: 'Tools',
    grid: [
      [I.PLANK, I.PLANK, null],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '🌱',
    ingredients: ['2 Wooden Planks', '2 Sticks'],
    description: 'Till dirt into farmland for planting crops.',
  },
  {
    name: 'Iron Hoe',
    category: 'Tools',
    grid: [
      [I.IRON, I.IRON, null],
      [null, I.STICK, null],
      [null, I.STICK, null],
    ],
    result: '🌱',
    ingredients: ['2 Iron Ingots', '2 Sticks'],
    description: 'Durable hoe for large farming operations.',
  },
  {
    name: 'Shears',
    category: 'Tools',
    grid: [
      [null, I.IRON, null],
      [I.IRON, null, null],
      [null, null, null],
    ],
    result: '✂️',
    ingredients: ['2 Iron Ingots'],
    description: 'Shear sheep for wool. Also harvests leaves and vines.',
  },
  {
    name: 'Fishing Rod',
    category: 'Tools',
    grid: [
      [null, null, I.STICK],
      [null, I.STICK, I.STRING],
      [I.STICK, null, I.STRING],
    ],
    result: '🎣',
    ingredients: ['3 Sticks', '2 Strings'],
    description: 'Catch fish and treasure. Also pulls mobs.',
  },
  {
    name: 'Flint and Steel',
    category: 'Tools',
    grid: [
      [I.IRON, null, null],
      [null, I.FLINT, null],
      [null, null, null],
    ],
    result: '🔥',
    ingredients: ['1 Iron Ingot', '1 Flint'],
    description: 'Start fires and light Nether portals.',
  },
  {
    name: 'Compass',
    category: 'Tools',
    grid: [
      [null, I.IRON, null],
      [I.IRON, I.REDSTONE, I.IRON],
      [null, I.IRON, null],
    ],
    result: '🧭',
    ingredients: ['4 Iron Ingots', '1 Redstone Dust'],
    description: 'Points to world spawn. Used in maps and lodestone.',
  },
  {
    name: 'Clock',
    category: 'Tools',
    grid: [
      [null, I.GOLD, null],
      [I.GOLD, I.REDSTONE, I.GOLD],
      [null, I.GOLD, null],
    ],
    result: '🕐',
    ingredients: ['4 Gold Ingots', '1 Redstone Dust'],
    description: 'Shows the time of day. Useful when underground.',
  },
  {
    name: 'Spyglass',
    category: 'Tools',
    grid: [
      [null, I.AMETHYST, null],
      [null, I.COPPER, null],
      [null, I.COPPER, null],
    ],
    result: '🔭',
    ingredients: ['1 Amethyst Shard', '2 Copper Ingots'],
    description: 'Zoom in on distant locations.',
  },
  {
    name: 'Bucket',
    category: 'Tools',
    grid: [
      [null, null, null],
      [I.IRON, null, I.IRON],
      [null, I.IRON, null],
    ],
    result: '🪣',
    ingredients: ['3 Iron Ingots'],
    description: 'Carry water, lava, milk, or fish.',
  },

  // ═══ WEAPONS ═══
  {
    name: 'Wooden Sword',
    category: 'Weapons',
    grid: [
      [null, I.PLANK, null],
      [null, I.PLANK, null],
      [null, I.STICK, null],
    ],
    result: '🗡️',
    ingredients: ['2 Wooden Planks', '1 Stick'],
    description: 'Basic melee weapon. Better than your fists!',
  },
  {
    name: 'Stone Sword',
    category: 'Weapons',
    grid: [
      [null, I.COBBLE, null],
      [null, I.COBBLE, null],
      [null, I.STICK, null],
    ],
    result: '🗡️',
    ingredients: ['2 Cobblestone', '1 Stick'],
    description: 'Reliable early-game weapon. 5 attack damage.',
  },
  {
    name: 'Iron Sword',
    category: 'Weapons',
    grid: [
      [null, I.IRON, null],
      [null, I.IRON, null],
      [null, I.STICK, null],
    ],
    result: '🗡️',
    ingredients: ['2 Iron Ingots', '1 Stick'],
    description: 'Solid mid-game weapon. 6 attack damage.',
  },
  {
    name: 'Gold Sword',
    category: 'Weapons',
    grid: [
      [null, I.GOLD, null],
      [null, I.GOLD, null],
      [null, I.STICK, null],
    ],
    result: '🗡️',
    ingredients: ['2 Gold Ingots', '1 Stick'],
    description: 'Low durability but has the highest enchantability.',
  },
  {
    name: 'Diamond Sword',
    category: 'Weapons',
    grid: [
      [null, I.DIAMOND, null],
      [null, I.DIAMOND, null],
      [null, I.STICK, null],
    ],
    result: '🗡️',
    ingredients: ['2 Diamonds', '1 Stick'],
    description: 'Top-tier melee weapon. 7 attack damage, 1561 durability.',
  },
  {
    name: 'Bow',
    category: 'Weapons',
    grid: [
      [null, I.STICK, I.STRING],
      [I.STICK, null, I.STRING],
      [null, I.STICK, I.STRING],
    ],
    result: '🏹',
    ingredients: ['3 Sticks', '3 Strings'],
    description: 'Ranged weapon. Requires arrows as ammo.',
  },
  {
    name: 'Arrow',
    category: 'Weapons',
    grid: [
      [null, I.FLINT, null],
      [null, I.STICK, null],
      [null, I.FEATHER, null],
    ],
    result: '➡️',
    resultCount: 4,
    ingredients: ['1 Flint', '1 Stick', '1 Feather'],
    description: 'Ammunition for bows and crossbows. Crafts 4 at once.',
  },
  {
    name: 'Crossbow',
    category: 'Weapons',
    grid: [
      [I.STICK, I.IRON, I.STICK],
      [I.STRING, I.TRIPWIRE_HOOK, I.STRING],
      [null, I.STICK, null],
    ],
    result: '🏹',
    ingredients: ['3 Sticks', '2 Strings', '1 Iron Ingot', '1 Tripwire Hook'],
    description: 'Powerful ranged weapon. Can be loaded in advance.',
  },
  {
    name: 'Shield',
    category: 'Weapons',
    grid: [
      [I.PLANK, I.IRON, I.PLANK],
      [I.PLANK, I.PLANK, I.PLANK],
      [null, I.PLANK, null],
    ],
    result: '🛡️',
    ingredients: ['6 Wooden Planks', '1 Iron Ingot'],
    description: 'Block attacks and projectiles. Essential for combat.',
  },
  {
    name: 'Trident (Repair)',
    category: 'Weapons',
    grid: [
      [null, null, null],
      [null, '🔱', null],
      [null, '🔱', null],
    ],
    result: '🔱',
    ingredients: ['2 Tridents (damaged)'],
    description: 'Combine two damaged tridents. Only drops from Drowned.',
  },

  // ═══ ARMOR ═══
  {
    name: 'Leather Helmet',
    category: 'Armor',
    grid: [
      [I.LEATHER, I.LEATHER, I.LEATHER],
      [I.LEATHER, null, I.LEATHER],
      [null, null, null],
    ],
    result: '⛑️',
    ingredients: ['5 Leather'],
    description: 'Basic head protection. Can be dyed any color.',
  },
  {
    name: 'Iron Helmet',
    category: 'Armor',
    grid: [
      [I.IRON, I.IRON, I.IRON],
      [I.IRON, null, I.IRON],
      [null, null, null],
    ],
    result: '⛑️',
    ingredients: ['5 Iron Ingots'],
    description: 'Solid head protection. 2 armor points.',
  },
  {
    name: 'Diamond Helmet',
    category: 'Armor',
    grid: [
      [I.DIAMOND, I.DIAMOND, I.DIAMOND],
      [I.DIAMOND, null, I.DIAMOND],
      [null, null, null],
    ],
    result: '⛑️',
    ingredients: ['5 Diamonds'],
    description: 'Top-tier head armor. 3 armor points, 2 toughness.',
  },
  {
    name: 'Leather Chestplate',
    category: 'Armor',
    grid: [
      [I.LEATHER, null, I.LEATHER],
      [I.LEATHER, I.LEATHER, I.LEATHER],
      [I.LEATHER, I.LEATHER, I.LEATHER],
    ],
    result: '👕',
    ingredients: ['8 Leather'],
    description: 'Basic chest armor. Dyeable in any color.',
  },
  {
    name: 'Iron Chestplate',
    category: 'Armor',
    grid: [
      [I.IRON, null, I.IRON],
      [I.IRON, I.IRON, I.IRON],
      [I.IRON, I.IRON, I.IRON],
    ],
    result: '👕',
    ingredients: ['8 Iron Ingots'],
    description: 'Strong chest protection. 6 armor points.',
  },
  {
    name: 'Diamond Chestplate',
    category: 'Armor',
    grid: [
      [I.DIAMOND, null, I.DIAMOND],
      [I.DIAMOND, I.DIAMOND, I.DIAMOND],
      [I.DIAMOND, I.DIAMOND, I.DIAMOND],
    ],
    result: '👕',
    ingredients: ['8 Diamonds'],
    description: 'Best chest armor. 8 armor points, 2 toughness.',
  },
  {
    name: 'Leather Leggings',
    category: 'Armor',
    grid: [
      [I.LEATHER, I.LEATHER, I.LEATHER],
      [I.LEATHER, null, I.LEATHER],
      [I.LEATHER, null, I.LEATHER],
    ],
    result: '👖',
    ingredients: ['7 Leather'],
    description: 'Basic leg protection. Dyeable.',
  },
  {
    name: 'Iron Leggings',
    category: 'Armor',
    grid: [
      [I.IRON, I.IRON, I.IRON],
      [I.IRON, null, I.IRON],
      [I.IRON, null, I.IRON],
    ],
    result: '👖',
    ingredients: ['7 Iron Ingots'],
    description: 'Solid leg armor. 5 armor points.',
  },
  {
    name: 'Diamond Leggings',
    category: 'Armor',
    grid: [
      [I.DIAMOND, I.DIAMOND, I.DIAMOND],
      [I.DIAMOND, null, I.DIAMOND],
      [I.DIAMOND, null, I.DIAMOND],
    ],
    result: '👖',
    ingredients: ['7 Diamonds'],
    description: 'Top-tier leg armor. 6 armor points, 2 toughness.',
  },
  {
    name: 'Leather Boots',
    category: 'Armor',
    grid: [
      [null, null, null],
      [I.LEATHER, null, I.LEATHER],
      [I.LEATHER, null, I.LEATHER],
    ],
    result: '👢',
    ingredients: ['4 Leather'],
    description: 'Basic foot protection. Dyeable any color.',
  },
  {
    name: 'Iron Boots',
    category: 'Armor',
    grid: [
      [null, null, null],
      [I.IRON, null, I.IRON],
      [I.IRON, null, I.IRON],
    ],
    result: '👢',
    ingredients: ['4 Iron Ingots'],
    description: 'Solid boots. 2 armor points.',
  },
  {
    name: 'Diamond Boots',
    category: 'Armor',
    grid: [
      [null, null, null],
      [I.DIAMOND, null, I.DIAMOND],
      [I.DIAMOND, null, I.DIAMOND],
    ],
    result: '👢',
    ingredients: ['4 Diamonds'],
    description: 'Best boots. 3 armor points, 2 toughness.',
  },

  // ═══ BUILDING ═══
  {
    name: 'Crafting Table',
    category: 'Building',
    grid: [
      [I.PLANK, I.PLANK, null],
      [I.PLANK, I.PLANK, null],
      [null, null, null],
    ],
    result: '🔨',
    ingredients: ['4 Wooden Planks'],
    description: 'Essential! Opens the 3x3 crafting grid.',
  },
  {
    name: 'Furnace',
    category: 'Building',
    grid: [
      [I.COBBLE, I.COBBLE, I.COBBLE],
      [I.COBBLE, null, I.COBBLE],
      [I.COBBLE, I.COBBLE, I.COBBLE],
    ],
    result: '🔥',
    ingredients: ['8 Cobblestone'],
    description: 'Smelt ores and cook food. A survival essential.',
  },
  {
    name: 'Blast Furnace',
    category: 'Building',
    grid: [
      [I.IRON, I.IRON, I.IRON],
      [I.IRON, I.FURNACE, I.IRON],
      [I.COBBLE, I.COBBLE, I.COBBLE],
    ],
    result: '🔥',
    ingredients: ['5 Iron Ingots', '1 Furnace', '3 Smooth Stone'],
    description: 'Smelts ores twice as fast as a regular furnace.',
  },
  {
    name: 'Smoker',
    category: 'Building',
    grid: [
      [null, I.OAK, null],
      [I.OAK, I.FURNACE, I.OAK],
      [null, I.OAK, null],
    ],
    result: '🔥',
    ingredients: ['4 Logs', '1 Furnace'],
    description: 'Cooks food twice as fast as a regular furnace.',
  },
  {
    name: 'Chest',
    category: 'Building',
    grid: [
      [I.PLANK, I.PLANK, I.PLANK],
      [I.PLANK, null, I.PLANK],
      [I.PLANK, I.PLANK, I.PLANK],
    ],
    result: '📦',
    ingredients: ['8 Wooden Planks'],
    description: 'Store 27 stacks of items. Place two side-by-side for a double chest.',
  },
  {
    name: 'Barrel',
    category: 'Building',
    grid: [
      [I.PLANK, I.PLANK_SLAB, I.PLANK],
      [I.PLANK, null, I.PLANK],
      [I.PLANK, I.PLANK_SLAB, I.PLANK],
    ],
    result: '🛢️',
    ingredients: ['6 Wooden Planks', '2 Wooden Slabs'],
    description: 'Same storage as a chest but can open with blocks above it.',
  },
  {
    name: 'Ender Chest',
    category: 'Building',
    grid: [
      [I.OBSIDIAN, I.OBSIDIAN, I.OBSIDIAN],
      [I.OBSIDIAN, I.ENDER_PEARL, I.OBSIDIAN],
      [I.OBSIDIAN, I.OBSIDIAN, I.OBSIDIAN],
    ],
    result: '📦',
    ingredients: ['8 Obsidian', '1 Eye of Ender'],
    description: 'Personal storage accessible from any Ender Chest in the world.',
  },
  {
    name: 'Door (Oak)',
    category: 'Building',
    grid: [
      [I.PLANK, I.PLANK, null],
      [I.PLANK, I.PLANK, null],
      [I.PLANK, I.PLANK, null],
    ],
    result: '🚪',
    resultCount: 3,
    ingredients: ['6 Wooden Planks'],
    description: 'Wooden door for your base. Crafts 3 doors.',
  },
  {
    name: 'Iron Door',
    category: 'Building',
    grid: [
      [I.IRON, I.IRON, null],
      [I.IRON, I.IRON, null],
      [I.IRON, I.IRON, null],
    ],
    result: '🚪',
    resultCount: 3,
    ingredients: ['6 Iron Ingots'],
    description: 'Zombie-proof door. Requires redstone signal to open.',
  },
  {
    name: 'Trapdoor (Oak)',
    category: 'Building',
    grid: [
      [null, null, null],
      [I.PLANK, I.PLANK, I.PLANK],
      [I.PLANK, I.PLANK, I.PLANK],
    ],
    result: '⬛',
    resultCount: 2,
    ingredients: ['6 Wooden Planks'],
    description: 'Horizontal door. Great for hidden entrances.',
  },
  {
    name: 'Ladder',
    category: 'Building',
    grid: [
      [I.STICK, null, I.STICK],
      [I.STICK, I.STICK, I.STICK],
      [I.STICK, null, I.STICK],
    ],
    result: '🪜',
    resultCount: 3,
    ingredients: ['7 Sticks'],
    description: 'Climb vertical surfaces. Place on walls.',
  },
  {
    name: 'Fence (Oak)',
    category: 'Building',
    grid: [
      [null, null, null],
      [I.PLANK, I.STICK, I.PLANK],
      [I.PLANK, I.STICK, I.PLANK],
    ],
    result: '🔲',
    resultCount: 3,
    ingredients: ['4 Wooden Planks', '2 Sticks'],
    description: 'Mobs cannot jump over (1.5 blocks tall). Crafts 3.',
  },
  {
    name: 'Fence Gate',
    category: 'Building',
    grid: [
      [null, null, null],
      [I.STICK, I.PLANK, I.STICK],
      [I.STICK, I.PLANK, I.STICK],
    ],
    result: '🚧',
    ingredients: ['2 Wooden Planks', '4 Sticks'],
    description: 'A gate for your fence. Opens manually or with redstone.',
  },
  {
    name: 'Torch',
    category: 'Building',
    grid: [
      [null, I.COAL, null],
      [null, I.STICK, null],
      [null, null, null],
    ],
    result: '🔦',
    resultCount: 4,
    ingredients: ['1 Coal/Charcoal', '1 Stick'],
    description: 'Light source (level 14). Prevents mob spawns. Crafts 4.',
  },
  {
    name: 'Lantern',
    category: 'Building',
    grid: [
      [I.IRON_NUGGET, I.IRON_NUGGET, I.IRON_NUGGET],
      [I.IRON_NUGGET, I.TORCH, I.IRON_NUGGET],
      [I.IRON_NUGGET, I.IRON_NUGGET, I.IRON_NUGGET],
    ],
    result: '🏮',
    ingredients: ['8 Iron Nuggets', '1 Torch'],
    description: 'Decorative light source. Light level 15, brighter than torches.',
  },
  {
    name: 'Glass Pane',
    category: 'Building',
    grid: [
      [null, null, null],
      [I.GLASS, I.GLASS, I.GLASS],
      [I.GLASS, I.GLASS, I.GLASS],
    ],
    result: '🔲',
    resultCount: 16,
    ingredients: ['6 Glass Blocks'],
    description: 'Thin glass panels for windows. Crafts 16.',
  },
  {
    name: 'Bed',
    category: 'Building',
    grid: [
      [null, null, null],
      [I.WOOL, I.WOOL, I.WOOL],
      [I.PLANK, I.PLANK, I.PLANK],
    ],
    result: '🛏️',
    ingredients: ['3 Wool (same color)', '3 Wooden Planks'],
    description: 'Set spawn point and skip the night. Essential for survival.',
  },

  // ═══ DECORATION ═══
  {
    name: 'Painting',
    category: 'Decoration',
    grid: [
      [I.STICK, I.STICK, I.STICK],
      [I.STICK, I.WOOL, I.STICK],
      [I.STICK, I.STICK, I.STICK],
    ],
    result: '🖼️',
    ingredients: ['8 Sticks', '1 Wool'],
    description: 'Decorative art for your walls. Random painting selected on placement.',
  },
  {
    name: 'Item Frame',
    category: 'Decoration',
    grid: [
      [I.STICK, I.STICK, I.STICK],
      [I.STICK, I.LEATHER, I.STICK],
      [I.STICK, I.STICK, I.STICK],
    ],
    result: '🖼️',
    ingredients: ['8 Sticks', '1 Leather'],
    description: 'Display any item on your wall as decoration.',
  },
  {
    name: 'Flower Pot',
    category: 'Decoration',
    grid: [
      [null, null, null],
      [I.BRICK, null, I.BRICK],
      [null, I.BRICK, null],
    ],
    result: '🪴',
    ingredients: ['3 Bricks'],
    description: 'Display flowers, saplings, and small plants.',
  },
  {
    name: 'Bookshelf',
    category: 'Decoration',
    grid: [
      [I.PLANK, I.PLANK, I.PLANK],
      [I.BOOK, I.BOOK, I.BOOK],
      [I.PLANK, I.PLANK, I.PLANK],
    ],
    result: '📚',
    ingredients: ['6 Wooden Planks', '3 Books'],
    description: 'Decorative and boosts enchanting table to level 30.',
  },
  {
    name: 'Carpet',
    category: 'Decoration',
    grid: [
      [null, null, null],
      [null, null, null],
      [I.WOOL, I.WOOL, null],
    ],
    result: '🟫',
    resultCount: 3,
    ingredients: ['2 Wool (same color)'],
    description: 'Thin decorative floor cover. Crafts 3.',
  },
  {
    name: 'Banner',
    category: 'Decoration',
    grid: [
      [I.WOOL, I.WOOL, I.WOOL],
      [I.WOOL, I.WOOL, I.WOOL],
      [null, I.STICK, null],
    ],
    result: '🏳️',
    ingredients: ['6 Wool (same color)', '1 Stick'],
    description: 'Decorative banner. Can be customized with patterns on a loom.',
  },
  {
    name: 'Sign (Oak)',
    category: 'Decoration',
    grid: [
      [I.PLANK, I.PLANK, I.PLANK],
      [I.PLANK, I.PLANK, I.PLANK],
      [null, I.STICK, null],
    ],
    result: '🪧',
    resultCount: 3,
    ingredients: ['6 Wooden Planks', '1 Stick'],
    description: 'Write text for other players to read. Crafts 3.',
  },
  {
    name: 'Candle',
    category: 'Decoration',
    grid: [
      [null, I.STRING, null],
      [null, I.HONEYCOMB, null],
      [null, null, null],
    ],
    result: '🕯️',
    ingredients: ['1 String', '1 Honeycomb'],
    description: 'Small light source. Stack up to 4 on one block.',
  },

  // ═══ REDSTONE ═══
  {
    name: 'Redstone Torch',
    category: 'Redstone',
    grid: [
      [null, I.REDSTONE, null],
      [null, I.STICK, null],
      [null, null, null],
    ],
    result: '🔴',
    ingredients: ['1 Redstone Dust', '1 Stick'],
    description: 'Power source for redstone circuits. Also emits dim light.',
  },
  {
    name: 'Redstone Repeater',
    category: 'Redstone',
    grid: [
      [null, null, null],
      [I.REDSTONE, I.REDSTONE, I.REDSTONE],
      [I.STONE, I.STONE, I.STONE],
    ],
    result: '🔁',
    ingredients: ['3 Stone', '2 Redstone Torches', '1 Redstone Dust'],
    description: 'Extends redstone signal, adds delay, and acts as a diode.',
  },
  {
    name: 'Redstone Comparator',
    category: 'Redstone',
    grid: [
      [null, I.REDSTONE, null],
      [I.REDSTONE, I.QUARTZ, I.REDSTONE],
      [I.STONE, I.STONE, I.STONE],
    ],
    result: '🔀',
    ingredients: ['3 Stone', '3 Redstone Torches', '1 Nether Quartz'],
    description: 'Compare, subtract, or read container signal strength.',
  },
  {
    name: 'Piston',
    category: 'Redstone',
    grid: [
      [I.PLANK, I.PLANK, I.PLANK],
      [I.COBBLE, I.IRON, I.COBBLE],
      [I.COBBLE, I.REDSTONE, I.COBBLE],
    ],
    result: '⬆️',
    ingredients: ['3 Wooden Planks', '4 Cobblestone', '1 Iron Ingot', '1 Redstone Dust'],
    description: 'Push blocks when activated. Used in many redstone machines.',
  },
  {
    name: 'Sticky Piston',
    category: 'Redstone',
    grid: [
      [null, I.SLIME, null],
      [null, '⬆️', null],
      [null, null, null],
    ],
    result: '⬆️',
    ingredients: ['1 Piston', '1 Slimeball'],
    description: 'Pushes AND pulls blocks. Essential for redstone doors.',
  },
  {
    name: 'Dispenser',
    category: 'Redstone',
    grid: [
      [I.COBBLE, I.COBBLE, I.COBBLE],
      [I.COBBLE, I.STRING, I.COBBLE],
      [I.COBBLE, I.REDSTONE, I.COBBLE],
    ],
    result: '⏏️',
    ingredients: ['7 Cobblestone', '1 Bow', '1 Redstone Dust'],
    description: 'Shoots items when powered. Uses, places, or launches items.',
  },
  {
    name: 'Dropper',
    category: 'Redstone',
    grid: [
      [I.COBBLE, I.COBBLE, I.COBBLE],
      [I.COBBLE, null, I.COBBLE],
      [I.COBBLE, I.REDSTONE, I.COBBLE],
    ],
    result: '⬇️',
    ingredients: ['7 Cobblestone', '1 Redstone Dust'],
    description: 'Drops items as entities or pushes into containers.',
  },
  {
    name: 'Observer',
    category: 'Redstone',
    grid: [
      [I.COBBLE, I.COBBLE, I.COBBLE],
      [I.REDSTONE, I.REDSTONE, I.QUARTZ],
      [I.COBBLE, I.COBBLE, I.COBBLE],
    ],
    result: '👁️',
    ingredients: ['6 Cobblestone', '2 Redstone Dust', '1 Nether Quartz'],
    description: 'Detects block changes and outputs a redstone pulse.',
  },
  {
    name: 'Hopper',
    category: 'Redstone',
    grid: [
      [I.IRON, null, I.IRON],
      [I.IRON, I.CHEST, I.IRON],
      [null, I.IRON, null],
    ],
    result: '⏬',
    ingredients: ['5 Iron Ingots', '1 Chest'],
    description: 'Transfers items between containers automatically.',
  },
  {
    name: 'TNT',
    category: 'Redstone',
    grid: [
      [I.GUNPOWDER, I.SAND, I.GUNPOWDER],
      [I.SAND, I.GUNPOWDER, I.SAND],
      [I.GUNPOWDER, I.SAND, I.GUNPOWDER],
    ],
    result: '🧨',
    ingredients: ['5 Gunpowder', '4 Sand'],
    description: 'Explosive block! Ignite with flint & steel or redstone.',
  },
  {
    name: 'Lever',
    category: 'Redstone',
    grid: [
      [null, I.STICK, null],
      [null, I.COBBLE, null],
      [null, null, null],
    ],
    result: '🔲',
    ingredients: ['1 Stick', '1 Cobblestone'],
    description: 'Toggle switch for redstone circuits.',
  },
  {
    name: 'Stone Button',
    category: 'Redstone',
    grid: [
      [null, I.STONE, null],
      [null, null, null],
      [null, null, null],
    ],
    result: '🔲',
    ingredients: ['1 Stone'],
    description: 'Momentary redstone signal when pressed.',
  },
  {
    name: 'Pressure Plate (Stone)',
    category: 'Redstone',
    grid: [
      [null, null, null],
      [I.STONE, I.STONE, null],
      [null, null, null],
    ],
    result: '🔲',
    ingredients: ['2 Stone'],
    description: 'Emits a signal when a player or mob stands on it.',
  },
  {
    name: 'Tripwire Hook',
    category: 'Redstone',
    grid: [
      [null, I.IRON, null],
      [null, I.STICK, null],
      [null, I.PLANK, null],
    ],
    result: '🪝',
    resultCount: 2,
    ingredients: ['1 Iron Ingot', '1 Stick', '1 Wooden Plank'],
    description: 'Connect two with string for a tripwire trap. Crafts 2.',
  },

  // ═══ FOOD ═══
  {
    name: 'Bread',
    category: 'Food',
    grid: [
      [null, null, null],
      [I.WHEAT, I.WHEAT, I.WHEAT],
      [null, null, null],
    ],
    result: '🍞',
    ingredients: ['3 Wheat'],
    description: 'Restores 5 hunger points. Easy early-game food.',
  },
  {
    name: 'Cake',
    category: 'Food',
    grid: [
      [I.MILK, I.MILK, I.MILK],
      [I.SUGAR, I.EGG, I.SUGAR],
      [I.WHEAT, I.WHEAT, I.WHEAT],
    ],
    result: '🎂',
    ingredients: ['3 Milk Buckets', '2 Sugar', '1 Egg', '3 Wheat'],
    description: 'Place and eat 7 slices. Restores 14 total hunger.',
  },
  {
    name: 'Cookie',
    category: 'Food',
    grid: [
      [null, null, null],
      [I.WHEAT, I.COCOA, I.WHEAT],
      [null, null, null],
    ],
    result: '🍪',
    resultCount: 8,
    ingredients: ['2 Wheat', '1 Cocoa Beans'],
    description: 'Small snack. Crafts 8 cookies. Deadly to parrots!',
  },
  {
    name: 'Pumpkin Pie',
    category: 'Food',
    grid: [
      [null, null, null],
      [I.PUMPKIN, I.SUGAR, null],
      [null, I.EGG, null],
    ],
    result: '🥧',
    ingredients: ['1 Pumpkin', '1 Sugar', '1 Egg'],
    description: 'Restores 8 hunger. Shapeless recipe.',
  },
  {
    name: 'Golden Apple',
    category: 'Food',
    grid: [
      [I.GOLD, I.GOLD, I.GOLD],
      [I.GOLD, I.APPLE, I.GOLD],
      [I.GOLD, I.GOLD, I.GOLD],
    ],
    result: '🍎',
    ingredients: ['8 Gold Ingots', '1 Apple'],
    description: 'Gives Absorption and Regeneration. Powerful healing item.',
  },
  {
    name: 'Mushroom Stew',
    category: 'Food',
    grid: [
      [null, '🍄', null],
      [null, '🟤', null],
      [null, I.BUCKET, null],
    ],
    result: '🍲',
    ingredients: ['1 Red Mushroom', '1 Brown Mushroom', '1 Bowl'],
    description: 'Restores 6 hunger. Unstackable but ingredients are common.',
  },

  // ═══ BREWING ═══
  {
    name: 'Brewing Stand',
    category: 'Brewing',
    grid: [
      [null, I.BLAZE_ROD, null],
      [I.COBBLE, I.COBBLE, I.COBBLE],
      [null, null, null],
    ],
    result: '⚗️',
    ingredients: ['1 Blaze Rod', '3 Cobblestone'],
    description: 'Brew potions using water bottles and ingredients.',
  },
  {
    name: 'Cauldron',
    category: 'Brewing',
    grid: [
      [I.IRON, null, I.IRON],
      [I.IRON, null, I.IRON],
      [I.IRON, I.IRON, I.IRON],
    ],
    result: '🫙',
    ingredients: ['7 Iron Ingots'],
    description: 'Holds water, lava, or potions. Wash dye from armor.',
  },
  {
    name: 'Glass Bottle',
    category: 'Brewing',
    grid: [
      [null, null, null],
      [I.GLASS, null, I.GLASS],
      [null, I.GLASS, null],
    ],
    result: '🧪',
    resultCount: 3,
    ingredients: ['3 Glass'],
    description: 'Fill with water to start brewing. Crafts 3.',
  },
  {
    name: 'Blaze Powder',
    category: 'Brewing',
    grid: [
      [null, I.BLAZE_ROD, null],
      [null, null, null],
      [null, null, null],
    ],
    result: '✨',
    resultCount: 2,
    ingredients: ['1 Blaze Rod'],
    description: 'Fuels the brewing stand. Also used in Eyes of Ender.',
  },
  {
    name: 'Fermented Spider Eye',
    category: 'Brewing',
    grid: [
      [null, null, null],
      ['🕷️', '🟤', null],
      [null, I.SUGAR, null],
    ],
    result: '👁️',
    ingredients: ['1 Spider Eye', '1 Brown Mushroom', '1 Sugar'],
    description: 'Key brewing modifier. Makes negative/inverted potions.',
  },
  {
    name: 'Magma Cream',
    category: 'Brewing',
    grid: [
      [null, null, null],
      [null, I.SLIME, null],
      [null, '✨', null],
    ],
    result: '🟠',
    ingredients: ['1 Slimeball', '1 Blaze Powder'],
    description: 'Used to brew Fire Resistance potions.',
  },
  {
    name: 'Eye of Ender',
    category: 'Brewing',
    grid: [
      [null, null, null],
      [null, I.ENDER_PEARL, null],
      [null, '✨', null],
    ],
    result: '👁️',
    ingredients: ['1 Ender Pearl', '1 Blaze Powder'],
    description: 'Locates strongholds and activates End portals.',
  },

  // ═══ TRANSPORTATION ═══
  {
    name: 'Boat (Oak)',
    category: 'Transportation',
    grid: [
      [null, null, null],
      [I.PLANK, null, I.PLANK],
      [I.PLANK, I.PLANK, I.PLANK],
    ],
    result: '🚣',
    ingredients: ['5 Wooden Planks'],
    description: 'Travel across water fast. Also works on ice!',
  },
  {
    name: 'Minecart',
    category: 'Transportation',
    grid: [
      [null, null, null],
      [I.IRON, null, I.IRON],
      [I.IRON, I.IRON, I.IRON],
    ],
    result: '🛒',
    ingredients: ['5 Iron Ingots'],
    description: 'Ride on rails. Combine with chest, hopper, TNT, or furnace.',
  },
  {
    name: 'Rail',
    category: 'Transportation',
    grid: [
      [I.IRON, null, I.IRON],
      [I.IRON, I.STICK, I.IRON],
      [I.IRON, null, I.IRON],
    ],
    result: '🛤️',
    resultCount: 16,
    ingredients: ['6 Iron Ingots', '1 Stick'],
    description: 'Minecart tracks. Place on ground. Crafts 16.',
  },
  {
    name: 'Powered Rail',
    category: 'Transportation',
    grid: [
      [I.GOLD, null, I.GOLD],
      [I.GOLD, I.STICK, I.GOLD],
      [I.GOLD, I.REDSTONE, I.GOLD],
    ],
    result: '🛤️',
    resultCount: 6,
    ingredients: ['6 Gold Ingots', '1 Stick', '1 Redstone Dust'],
    description: 'Accelerates minecarts when powered. Crafts 6.',
  },
  {
    name: 'Detector Rail',
    category: 'Transportation',
    grid: [
      [I.IRON, null, I.IRON],
      [I.IRON, I.REDSTONE, I.IRON],
      [I.IRON, I.REDSTONE, I.IRON],
    ],
    result: '🛤️',
    resultCount: 6,
    ingredients: ['6 Iron Ingots', '1 Stone Pressure Plate', '1 Redstone Dust'],
    description: 'Outputs redstone signal when a minecart passes. Crafts 6.',
  },
  {
    name: 'Saddle (find only)',
    category: 'Transportation',
    grid: [
      [I.LEATHER, I.LEATHER, I.LEATHER],
      [I.LEATHER, null, I.LEATHER],
      [I.IRON, null, I.IRON],
    ],
    result: '🐴',
    ingredients: ['Cannot be crafted!'],
    description: 'Found in dungeons, temples, and fishing. Ride horses, pigs, and striders.',
  },
  {
    name: 'Lead',
    category: 'Transportation',
    grid: [
      [I.STRING, I.STRING, null],
      [I.STRING, I.SLIME, null],
      [null, null, I.STRING],
    ],
    result: '🪢',
    resultCount: 2,
    ingredients: ['4 Strings', '1 Slimeball'],
    description: 'Leash mobs and tie them to fences. Crafts 2.',
  },

  // ═══ MISC ═══
  {
    name: 'Wooden Planks',
    category: 'Misc',
    grid: [
      [null, I.OAK, null],
      [null, null, null],
      [null, null, null],
    ],
    result: '🟫',
    resultCount: 4,
    ingredients: ['1 Log (any wood type)'],
    description: 'The most basic building block. 1 log = 4 planks.',
  },
  {
    name: 'Sticks',
    category: 'Misc',
    grid: [
      [null, I.PLANK, null],
      [null, I.PLANK, null],
      [null, null, null],
    ],
    result: '🥢',
    resultCount: 4,
    ingredients: ['2 Wooden Planks'],
    description: 'Essential component for tools, weapons, and more. Crafts 4.',
  },
  {
    name: 'Book',
    category: 'Misc',
    grid: [
      [null, null, null],
      [I.PAPER, null, null],
      [I.PAPER, I.LEATHER, I.PAPER],
    ],
    result: '📕',
    ingredients: ['3 Paper', '1 Leather'],
    description: 'Used for bookshelves and enchanting table.',
  },
  {
    name: 'Paper',
    category: 'Misc',
    grid: [
      [null, null, null],
      [I.SUGAR_CANE, I.SUGAR_CANE, I.SUGAR_CANE],
      [null, null, null],
    ],
    result: '📄',
    resultCount: 3,
    ingredients: ['3 Sugar Cane'],
    description: 'Used to craft books, maps, and firework rockets.',
  },
  {
    name: 'Map (Empty)',
    category: 'Misc',
    grid: [
      [I.PAPER, I.PAPER, I.PAPER],
      [I.PAPER, '🧭', I.PAPER],
      [I.PAPER, I.PAPER, I.PAPER],
    ],
    result: '🗺️',
    ingredients: ['8 Paper', '1 Compass'],
    description: 'Reveals terrain as you explore. Use a cartography table to expand.',
  },
  {
    name: 'Enchanting Table',
    category: 'Misc',
    grid: [
      [null, I.BOOK, null],
      [I.DIAMOND, I.OBSIDIAN, I.DIAMOND],
      [I.OBSIDIAN, I.OBSIDIAN, I.OBSIDIAN],
    ],
    result: '📖',
    ingredients: ['1 Book', '2 Diamonds', '4 Obsidian'],
    description: 'Enchant tools and armor. Surround with bookshelves for max level.',
  },
  {
    name: 'Anvil',
    category: 'Misc',
    grid: [
      [I.IRON, I.IRON, I.IRON],
      [null, I.IRON, null],
      [I.IRON, I.IRON, I.IRON],
    ],
    result: '🔨',
    ingredients: ['3 Iron Blocks', '4 Iron Ingots'],
    description: 'Repair, rename, and combine enchanted items.',
  },
  {
    name: 'Grindstone',
    category: 'Misc',
    grid: [
      [I.STICK, I.STONE, I.STICK],
      [I.PLANK, null, I.PLANK],
      [null, null, null],
    ],
    result: '⚙️',
    ingredients: ['2 Sticks', '1 Stone Slab', '2 Wooden Planks'],
    description: 'Remove enchantments and repair items. Returns some XP.',
  },
  {
    name: 'Smithing Table',
    category: 'Misc',
    grid: [
      [I.IRON, I.IRON, null],
      [I.PLANK, I.PLANK, null],
      [I.PLANK, I.PLANK, null],
    ],
    result: '🔨',
    ingredients: ['2 Iron Ingots', '4 Wooden Planks'],
    description: 'Upgrade diamond gear to netherite. Also a villager job block.',
  },
  {
    name: 'Loom',
    category: 'Misc',
    grid: [
      [null, null, null],
      [I.STRING, I.STRING, null],
      [I.PLANK, I.PLANK, null],
    ],
    result: '🧶',
    ingredients: ['2 Strings', '2 Wooden Planks'],
    description: 'Apply patterns to banners easily.',
  },
  {
    name: 'Cartography Table',
    category: 'Misc',
    grid: [
      [I.PAPER, I.PAPER, null],
      [I.PLANK, I.PLANK, null],
      [I.PLANK, I.PLANK, null],
    ],
    result: '🗺️',
    ingredients: ['2 Paper', '4 Wooden Planks'],
    description: 'Zoom, clone, and lock maps.',
  },
  {
    name: 'Fletching Table',
    category: 'Misc',
    grid: [
      [I.FLINT, I.FLINT, null],
      [I.PLANK, I.PLANK, null],
      [I.PLANK, I.PLANK, null],
    ],
    result: '🏹',
    ingredients: ['2 Flint', '4 Wooden Planks'],
    description: 'Fletcher villager job block. No player crafting use yet.',
  },
  {
    name: 'Stonecutter',
    category: 'Misc',
    grid: [
      [null, null, null],
      [null, I.IRON, null],
      [I.STONE, I.STONE, I.STONE],
    ],
    result: '🪨',
    ingredients: ['1 Iron Ingot', '3 Stone'],
    description: 'Cut stone variants precisely. More efficient than crafting.',
  },
  {
    name: 'Campfire',
    category: 'Misc',
    grid: [
      [null, I.STICK, null],
      [I.STICK, I.COAL, I.STICK],
      [I.OAK, I.OAK, I.OAK],
    ],
    result: '🏕️',
    ingredients: ['3 Sticks', '1 Coal/Charcoal', '3 Logs'],
    description: 'Cook 4 items slowly. Also sends smoke signals and a cozy light.',
  },
  {
    name: 'Scaffolding',
    category: 'Misc',
    grid: [
      [I.BAMBOO, I.STRING, I.BAMBOO],
      [I.BAMBOO, null, I.BAMBOO],
      [I.BAMBOO, null, I.BAMBOO],
    ],
    result: '🪜',
    resultCount: 6,
    ingredients: ['6 Bamboo', '1 String'],
    description: 'Stackable temporary building platform. Easy to break. Crafts 6.',
  },
  {
    name: 'Firework Rocket',
    category: 'Misc',
    grid: [
      [null, null, null],
      [null, I.GUNPOWDER, null],
      [null, I.PAPER, null],
    ],
    result: '🎆',
    resultCount: 3,
    ingredients: ['1 Paper', '1 Gunpowder'],
    description: 'Boost Elytra flight. Add firework stars for effects. Crafts 3.',
  },
  {
    name: 'Jack o\'Lantern',
    category: 'Misc',
    grid: [
      [null, I.PUMPKIN, null],
      [null, I.TORCH, null],
      [null, null, null],
    ],
    result: '🎃',
    ingredients: ['1 Carved Pumpkin', '1 Torch'],
    description: 'Light source that works underwater. Spooky decoration.',
  },
  {
    name: 'Snow Block',
    category: 'Misc',
    grid: [
      [I.SNOWBALL, I.SNOWBALL, null],
      [I.SNOWBALL, I.SNOWBALL, null],
      [null, null, null],
    ],
    result: '⬜',
    ingredients: ['4 Snowballs'],
    description: 'Compact snowball storage. Place 2 to make a Snow Golem.',
  },
  {
    name: 'Bone Meal',
    category: 'Misc',
    grid: [
      [null, I.BONE, null],
      [null, null, null],
      [null, null, null],
    ],
    result: '🤍',
    resultCount: 3,
    ingredients: ['1 Bone'],
    description: 'Fertilize crops to grow instantly. Also white dye. Crafts 3.',
  },
];

// ─── Category info ───────────────────────────────────
const CATEGORIES: { id: Category; label: string; emoji: string; color: string }[] = [
  { id: 'All', label: 'All', emoji: '📖', color: 'bg-gray-600' },
  { id: 'Tools', label: 'Tools', emoji: '⛏️', color: 'bg-amber-700' },
  { id: 'Weapons', label: 'Weapons', emoji: '🗡️', color: 'bg-red-700' },
  { id: 'Armor', label: 'Armor', emoji: '🛡️', color: 'bg-sky-700' },
  { id: 'Building', label: 'Building', emoji: '🧱', color: 'bg-orange-700' },
  { id: 'Decoration', label: 'Decoration', emoji: '🖼️', color: 'bg-pink-700' },
  { id: 'Redstone', label: 'Redstone', emoji: '🔴', color: 'bg-red-900' },
  { id: 'Food', label: 'Food', emoji: '🍞', color: 'bg-yellow-700' },
  { id: 'Brewing', label: 'Brewing', emoji: '⚗️', color: 'bg-purple-700' },
  { id: 'Transportation', label: 'Transport', emoji: '🚣', color: 'bg-cyan-700' },
  { id: 'Misc', label: 'Misc', emoji: '📦', color: 'bg-emerald-700' },
];

// ─── Crafting Grid Component ─────────────────────────
function CraftingGrid({ recipe }: { recipe: Recipe }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-0.5 bg-amber-900/60 p-1.5 rounded-lg border border-amber-800/40 shrink-0">
        {recipe.grid.flat().map((cell, i) => (
          <div
            key={i}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-stone-800/80 rounded text-base sm:text-lg border border-stone-700/30"
            title={cell || 'Empty'}
          >
            {cell || ''}
          </div>
        ))}
      </div>

      {/* Arrow */}
      <div className="text-2xl sm:text-3xl text-amber-400 shrink-0">→</div>

      {/* Result */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-amber-900/40 rounded-lg border-2 border-amber-600/50 text-2xl sm:text-3xl relative shrink-0">
        {recipe.result}
        {recipe.resultCount && recipe.resultCount > 1 && (
          <span className="absolute -bottom-1 -right-1 text-[10px] sm:text-xs bg-amber-700 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
            {recipe.resultCount}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Recipe Card Component ───────────────────────────
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const cat = CATEGORIES.find((c) => c.id === recipe.category);
  return (
    <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/[0.07] transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
          {recipe.name}
        </h3>
        <span
          className={`${cat?.color} text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2`}
        >
          {cat?.emoji} {cat?.label}
        </span>
      </div>

      {/* Grid */}
      <CraftingGrid recipe={recipe} />

      {/* Ingredients */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {recipe.ingredients.map((ing, i) => (
          <span
            key={i}
            className="text-[11px] sm:text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full"
          >
            {ing}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed">
        {recipe.description}
      </p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────
export default function CraftingGuidePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const { name: playerName, hasName } = usePlayerName();

  const filtered = useMemo(() => {
    let recipes = RECIPES;
    if (category !== 'All') {
      recipes = recipes.filter((r) => r.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      recipes = recipes.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
          r.category.toLowerCase().includes(q)
      );
    }
    return recipes;
  }, [search, category]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: RECIPES.length };
    RECIPES.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <a
          href="/games/"
          className="text-gray-400 hover:text-white text-sm mb-4 inline-block transition-colors"
        >
          ← Back to Games
        </a>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2">
          📖 Minecraft Crafting Guide
        </h1>
        <p className="text-center text-gray-400 text-base sm:text-lg mb-1">
          {hasName ? (
            <>
              Hey <span className="text-amber-400 font-semibold">{playerName}</span>! Your
              complete crafting recipe reference.
            </>
          ) : (
            'Every recipe you need — search, filter, and craft!'
          )}
        </p>
        <p className="text-center text-gray-500 text-xs sm:text-sm">
          {RECIPES.length} recipes • Visual crafting grids • Free & No Ads
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Search Box */}
        <div className="mb-5">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes... (e.g. pickaxe, iron, redstone)"
              className="w-full px-4 py-3 pl-11 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm sm:text-base"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              🔍
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  category === cat.id
                    ? `${cat.color} ring-2 ring-white/30 text-white scale-105`
                    : 'bg-white/[0.06] text-gray-400 hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                {cat.emoji} {cat.label}
                <span className="ml-1 opacity-60">({counts[cat.id] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-500">
          {filtered.length === RECIPES.length
            ? `Showing all ${RECIPES.length} recipes`
            : `${filtered.length} recipe${filtered.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Recipe Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((recipe, i) => (
              <RecipeCard key={`${recipe.name}-${i}`} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">No recipes found for &ldquo;{search}&rdquo;</p>
            <p className="text-sm mt-2">Try a different search term or clear filters</p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
              }}
              className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Cross-promo cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-800/20">
            <h3 className="text-lg font-semibold mb-2">🎨 Design Your Skin</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create a custom Minecraft skin to match your crafting style.
            </p>
            <a
              href="/games/skin-creator/"
              className="inline-block px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            >
              Open Skin Creator →
            </a>
          </div>
          <div className="p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-800/20">
            <h3 className="text-lg font-semibold mb-2">⚒️ Get a Cool Name</h3>
            <p className="text-gray-400 text-sm mb-4">
              Generate unique Minecraft usernames — cool, funny, or pro.
            </p>
            <a
              href="/games/name-generator/"
              className="inline-block px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            >
              Name Generator →
            </a>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 space-y-8 text-gray-400 text-sm">
          <h2 className="text-2xl font-bold text-gray-200">
            Complete Minecraft Crafting Guide
          </h2>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              🔨 How Crafting Works in Minecraft
            </h3>
            <p className="leading-relaxed">
              Crafting is the core mechanic of Minecraft. You combine raw materials in specific
              patterns on a crafting grid to create tools, weapons, armor, and building materials.
              Your inventory has a 2×2 grid for simple recipes, but most items require a{' '}
              <strong className="text-gray-200">Crafting Table</strong> which provides the full
              3×3 grid. Place materials in the correct pattern and the result appears in the
              output slot.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              ⚡ Essential Crafting Progression
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>Punch a tree</strong> → Get logs → Craft <em>Wooden Planks</em>
              </li>
              <li>
                Craft a <strong>Crafting Table</strong> (4 planks in 2×2)
              </li>
              <li>
                Make <strong>Sticks</strong> + <strong>Wooden Pickaxe</strong>
              </li>
              <li>
                Mine stone → Craft <strong>Stone Tools</strong> + <strong>Furnace</strong>
              </li>
              <li>
                Mine coal → Make <strong>Torches</strong>
              </li>
              <li>
                Find iron → Smelt → <strong>Iron Tools &amp; Armor</strong>
              </li>
              <li>
                Mine diamonds → <strong>Diamond Gear</strong> + <strong>Enchanting Table</strong>
              </li>
              <li>
                Enter the Nether → Get blaze rods → <strong>Brewing Stand</strong> + Eyes of Ender
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              💡 Crafting Tips & Tricks
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Some recipes are <strong>shapeless</strong> — ingredients can go in any slot (e.g.,
                Mushroom Stew, Pumpkin Pie)
              </li>
              <li>
                Many tools are <strong>mirrored</strong> — the axe pattern works flipped
                horizontally too
              </li>
              <li>
                Use the <strong>Recipe Book</strong> (green book icon) in-game for visual recipe
                hints
              </li>
              <li>
                <strong>Stonecutter</strong> is more efficient than crafting for stone variants
              </li>
              <li>
                <strong>Logs → Planks</strong> is always 1:4 ratio regardless of wood type
              </li>
              <li>
                Combine two damaged tools of the same type in the crafting grid to{' '}
                <strong>repair</strong> them
              </li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">
            ❓ Frequently Asked Questions
          </h2>

          {[
            {
              q: 'How do I use a crafting table in Minecraft?',
              a: 'Place 4 wooden planks in a 2×2 grid in your inventory crafting area to create a crafting table. Place it on the ground and right-click (or tap) to open the 3×3 crafting grid, which lets you craft all recipes.',
            },
            {
              q: 'What are the most important things to craft first?',
              a: 'Start with wooden planks, sticks, a crafting table, and a wooden pickaxe. Then craft a furnace to smelt ores, stone tools for better efficiency, a sword for defense, and a bed to set your spawn point and skip the night.',
            },
            {
              q: 'How many crafting recipes are in Minecraft?',
              a: 'Minecraft has over 380 crafting recipes as of the latest version, including tools, weapons, armor, building blocks, redstone components, food, brewing ingredients, and decorative items. New recipes are added with each major update.',
            },
            {
              q: 'What is the difference between Java and Bedrock crafting?',
              a: 'Most crafting recipes are identical between Java and Bedrock editions. The main differences are in some redstone mechanics and a few edition-exclusive items. All core recipes for tools, weapons, armor, and building blocks are the same in both versions.',
            },
            {
              q: 'Can I craft Netherite tools directly?',
              a: 'No! You cannot craft Netherite tools from scratch. First craft Diamond tools, then upgrade them at a Smithing Table using a Netherite Upgrade Smithing Template and a Netherite Ingot. Netherite Ingots are crafted from 4 Netherite Scraps + 4 Gold Ingots.',
            },
            {
              q: 'What items cannot be crafted in Minecraft?',
              a: 'Several items can only be found, not crafted: Saddle, Name Tag, Elytra, Trident, Horse Armor, Enchanted Golden Apple, Music Discs, and most Smithing Templates. These are obtained from dungeon loot, fishing, trading, or mob drops.',
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="bg-white/[0.04] border border-white/10 rounded-xl group"
            >
              <summary className="px-5 py-4 cursor-pointer font-semibold text-gray-200 hover:text-amber-300 transition-colors list-none flex items-center justify-between text-sm sm:text-base">
                {faq.q}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">
                  ▼
                </span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        {/* More tools */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="/games/skin-creator/"
            className="p-4 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-center transition-all border border-white/5"
          >
            <div className="text-3xl mb-2">🎨</div>
            <div className="font-semibold text-sm">Skin Creator</div>
            <div className="text-xs text-gray-500">Design MC skins</div>
          </a>
          <a
            href="/games/name-generator/"
            className="p-4 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-center transition-all border border-white/5"
          >
            <div className="text-3xl mb-2">⚒️</div>
            <div className="font-semibold text-sm">Name Generator</div>
            <div className="text-xs text-gray-500">Cool usernames</div>
          </a>
          <a
            href="/games/enchant-calc/"
            className="p-4 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-center transition-all border border-white/5"
          >
            <div className="text-3xl mb-2">✨</div>
            <div className="font-semibold text-sm">Enchant Calc</div>
            <div className="text-xs text-gray-500">Plan enchants</div>
          </a>
          <a
            href="/games/banner-maker/"
            className="p-4 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-center transition-all border border-white/5"
          >
            <div className="text-3xl mb-2">🏳️</div>
            <div className="font-semibold text-sm">Banner Maker</div>
            <div className="text-xs text-gray-500">Design banners</div>
          </a>
        </div>
      </div>
    </div>
  );
}
