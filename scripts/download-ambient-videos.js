#!/usr/bin/env node
/**
 * download-ambient-videos.js - Download free/Creative Commons ambient videos
 *
 * Downloads fireplace, rain, nature and other ambient videos from Pixabay
 * for the Onde Roku TV app.
 *
 * All videos are from Pixabay (https://pixabay.com) under the Pixabay License
 * which allows free commercial use with no attribution required.
 *
 * Usage:
 *   node download-ambient-videos.js [options]
 *
 * Options:
 *   --dry-run       Show what would be downloaded without downloading
 *   --category <c>  Download only specific category (fireplace, rain, nature, candles)
 *   --list          List all available videos without downloading
 *   --help, -h      Show this help
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const OUTPUT_DIR = '/Volumes/DATI-SSD/onde-youtube/ambient-videos';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  progress: (current, total, name) => {
    const percent = Math.round((current / total) * 100);
    process.stdout.write(`\r${colors.cyan}[DOWNLOAD]${colors.reset} ${name} - ${percent}% (${formatBytes(current)}/${formatBytes(total)})`);
  },
};

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

/**
 * Video sources - FREE / Creative Commons from Pixabay
 *
 * All videos are from Pixabay: https://pixabay.com/service/license-summary/
 * License: Free for commercial use, no attribution required
 *
 * URL format: https://cdn.pixabay.com/video/YYYY/MM/DD/VIDEOID_large.mp4
 */
const AMBIENT_VIDEOS = [
  // === FIREPLACE VIDEOS ===
  {
    id: 'fireplace-239514',
    category: 'fireplace',
    name: 'Burning Fireplace 4K Ultra HD',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Fire, fireplace, campfire - beautiful burning fire',
    url: 'https://cdn.pixabay.com/video/2024/11/02/239514_large.mp4',
    pageUrl: 'https://pixabay.com/videos/fire-fireplace-campfire-bonfire-239514/',
  },
  {
    id: 'fireplace-234515',
    category: 'fireplace',
    name: 'Fire Fireplace Burning Crackling',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Crackling fire in fireplace',
    url: 'https://cdn.pixabay.com/video/2024/10/03/234515_large.mp4',
    pageUrl: 'https://pixabay.com/videos/fire-fireplace-burning-crackling-234515/',
  },
  {
    id: 'fireplace-239515',
    category: 'fireplace',
    name: 'Fire Fireplace Campfire Bonfire',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Warm campfire and bonfire flames',
    url: 'https://cdn.pixabay.com/video/2024/11/02/239515_large.mp4',
    pageUrl: 'https://pixabay.com/videos/fire-fireplace-campfire-bonfire-239515/',
  },
  {
    id: 'fireplace-239511',
    category: 'fireplace',
    name: 'Fireplace Christmas Burning Fire',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Christmas fireplace with burning fire',
    url: 'https://cdn.pixabay.com/video/2024/11/02/239511_large.mp4',
    pageUrl: 'https://pixabay.com/videos/fireplace-christmas-burning-fire-239511/',
  },
  {
    id: 'fireplace-190776',
    category: 'fireplace',
    name: 'Fireplace Winter Christmas',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Cozy winter fireplace',
    url: 'https://cdn.pixabay.com/video/2023/11/26/190776-888535446_large.mp4',
    pageUrl: 'https://pixabay.com/videos/fireplace-winter-christmas-190776/',
  },
  {
    id: 'fireplace-1971',
    category: 'fireplace',
    name: 'Fireplace Fire Flames Warmth',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Warm fireplace flames',
    url: 'https://cdn.pixabay.com/video/2016/01/24/1971-152947486_large.mp4',
    pageUrl: 'https://pixabay.com/videos/fireplace-fire-flames-warmth-warm-1971/',
  },
  {
    id: 'fireplace-2336',
    category: 'fireplace',
    name: 'Flames Heat Warm Burn Oven',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Heat and flames burning',
    url: 'https://cdn.pixabay.com/video/2016/02/29/2336-157269911_large.mp4',
    pageUrl: 'https://pixabay.com/videos/flames-heat-warm-warmth-burn-oven-2336/',
  },
  {
    id: 'fireplace-8625',
    category: 'fireplace',
    name: 'Embers Glow Fire Heat Campfire',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Glowing embers from campfire',
    url: 'https://cdn.pixabay.com/video/2017/04/10/8625-212638612_large.mp4',
    pageUrl: 'https://pixabay.com/videos/embers-glow-fire-heat-campfire-8625/',
  },

  // === RAIN VIDEOS ===
  {
    id: 'rain-11722',
    category: 'rain',
    name: 'Rain Water Window Wet Drops',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Raindrops on window',
    url: 'https://cdn.pixabay.com/video/2017/08/30/11722-231759069_large.mp4',
    pageUrl: 'https://pixabay.com/videos/rain-water-window-wet-drops-11722/',
  },
  {
    id: 'rain-189290',
    category: 'rain',
    name: 'Raindrop Drops Rain Window',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Raindrops falling on window',
    url: 'https://cdn.pixabay.com/video/2023/11/16/189290-885321799_large.mp4',
    pageUrl: 'https://pixabay.com/videos/raindrop-drops-rain-window-189290/',
  },
  {
    id: 'rain-217379',
    category: 'rain',
    name: 'Rain Window Drops Weather',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Rain drops on window',
    url: 'https://cdn.pixabay.com/video/2024/06/19/217379_large.mp4',
    pageUrl: 'https://pixabay.com/videos/rain-window-drops-weather-water-217379/',
  },
  {
    id: 'rain-28236',
    category: 'rain',
    name: 'Rain Raindrop Wet Water',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Rain and raindrops',
    url: 'https://cdn.pixabay.com/video/2019/10/24/28236-368501609_large.mp4',
    pageUrl: 'https://pixabay.com/videos/rain-raindrop-wet-water-window-28236/',
  },
  {
    id: 'rain-42420',
    category: 'rain',
    name: 'Nature Rain Plant Water Garden',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Rain on plants in garden',
    url: 'https://cdn.pixabay.com/video/2020/06/17/42420-431511648_large.mp4',
    pageUrl: 'https://pixabay.com/videos/nature-rain-plant-water-garden-42420/',
  },

  // === OCEAN / NATURE VIDEOS ===
  {
    id: 'ocean-4006',
    category: 'nature',
    name: 'Sea Wave Golden Sand Sunrise',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Ocean waves at sunrise',
    url: 'https://cdn.pixabay.com/video/2016/07/26/4006-176282263_large.mp4',
    pageUrl: 'https://pixabay.com/videos/sea-wave-golden-sand-sunrise-4006/',
  },
  {
    id: 'ocean-24216',
    category: 'nature',
    name: 'Sea Ocean Wave Beach Blue',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Blue ocean waves on beach',
    url: 'https://cdn.pixabay.com/video/2019/06/05/24216-340670744_large.mp4',
    pageUrl: 'https://pixabay.com/videos/sea-ocean-wave-beach-blue-nature-24216/',
  },
  {
    id: 'ocean-233867',
    category: 'nature',
    name: 'Ocean Sea Wave Water Sunset',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Ocean waves at sunset',
    url: 'https://cdn.pixabay.com/video/2024/09/29/233867_large.mp4',
    pageUrl: 'https://pixabay.com/videos/ocean-sea-wave-water-sunset-233867/',
  },
  {
    id: 'ocean-218714',
    category: 'nature',
    name: 'Beach Ocean Sea Summer Holiday',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Beach and ocean summer scene',
    url: 'https://cdn.pixabay.com/video/2024/06/29/218714_large.mp4',
    pageUrl: 'https://pixabay.com/videos/beach-ocean-sea-summer-holiday-218714/',
  },
  {
    id: 'ocean-138588',
    category: 'nature',
    name: 'Sea Ocean Beach Waves Dusk',
    source: 'Pixabay',
    license: 'Pixabay License (Free)',
    description: 'Ocean waves at dusk',
    url: 'https://cdn.pixabay.com/video/2022/11/11/138588-770315514_large.mp4',
    pageUrl: 'https://pixabay.com/videos/sea-ocean-beach-waves-sun-dusk-138588/',
  },
];

/**
 * Download a file using curl (more reliable with Pixabay CDN)
 */
function downloadFile(url, outputPath, videoName) {
  return new Promise((resolve, reject) => {
    const curlCmd = `curl -L -# -o "${outputPath}" \
      -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
      -H "Referer: https://pixabay.com/" \
      "${url}"`;

    try {
      log.info(`  Downloading: ${videoName}`);
      execSync(curlCmd, { stdio: 'inherit' });

      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        resolve({
          path: outputPath,
          size: stats.size,
        });
      } else {
        reject(new Error('Download failed - file not created'));
      }
    } catch (err) {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(err);
    }
  });
}

/**
 * Check available disk space
 */
function checkDiskSpace(dirPath) {
  try {
    const output = execSync(`df -h "${dirPath}"`, { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    if (lines.length >= 2) {
      const parts = lines[1].split(/\s+/);
      return {
        filesystem: parts[0],
        size: parts[1],
        used: parts[2],
        available: parts[3],
        capacity: parts[4],
      };
    }
  } catch (err) {
    return null;
  }
  return null;
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    category: null,
    list: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--list':
        options.list = true;
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
download-ambient-videos.js - Download free/Creative Commons ambient videos

Downloads fireplace, rain, nature and other ambient videos from Pixabay
for the Onde Roku TV app.

Usage:
  node download-ambient-videos.js [options]

Options:
  --dry-run       Show what would be downloaded without downloading
  --category <c>  Download only specific category (fireplace, rain, nature)
  --list          List all available videos without downloading
  --help, -h      Show this help

Examples:
  node download-ambient-videos.js                       # Download all videos
  node download-ambient-videos.js --category fireplace  # Download only fireplace videos
  node download-ambient-videos.js --list                # List available videos
  node download-ambient-videos.js --dry-run             # Show what would be downloaded

Output Directory: ${OUTPUT_DIR}

Source: Pixabay (https://pixabay.com)
License: Pixabay License - free for commercial use, no attribution required
`);
}

/**
 * List all videos
 */
function listVideos(videos) {
  const categories = [...new Set(videos.map(v => v.category))];

  console.log('\n=== Available Ambient Videos ===\n');

  for (const category of categories) {
    const categoryVideos = videos.filter(v => v.category === category);
    console.log(`${colors.cyan}${category.toUpperCase()}${colors.reset} (${categoryVideos.length} videos)`);
    console.log('-'.repeat(50));

    for (const video of categoryVideos) {
      console.log(`  ${colors.green}${video.id}${colors.reset}`);
      console.log(`    Name: ${video.name}`);
      console.log(`    Source: ${video.source} (${video.license})`);
      console.log(`    Description: ${video.description}`);
      console.log(`    Page: ${video.pageUrl}`);
      console.log('');
    }
  }

  console.log(`Total: ${videos.length} videos`);
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  // Filter videos by category if specified
  let videos = AMBIENT_VIDEOS;
  if (options.category) {
    videos = videos.filter(v => v.category === options.category);
    if (videos.length === 0) {
      log.error(`No videos found for category: ${options.category}`);
      log.info(`Available categories: ${[...new Set(AMBIENT_VIDEOS.map(v => v.category))].join(', ')}`);
      return;
    }
  }

  if (options.list) {
    listVideos(videos);
    return;
  }

  // Check if output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    log.info(`Creating output directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check disk space
  const diskSpace = checkDiskSpace(OUTPUT_DIR);
  if (diskSpace) {
    log.info(`Disk space: ${diskSpace.available} available (${diskSpace.capacity} used)`);
  }

  log.info(`Output directory: ${OUTPUT_DIR}`);
  log.info(`Videos to download: ${videos.length}`);

  if (options.dryRun) {
    log.warn('DRY RUN - No files will be downloaded');
  }

  console.log('');

  // Download each video
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  const results = [];

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const outputPath = path.join(OUTPUT_DIR, video.category);
    const fileName = `${video.id}.mp4`;
    const filePath = path.join(outputPath, fileName);

    log.info(`[${i + 1}/${videos.length}] ${video.name} (${video.category})`);
    log.info(`  Source: ${video.source} - ${video.license}`);

    // Create category subdirectory
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      log.warn(`  Skipping - already exists (${formatBytes(stats.size)})`);
      skippedCount++;
      results.push({ video, status: 'skipped', path: filePath, size: stats.size });
      continue;
    }

    if (options.dryRun) {
      log.info(`  [DRY-RUN] Would download to: ${filePath}`);
      continue;
    }

    try {
      const result = await downloadFile(video.url, filePath, video.name);
      log.success(`  Downloaded: ${formatBytes(result.size)}`);
      successCount++;
      results.push({ video, status: 'downloaded', path: result.path, size: result.size });
    } catch (err) {
      log.error(`  Failed: ${err.message}`);
      failCount++;
      results.push({ video, status: 'failed', error: err.message });
    }

    console.log('');
  }

  // Summary
  console.log('\n=== Download Summary ===');
  console.log(`${colors.green}Downloaded:${colors.reset} ${successCount}`);
  console.log(`${colors.yellow}Skipped:${colors.reset} ${skippedCount}`);
  console.log(`${colors.red}Failed:${colors.reset} ${failCount}`);
  console.log(`${colors.blue}Total:${colors.reset} ${videos.length}`);

  // Calculate total size
  const totalSize = results
    .filter(r => r.size)
    .reduce((sum, r) => sum + r.size, 0);
  console.log(`${colors.blue}Total size:${colors.reset} ${formatBytes(totalSize)}`);

  // Show final disk space
  const finalDiskSpace = checkDiskSpace(OUTPUT_DIR);
  if (finalDiskSpace) {
    console.log(`\nDisk space remaining: ${finalDiskSpace.available}`);
  }

  // Show output structure
  console.log(`\nOutput structure:`);
  const categories = [...new Set(videos.map(v => v.category))];
  for (const cat of categories) {
    const catPath = path.join(OUTPUT_DIR, cat);
    if (fs.existsSync(catPath)) {
      const files = fs.readdirSync(catPath);
      console.log(`  ${catPath}/ (${files.length} files)`);
    }
  }

  // Create attribution file
  const attributionPath = path.join(OUTPUT_DIR, 'ATTRIBUTION.md');
  const attribution = `# Video Attribution

All videos in this directory are free to use under the Pixabay License.

## Source

**Pixabay**
- Website: https://pixabay.com
- License: Pixabay License (https://pixabay.com/service/license-summary/)
- Free for commercial use, no attribution required

## Videos

${videos.map(v => `### ${v.name}
- ID: ${v.id}
- Category: ${v.category}
- Description: ${v.description}
- Page: ${v.pageUrl}
`).join('\n')}

---
Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync(attributionPath, attribution);
  log.success(`\nAttribution file created: ${attributionPath}`);
}

// Run main function
main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
