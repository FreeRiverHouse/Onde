#!/usr/bin/env node

/**
 * Generate base Minecraft skin templates (64x64 PNG)
 * Steve, Alex, Zombie, Creeper
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const OUTPUT_DIR = path.join(__dirname, '../public/games/skin-templates');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function createSkin(name, drawFn) {
  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d');
  
  // Transparent background
  ctx.clearRect(0, 0, 64, 64);
  
  // Draw the skin
  drawFn(ctx);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(OUTPUT_DIR, `${name}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Created ${filePath}`);
}

// ========== STEVE ==========
function drawSteve(ctx) {
  const skin = '#c4a57b';
  const hair = '#442920';
  const shirt = '#00a8a8';
  const pants = '#3c2a5e';
  const shoes = '#444444';
  const white = '#ffffff';
  const pupil = '#5a3825';

  // HEAD (8x8 front face at 8,8)
  ctx.fillStyle = skin;
  ctx.fillRect(8, 8, 8, 8);   // front
  ctx.fillRect(0, 8, 8, 8);   // right
  ctx.fillRect(16, 8, 8, 8);  // left
  ctx.fillRect(24, 8, 8, 8);  // back
  
  // Hair on top and forehead
  ctx.fillStyle = hair;
  ctx.fillRect(8, 0, 8, 8);   // top of head
  ctx.fillRect(8, 8, 8, 1);   // front hairline
  ctx.fillRect(8, 8, 1, 3);   // left side
  ctx.fillRect(15, 8, 1, 3);  // right side
  ctx.fillRect(0, 8, 8, 2);   // right side hair
  ctx.fillRect(16, 8, 8, 2);  // left side hair
  ctx.fillRect(24, 8, 8, 2);  // back hair
  ctx.fillRect(16, 0, 8, 8);  // bottom (under chin) - skin color actually
  ctx.fillStyle = skin;
  ctx.fillRect(16, 0, 8, 8);
  
  // Eyes (white part)
  ctx.fillStyle = white;
  ctx.fillRect(9, 11, 2, 2);
  ctx.fillRect(13, 11, 2, 2);
  
  // Pupils
  ctx.fillStyle = pupil;
  ctx.fillRect(10, 12, 1, 1);
  ctx.fillRect(14, 12, 1, 1);
  
  // Nose
  ctx.fillStyle = '#a87d5a';
  ctx.fillRect(11, 13, 2, 1);
  
  // Mouth
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(10, 15, 4, 1);

  // BODY (8x12 front at 20,20)
  ctx.fillStyle = shirt;
  ctx.fillRect(20, 20, 8, 12);  // front
  ctx.fillRect(16, 20, 4, 12);  // right side
  ctx.fillRect(28, 20, 4, 12);  // left side
  ctx.fillRect(32, 20, 8, 12);  // back
  ctx.fillRect(20, 16, 8, 4);   // top
  ctx.fillRect(28, 16, 8, 4);   // bottom

  // RIGHT ARM (4x12 at 44,20)
  ctx.fillStyle = shirt;
  ctx.fillRect(44, 20, 4, 4);   // sleeve
  ctx.fillRect(40, 20, 4, 4);
  ctx.fillRect(48, 20, 4, 4);
  ctx.fillRect(52, 20, 4, 4);
  ctx.fillStyle = skin;
  ctx.fillRect(44, 24, 4, 8);   // arm/hand
  ctx.fillRect(40, 24, 4, 8);
  ctx.fillRect(48, 24, 4, 8);
  ctx.fillRect(52, 24, 4, 8);
  ctx.fillRect(44, 16, 4, 4);   // top
  ctx.fillRect(48, 16, 4, 4);   // bottom

  // LEFT ARM (4x12 at 36,52)
  ctx.fillStyle = shirt;
  ctx.fillRect(36, 52, 4, 4);
  ctx.fillRect(32, 52, 4, 4);
  ctx.fillRect(40, 52, 4, 4);
  ctx.fillRect(44, 52, 4, 4);
  ctx.fillStyle = skin;
  ctx.fillRect(36, 56, 4, 8);
  ctx.fillRect(32, 56, 4, 8);
  ctx.fillRect(40, 56, 4, 8);
  ctx.fillRect(44, 56, 4, 8);
  ctx.fillRect(36, 48, 4, 4);
  ctx.fillRect(40, 48, 4, 4);

  // RIGHT LEG (4x12 at 4,20)
  ctx.fillStyle = pants;
  ctx.fillRect(4, 20, 4, 12);
  ctx.fillRect(0, 20, 4, 12);
  ctx.fillRect(8, 20, 4, 12);
  ctx.fillRect(12, 20, 4, 12);
  ctx.fillStyle = shoes;
  ctx.fillRect(4, 28, 4, 4);
  ctx.fillRect(0, 28, 4, 4);
  ctx.fillRect(8, 28, 4, 4);
  ctx.fillRect(12, 28, 4, 4);
  ctx.fillRect(4, 16, 4, 4);
  ctx.fillRect(8, 16, 4, 4);

  // LEFT LEG (4x12 at 20,52)
  ctx.fillStyle = pants;
  ctx.fillRect(20, 52, 4, 12);
  ctx.fillRect(16, 52, 4, 12);
  ctx.fillRect(24, 52, 4, 12);
  ctx.fillRect(28, 52, 4, 12);
  ctx.fillStyle = shoes;
  ctx.fillRect(20, 60, 4, 4);
  ctx.fillRect(16, 60, 4, 4);
  ctx.fillRect(24, 60, 4, 4);
  ctx.fillRect(28, 60, 4, 4);
  ctx.fillRect(20, 48, 4, 4);
  ctx.fillRect(24, 48, 4, 4);
}

// ========== ALEX ==========
function drawAlex(ctx) {
  const skin = '#ffdfc4';
  const hair = '#c76b29';  // Orange/ginger hair
  const shirt = '#4a8f4a';  // Green shirt
  const pants = '#6b4423';  // Brown pants
  const shoes = '#2c2c2c';
  const white = '#ffffff';
  const pupil = '#2c7a2c';  // Green eyes

  // HEAD
  ctx.fillStyle = skin;
  ctx.fillRect(8, 8, 8, 8);
  ctx.fillRect(0, 8, 8, 8);
  ctx.fillRect(16, 8, 8, 8);
  ctx.fillRect(24, 8, 8, 8);
  
  // Hair - longer, more flowing
  ctx.fillStyle = hair;
  ctx.fillRect(8, 0, 8, 8);
  ctx.fillRect(8, 8, 8, 2);
  ctx.fillRect(8, 8, 2, 4);
  ctx.fillRect(14, 8, 2, 4);
  ctx.fillRect(0, 8, 8, 4);
  ctx.fillRect(16, 8, 8, 4);
  ctx.fillRect(24, 8, 8, 3);
  ctx.fillRect(16, 0, 8, 8);
  ctx.fillStyle = skin;
  ctx.fillRect(16, 0, 8, 8);
  
  // Eyes
  ctx.fillStyle = white;
  ctx.fillRect(9, 11, 2, 2);
  ctx.fillRect(13, 11, 2, 2);
  ctx.fillStyle = pupil;
  ctx.fillRect(10, 12, 1, 1);
  ctx.fillRect(14, 12, 1, 1);
  
  // Nose & mouth
  ctx.fillStyle = '#e8b896';
  ctx.fillRect(11, 13, 2, 1);
  ctx.fillStyle = '#c97878';
  ctx.fillRect(10, 15, 4, 1);

  // BODY
  ctx.fillStyle = shirt;
  ctx.fillRect(20, 20, 8, 12);
  ctx.fillRect(16, 20, 4, 12);
  ctx.fillRect(28, 20, 4, 12);
  ctx.fillRect(32, 20, 8, 12);
  ctx.fillRect(20, 16, 8, 4);
  ctx.fillRect(28, 16, 8, 4);

  // ARMS (Alex has 3px wide arms - slim model)
  ctx.fillStyle = shirt;
  ctx.fillRect(44, 20, 4, 4);
  ctx.fillRect(40, 20, 4, 4);
  ctx.fillRect(48, 20, 4, 4);
  ctx.fillRect(52, 20, 4, 4);
  ctx.fillStyle = skin;
  ctx.fillRect(44, 24, 4, 8);
  ctx.fillRect(40, 24, 4, 8);
  ctx.fillRect(48, 24, 4, 8);
  ctx.fillRect(52, 24, 4, 8);
  ctx.fillRect(44, 16, 4, 4);
  ctx.fillRect(48, 16, 4, 4);

  ctx.fillStyle = shirt;
  ctx.fillRect(36, 52, 4, 4);
  ctx.fillRect(32, 52, 4, 4);
  ctx.fillRect(40, 52, 4, 4);
  ctx.fillRect(44, 52, 4, 4);
  ctx.fillStyle = skin;
  ctx.fillRect(36, 56, 4, 8);
  ctx.fillRect(32, 56, 4, 8);
  ctx.fillRect(40, 56, 4, 8);
  ctx.fillRect(44, 56, 4, 8);
  ctx.fillRect(36, 48, 4, 4);
  ctx.fillRect(40, 48, 4, 4);

  // LEGS
  ctx.fillStyle = pants;
  ctx.fillRect(4, 20, 4, 12);
  ctx.fillRect(0, 20, 4, 12);
  ctx.fillRect(8, 20, 4, 12);
  ctx.fillRect(12, 20, 4, 12);
  ctx.fillStyle = shoes;
  ctx.fillRect(4, 28, 4, 4);
  ctx.fillRect(0, 28, 4, 4);
  ctx.fillRect(8, 28, 4, 4);
  ctx.fillRect(12, 28, 4, 4);
  ctx.fillRect(4, 16, 4, 4);
  ctx.fillRect(8, 16, 4, 4);

  ctx.fillStyle = pants;
  ctx.fillRect(20, 52, 4, 12);
  ctx.fillRect(16, 52, 4, 12);
  ctx.fillRect(24, 52, 4, 12);
  ctx.fillRect(28, 52, 4, 12);
  ctx.fillStyle = shoes;
  ctx.fillRect(20, 60, 4, 4);
  ctx.fillRect(16, 60, 4, 4);
  ctx.fillRect(24, 60, 4, 4);
  ctx.fillRect(28, 60, 4, 4);
  ctx.fillRect(20, 48, 4, 4);
  ctx.fillRect(24, 48, 4, 4);
}

// ========== ZOMBIE ==========
function drawZombie(ctx) {
  const skin = '#5a8f5a';  // Green zombie skin
  const darkSkin = '#3d6b3d';
  const shirt = '#00a8a8';  // Same as Steve's shirt (torn)
  const pants = '#3c2a5e';  // Same as Steve's pants (torn)
  const shoes = '#444444';
  const eyes = '#1a1a1a';

  // HEAD - greenish zombie skin
  ctx.fillStyle = skin;
  ctx.fillRect(8, 8, 8, 8);
  ctx.fillRect(0, 8, 8, 8);
  ctx.fillRect(16, 8, 8, 8);
  ctx.fillRect(24, 8, 8, 8);
  
  // Darker patches (rot/decay)
  ctx.fillStyle = darkSkin;
  ctx.fillRect(8, 0, 8, 8);
  ctx.fillRect(9, 9, 2, 2);
  ctx.fillRect(14, 10, 1, 2);
  ctx.fillRect(16, 0, 8, 8);
  ctx.fillStyle = skin;
  ctx.fillRect(16, 0, 8, 8);
  
  // Zombie eyes - hollow black
  ctx.fillStyle = eyes;
  ctx.fillRect(9, 11, 2, 2);
  ctx.fillRect(13, 11, 2, 2);
  
  // No pupils - just black voids
  
  // Mouth - groaning
  ctx.fillStyle = '#2d4a2d';
  ctx.fillRect(10, 14, 4, 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(11, 15, 2, 1);

  // BODY - torn shirt
  ctx.fillStyle = shirt;
  ctx.fillRect(20, 20, 8, 12);
  ctx.fillRect(16, 20, 4, 12);
  ctx.fillRect(28, 20, 4, 12);
  ctx.fillRect(32, 20, 8, 12);
  ctx.fillRect(20, 16, 8, 4);
  ctx.fillRect(28, 16, 8, 4);
  // Torn patches showing skin
  ctx.fillStyle = skin;
  ctx.fillRect(21, 24, 2, 3);
  ctx.fillRect(25, 28, 2, 2);

  // ARMS - zombie green
  ctx.fillStyle = skin;
  ctx.fillRect(44, 20, 4, 12);
  ctx.fillRect(40, 20, 4, 12);
  ctx.fillRect(48, 20, 4, 12);
  ctx.fillRect(52, 20, 4, 12);
  ctx.fillRect(44, 16, 4, 4);
  ctx.fillRect(48, 16, 4, 4);
  ctx.fillStyle = darkSkin;
  ctx.fillRect(45, 28, 2, 2);

  ctx.fillStyle = skin;
  ctx.fillRect(36, 52, 4, 12);
  ctx.fillRect(32, 52, 4, 12);
  ctx.fillRect(40, 52, 4, 12);
  ctx.fillRect(44, 52, 4, 12);
  ctx.fillRect(36, 48, 4, 4);
  ctx.fillRect(40, 48, 4, 4);
  ctx.fillStyle = darkSkin;
  ctx.fillRect(37, 60, 2, 2);

  // LEGS
  ctx.fillStyle = pants;
  ctx.fillRect(4, 20, 4, 12);
  ctx.fillRect(0, 20, 4, 12);
  ctx.fillRect(8, 20, 4, 12);
  ctx.fillRect(12, 20, 4, 12);
  ctx.fillStyle = shoes;
  ctx.fillRect(4, 28, 4, 4);
  ctx.fillRect(0, 28, 4, 4);
  ctx.fillRect(8, 28, 4, 4);
  ctx.fillRect(12, 28, 4, 4);
  ctx.fillRect(4, 16, 4, 4);
  ctx.fillRect(8, 16, 4, 4);

  ctx.fillStyle = pants;
  ctx.fillRect(20, 52, 4, 12);
  ctx.fillRect(16, 52, 4, 12);
  ctx.fillRect(24, 52, 4, 12);
  ctx.fillRect(28, 52, 4, 12);
  ctx.fillStyle = shoes;
  ctx.fillRect(20, 60, 4, 4);
  ctx.fillRect(16, 60, 4, 4);
  ctx.fillRect(24, 60, 4, 4);
  ctx.fillRect(28, 60, 4, 4);
  ctx.fillRect(20, 48, 4, 4);
  ctx.fillRect(24, 48, 4, 4);
}

// ========== CREEPER ==========
function drawCreeper(ctx) {
  const green1 = '#5ba555';  // Main green
  const green2 = '#4a9446';  // Darker green
  const green3 = '#3d7a3d';  // Even darker
  const black = '#1a1a1a';

  // HEAD - pixel camo pattern
  // Fill base
  ctx.fillStyle = green1;
  ctx.fillRect(8, 8, 8, 8);
  ctx.fillRect(0, 8, 8, 8);
  ctx.fillRect(16, 8, 8, 8);
  ctx.fillRect(24, 8, 8, 8);
  ctx.fillRect(8, 0, 8, 8);
  ctx.fillRect(16, 0, 8, 8);
  
  // Add darker pixel pattern
  ctx.fillStyle = green2;
  ctx.fillRect(9, 9, 2, 1);
  ctx.fillRect(13, 10, 2, 2);
  ctx.fillRect(8, 14, 1, 1);
  ctx.fillRect(15, 13, 1, 2);
  ctx.fillRect(2, 10, 2, 2);
  ctx.fillRect(5, 13, 1, 2);
  ctx.fillRect(18, 9, 2, 1);
  ctx.fillRect(21, 12, 1, 2);
  ctx.fillRect(26, 10, 2, 2);
  ctx.fillRect(30, 14, 1, 1);
  ctx.fillRect(9, 2, 2, 2);
  ctx.fillRect(13, 4, 1, 2);
  
  ctx.fillStyle = green3;
  ctx.fillRect(11, 10, 1, 1);
  ctx.fillRect(14, 8, 1, 1);
  ctx.fillRect(3, 14, 1, 1);
  ctx.fillRect(19, 11, 1, 1);
  ctx.fillRect(27, 13, 1, 1);
  ctx.fillRect(11, 3, 1, 1);
  
  // Creeper face - the iconic sad face!
  // Eyes
  ctx.fillStyle = black;
  ctx.fillRect(9, 10, 2, 2);   // Left eye
  ctx.fillRect(13, 10, 2, 2);  // Right eye
  
  // Mouth - the sad frown
  ctx.fillRect(11, 13, 2, 1);  // Top of mouth
  ctx.fillRect(10, 14, 4, 2);  // Middle of mouth
  ctx.fillRect(10, 14, 1, 2);  // Left droop
  ctx.fillRect(13, 14, 1, 2);  // Right droop

  // BODY - same camo pattern
  ctx.fillStyle = green1;
  ctx.fillRect(20, 20, 8, 12);
  ctx.fillRect(16, 20, 4, 12);
  ctx.fillRect(28, 20, 4, 12);
  ctx.fillRect(32, 20, 8, 12);
  ctx.fillRect(20, 16, 8, 4);
  ctx.fillRect(28, 16, 8, 4);
  
  ctx.fillStyle = green2;
  ctx.fillRect(21, 22, 2, 2);
  ctx.fillRect(25, 26, 2, 2);
  ctx.fillRect(17, 24, 1, 2);
  ctx.fillRect(29, 28, 2, 1);
  ctx.fillRect(34, 23, 2, 2);
  ctx.fillRect(38, 27, 1, 2);
  
  ctx.fillStyle = green3;
  ctx.fillRect(23, 28, 1, 1);
  ctx.fillRect(19, 21, 1, 1);
  ctx.fillRect(35, 26, 1, 1);

  // LEGS (Creeper has 4 legs!)
  // Front right leg
  ctx.fillStyle = green1;
  ctx.fillRect(4, 20, 4, 12);
  ctx.fillRect(0, 20, 4, 12);
  ctx.fillRect(8, 20, 4, 12);
  ctx.fillRect(12, 20, 4, 12);
  ctx.fillRect(4, 16, 4, 4);
  ctx.fillRect(8, 16, 4, 4);
  ctx.fillStyle = green2;
  ctx.fillRect(5, 24, 2, 2);
  ctx.fillRect(1, 28, 1, 2);
  ctx.fillRect(10, 22, 1, 1);
  ctx.fillStyle = green3;
  ctx.fillRect(6, 30, 1, 1);

  // Front left leg
  ctx.fillStyle = green1;
  ctx.fillRect(20, 52, 4, 12);
  ctx.fillRect(16, 52, 4, 12);
  ctx.fillRect(24, 52, 4, 12);
  ctx.fillRect(28, 52, 4, 12);
  ctx.fillRect(20, 48, 4, 4);
  ctx.fillRect(24, 48, 4, 4);
  ctx.fillStyle = green2;
  ctx.fillRect(21, 56, 2, 2);
  ctx.fillRect(17, 60, 1, 2);
  ctx.fillRect(26, 54, 1, 1);
  ctx.fillStyle = green3;
  ctx.fillRect(22, 62, 1, 1);

  // Note: In Minecraft format, Creeper uses the arm slots for back legs
  // Back right leg
  ctx.fillStyle = green1;
  ctx.fillRect(44, 20, 4, 12);
  ctx.fillRect(40, 20, 4, 12);
  ctx.fillRect(48, 20, 4, 12);
  ctx.fillRect(52, 20, 4, 12);
  ctx.fillRect(44, 16, 4, 4);
  ctx.fillRect(48, 16, 4, 4);
  ctx.fillStyle = green2;
  ctx.fillRect(45, 24, 2, 2);
  ctx.fillRect(41, 28, 1, 2);
  ctx.fillStyle = green3;
  ctx.fillRect(50, 22, 1, 1);

  // Back left leg
  ctx.fillStyle = green1;
  ctx.fillRect(36, 52, 4, 12);
  ctx.fillRect(32, 52, 4, 12);
  ctx.fillRect(40, 52, 4, 12);
  ctx.fillRect(44, 52, 4, 12);
  ctx.fillRect(36, 48, 4, 4);
  ctx.fillRect(40, 48, 4, 4);
  ctx.fillStyle = green2;
  ctx.fillRect(37, 56, 2, 2);
  ctx.fillRect(33, 60, 1, 2);
  ctx.fillStyle = green3;
  ctx.fillRect(42, 54, 1, 1);
}

// Generate all skins
console.log('🎨 Generating Minecraft skin templates...\n');

createSkin('steve', drawSteve);
createSkin('alex', drawAlex);
createSkin('zombie', drawZombie);
createSkin('creeper', drawCreeper);

console.log('\n✨ Done! Templates saved to', OUTPUT_DIR);
