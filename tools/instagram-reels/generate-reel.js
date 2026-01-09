/**
 * Onde Instagram Reels Generator
 * Genera Reels verticali 9:16 per Instagram
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Configurazione
const CONFIG = {
  width: 1080,
  height: 1920,  // 9:16 aspect ratio
  fps: 30,
  duration: 15,  // secondi default
  outputDir: path.join(__dirname, 'output'),
  tempDir: path.join(__dirname, 'temp'),
};

// Assicura che le directory esistano
[CONFIG.outputDir, CONFIG.tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Prepara immagine per Reel (resize + pad a 9:16)
 */
async function prepareImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(CONFIG.width, CONFIG.height, {
      fit: 'contain',
      background: { r: 255, g: 248, b: 231, alpha: 1 } // Crema Onde
    })
    .toFile(outputPath);

  console.log(`Immagine preparata: ${outputPath}`);
  return outputPath;
}

/**
 * Genera Reel da immagine statica con animazione Ken Burns
 */
function generateKenBurnsReel(imagePath, audioPath, outputPath, duration = 15) {
  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // Input immagine con loop
    command
      .input(imagePath)
      .inputOptions(['-loop 1'])
      .inputOptions([`-t ${duration}`]);

    // Input audio (opzionale)
    if (audioPath && fs.existsSync(audioPath)) {
      command
        .input(audioPath)
        .inputOptions([`-t ${duration}`]);
    }

    // Output con Ken Burns effect (zoom lento)
    command
      .complexFilter([
        // Zoom in lento dal 100% al 110%
        `[0:v]scale=8000:-1,zoompan=z='min(zoom+0.0002,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${duration * CONFIG.fps}:s=${CONFIG.width}x${CONFIG.height}:fps=${CONFIG.fps}[v]`
      ])
      .outputOptions([
        '-map [v]',
        audioPath ? '-map 1:a' : '-an',
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
        '-pix_fmt yuv420p',
        audioPath ? '-c:a aac -b:a 192k' : '',
        '-movflags +faststart',
        '-t', duration.toString()
      ].filter(Boolean))
      .output(outputPath)
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\rProgress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log(`\nReel generato: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Errore ffmpeg:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Genera Reel slideshow da multiple immagini
 */
function generateSlideshow(imagePaths, audioPath, outputPath, secondsPerImage = 3) {
  return new Promise((resolve, reject) => {
    const duration = imagePaths.length * secondsPerImage;

    let command = ffmpeg();

    // Crea filtro per concatenare immagini con transizioni
    let filterComplex = [];
    let inputIndex = 0;

    imagePaths.forEach((img, i) => {
      command.input(img).inputOptions(['-loop 1', `-t ${secondsPerImage}`]);
    });

    if (audioPath && fs.existsSync(audioPath)) {
      command.input(audioPath);
    }

    // Fade transitions
    let prevOutput = '0:v';
    imagePaths.forEach((img, i) => {
      if (i === 0) {
        filterComplex.push(`[0:v]scale=${CONFIG.width}:${CONFIG.height}:force_original_aspect_ratio=decrease,pad=${CONFIG.width}:${CONFIG.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v0]`);
        prevOutput = 'v0';
      } else {
        filterComplex.push(`[${i}:v]scale=${CONFIG.width}:${CONFIG.height}:force_original_aspect_ratio=decrease,pad=${CONFIG.width}:${CONFIG.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`);
        filterComplex.push(`[${prevOutput}][v${i}]xfade=transition=fade:duration=0.5:offset=${i * secondsPerImage - 0.5}[v${i}out]`);
        prevOutput = `v${i}out`;
      }
    });

    command
      .complexFilter(filterComplex.join(';'))
      .outputOptions([
        `-map [${prevOutput}]`,
        audioPath ? `-map ${imagePaths.length}:a` : '-an',
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
        '-pix_fmt yuv420p',
        audioPath ? '-c:a aac -b:a 192k' : '',
        '-movflags +faststart',
        '-t', duration.toString()
      ].filter(Boolean))
      .output(outputPath)
      .on('end', () => {
        console.log(`Slideshow generato: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', reject)
      .run();
  });
}

/**
 * Aggiunge testo overlay a un video
 */
function addTextOverlay(inputPath, outputPath, text, options = {}) {
  const {
    fontFile = '/System/Library/Fonts/Helvetica.ttc',
    fontSize = 48,
    fontColor = 'white',
    position = 'center',
    backgroundColor = 'black@0.5'
  } = options;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters([
        `drawtext=text='${text}':fontfile=${fontFile}:fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=${backgroundColor}:boxborderw=10`
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Onde Instagram Reels Generator

Uso:
  node generate-reel.js <immagine> [audio] [output]
  node generate-reel.js slideshow <img1> <img2> ... [--audio file.mp3]

Opzioni:
  --duration <sec>  Durata in secondi (default: 15)
  --audio <file>    File audio da aggiungere
  --output <file>   Nome file output

Esempi:
  node generate-reel.js cover.jpg background.mp3 reel.mp4
  node generate-reel.js slideshow img1.jpg img2.jpg img3.jpg --audio music.mp3
    `);
    process.exit(0);
  }

  // Parse arguments
  const imagePath = args[0];
  const audioPath = args[1] || null;
  const outputPath = args[2] || path.join(CONFIG.outputDir, `reel-${Date.now()}.mp4`);

  (async () => {
    try {
      // Prepara immagine
      const preparedImage = path.join(CONFIG.tempDir, `prepared-${Date.now()}.jpg`);
      await prepareImage(imagePath, preparedImage);

      // Genera reel
      await generateKenBurnsReel(preparedImage, audioPath, outputPath);

      // Cleanup
      fs.unlinkSync(preparedImage);

      console.log('\nDone!');
    } catch (error) {
      console.error('Errore:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  prepareImage,
  generateKenBurnsReel,
  generateSlideshow,
  addTextOverlay,
  CONFIG
};
