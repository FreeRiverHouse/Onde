export interface MinecraftBlock {
  id: string;
  name: string;
  color: [number, number, number]; // RGB
  hex: string;
  category: 'wool' | 'concrete' | 'terracotta';
}

// Accurate Minecraft block colors (Java Edition average face colors)
export const MINECRAFT_BLOCKS: MinecraftBlock[] = [
  // === WOOL ===
  { id: 'white_wool', name: 'White Wool', color: [233, 236, 236], hex: '#e9ecec', category: 'wool' },
  { id: 'orange_wool', name: 'Orange Wool', color: [240, 118, 19], hex: '#f07613', category: 'wool' },
  { id: 'magenta_wool', name: 'Magenta Wool', color: [189, 68, 179], hex: '#bd44b3', category: 'wool' },
  { id: 'light_blue_wool', name: 'Light Blue Wool', color: [58, 175, 217], hex: '#3aafd9', category: 'wool' },
  { id: 'yellow_wool', name: 'Yellow Wool', color: [248, 198, 39], hex: '#f8c627', category: 'wool' },
  { id: 'lime_wool', name: 'Lime Wool', color: [112, 185, 25], hex: '#70b919', category: 'wool' },
  { id: 'pink_wool', name: 'Pink Wool', color: [237, 141, 172], hex: '#ed8dac', category: 'wool' },
  { id: 'gray_wool', name: 'Gray Wool', color: [62, 68, 71], hex: '#3e4447', category: 'wool' },
  { id: 'light_gray_wool', name: 'Light Gray Wool', color: [142, 142, 134], hex: '#8e8e86', category: 'wool' },
  { id: 'cyan_wool', name: 'Cyan Wool', color: [21, 137, 145], hex: '#158991', category: 'wool' },
  { id: 'purple_wool', name: 'Purple Wool', color: [121, 42, 172], hex: '#792aac', category: 'wool' },
  { id: 'blue_wool', name: 'Blue Wool', color: [53, 57, 157], hex: '#35399d', category: 'wool' },
  { id: 'brown_wool', name: 'Brown Wool', color: [114, 71, 40], hex: '#724728', category: 'wool' },
  { id: 'green_wool', name: 'Green Wool', color: [84, 109, 27], hex: '#546d1b', category: 'wool' },
  { id: 'red_wool', name: 'Red Wool', color: [160, 39, 34], hex: '#a02722', category: 'wool' },
  { id: 'black_wool', name: 'Black Wool', color: [20, 21, 25], hex: '#141519', category: 'wool' },

  // === CONCRETE ===
  { id: 'white_concrete', name: 'White Concrete', color: [207, 213, 214], hex: '#cfd5d6', category: 'concrete' },
  { id: 'orange_concrete', name: 'Orange Concrete', color: [224, 97, 0], hex: '#e06100', category: 'concrete' },
  { id: 'magenta_concrete', name: 'Magenta Concrete', color: [169, 48, 159], hex: '#a9309f', category: 'concrete' },
  { id: 'light_blue_concrete', name: 'Light Blue Concrete', color: [35, 137, 198], hex: '#2389c6', category: 'concrete' },
  { id: 'yellow_concrete', name: 'Yellow Concrete', color: [240, 175, 21], hex: '#f0af15', category: 'concrete' },
  { id: 'lime_concrete', name: 'Lime Concrete', color: [94, 168, 24], hex: '#5ea818', category: 'concrete' },
  { id: 'pink_concrete', name: 'Pink Concrete', color: [213, 101, 142], hex: '#d5658e', category: 'concrete' },
  { id: 'gray_concrete', name: 'Gray Concrete', color: [54, 57, 61], hex: '#36393d', category: 'concrete' },
  { id: 'light_gray_concrete', name: 'Light Gray Concrete', color: [125, 125, 115], hex: '#7d7d73', category: 'concrete' },
  { id: 'cyan_concrete', name: 'Cyan Concrete', color: [21, 119, 136], hex: '#157788', category: 'concrete' },
  { id: 'purple_concrete', name: 'Purple Concrete', color: [100, 31, 156], hex: '#641f9c', category: 'concrete' },
  { id: 'blue_concrete', name: 'Blue Concrete', color: [44, 46, 143], hex: '#2c2e8f', category: 'concrete' },
  { id: 'brown_concrete', name: 'Brown Concrete', color: [96, 59, 31], hex: '#603b1f', category: 'concrete' },
  { id: 'green_concrete', name: 'Green Concrete', color: [73, 91, 36], hex: '#495b24', category: 'concrete' },
  { id: 'red_concrete', name: 'Red Concrete', color: [142, 32, 32], hex: '#8e2020', category: 'concrete' },
  { id: 'black_concrete', name: 'Black Concrete', color: [8, 10, 15], hex: '#080a0f', category: 'concrete' },

  // === TERRACOTTA (Glazed-style / Stained) ===
  { id: 'white_terracotta', name: 'White Terracotta', color: [209, 178, 161], hex: '#d1b2a1', category: 'terracotta' },
  { id: 'orange_terracotta', name: 'Orange Terracotta', color: [161, 83, 37], hex: '#a15325', category: 'terracotta' },
  { id: 'magenta_terracotta', name: 'Magenta Terracotta', color: [149, 88, 108], hex: '#95586c', category: 'terracotta' },
  { id: 'light_blue_terracotta', name: 'Light Blue Terracotta', color: [113, 108, 137], hex: '#716c89', category: 'terracotta' },
  { id: 'yellow_terracotta', name: 'Yellow Terracotta', color: [186, 133, 35], hex: '#ba8523', category: 'terracotta' },
  { id: 'lime_terracotta', name: 'Lime Terracotta', color: [103, 117, 52], hex: '#677534', category: 'terracotta' },
  { id: 'pink_terracotta', name: 'Pink Terracotta', color: [161, 78, 78], hex: '#a14e4e', category: 'terracotta' },
  { id: 'gray_terracotta', name: 'Gray Terracotta', color: [57, 42, 35], hex: '#392a23', category: 'terracotta' },
  { id: 'light_gray_terracotta', name: 'Light Gray Terracotta', color: [135, 106, 97], hex: '#876a61', category: 'terracotta' },
  { id: 'cyan_terracotta', name: 'Cyan Terracotta', color: [86, 91, 91], hex: '#565b5b', category: 'terracotta' },
  { id: 'purple_terracotta', name: 'Purple Terracotta', color: [118, 70, 86], hex: '#764656', category: 'terracotta' },
  { id: 'blue_terracotta', name: 'Blue Terracotta', color: [74, 59, 91], hex: '#4a3b5b', category: 'terracotta' },
  { id: 'brown_terracotta', name: 'Brown Terracotta', color: [77, 51, 35], hex: '#4d3323', category: 'terracotta' },
  { id: 'green_terracotta', name: 'Green Terracotta', color: [76, 83, 42], hex: '#4c532a', category: 'terracotta' },
  { id: 'red_terracotta', name: 'Red Terracotta', color: [143, 61, 46], hex: '#8f3d2e', category: 'terracotta' },
  { id: 'black_terracotta', name: 'Black Terracotta', color: [37, 22, 16], hex: '#251610', category: 'terracotta' },
];

/**
 * Calculate Euclidean color distance in RGB space.
 * Uses weighted formula that accounts for human perception.
 */
export function colorDistance(
  c1: [number, number, number],
  c2: [number, number, number]
): number {
  // Weighted Euclidean distance (redmean approximation)
  const rmean = (c1[0] + c2[0]) / 2;
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return Math.sqrt(
    (2 + rmean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rmean) / 256) * db * db
  );
}

/**
 * Find the closest Minecraft block to a given RGB color.
 */
export function findClosestBlock(
  color: [number, number, number],
  blocks: MinecraftBlock[]
): MinecraftBlock {
  let closest = blocks[0];
  let minDist = Infinity;

  for (const block of blocks) {
    const dist = colorDistance(color, block.color);
    if (dist < minDist) {
      minDist = dist;
      closest = block;
    }
  }

  return closest;
}
