/**
 * CORDE API Server
 * Content ORchestration & Digital Experience
 *
 * Port: 3700
 *
 * Endpoints:
 * - POST /api/generate/book      → Genera libro illustrato
 * - POST /api/generate/video     → Genera video poesia
 * - POST /api/execute            → Esegue workflow custom
 * - GET  /api/jobs/:id           → Status job
 * - GET  /api/templates          → Lista template disponibili
 * - GET  /api/authors            → Lista autori (Gianni, Pina)
 * - WS   /ws                     → Real-time progress
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3700;

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  enginePath: join(__dirname, '../engine'),
  outputPath: process.env.CORDE_OUTPUT || join(__dirname, '../outputs'),
  modelsPath: process.env.CORDE_MODELS || '/Volumes/DATI-SSD/onde-ai/corde/models',
  jobsFile: join(__dirname, '../data/jobs.json'),
};

// ═══════════════════════════════════════════════════════════
// TEMPLATES - Content Presets
// ═══════════════════════════════════════════════════════════

const TEMPLATES = {
  'video-poesia': {
    name: 'Video Poesia',
    description: 'Genera video animato da poesia con illustrazioni Onde',
    author: 'pina-pennello',
    inputs: ['poem_text', 'style', 'mood', 'duration'],
    defaults: {
      style: 'onde-watercolor',
      mood: 'serene',
      duration: 60,
      resolution: '1080x1920', // vertical
    }
  },
  'libro-illustrato': {
    name: 'Libro Illustrato',
    description: 'Genera libro per bambini con testo e illustrazioni',
    author: 'gianni-parola',
    illustrator: 'pina-pennello',
    inputs: ['title', 'theme', 'age_target', 'chapters'],
    defaults: {
      style: 'onde-watercolor',
      age_target: '3-6',
      chapters: 8,
      format: 'pdf',
    }
  },
  'milo-adventure': {
    name: 'Milo Adventure',
    description: 'Nuova avventura del personaggio Milo',
    character: 'milo',
    inputs: ['adventure_theme', 'lesson'],
    defaults: {
      style: 'onde-tech',
      chapters: 6,
    }
  },
  'ambient-video': {
    name: 'Ambient Video',
    description: 'Video loop per Onde Lounge',
    inputs: ['scene', 'mood', 'duration'],
    defaults: {
      style: 'scenic',
      duration: 3600, // 1 hour
      loop: true,
    }
  }
};

// ═══════════════════════════════════════════════════════════
// AUTHORS - Onde Creative Team
// ═══════════════════════════════════════════════════════════

const AUTHORS = {
  // === SCRITTORI ===
  'gianni-parola': {
    name: 'Gianni Parola',
    role: 'Scrittore',
    type: 'text',
    style: 'Testi per bambini, narrativa calda, lezioni morali',
    prompts: {
      system: 'Sei Gianni Parola, scrittore italiano per bambini. Scrivi storie calde, semplici, con lezioni morali sottili. Età target: 3-8 anni.',
    }
  },
  'emilio': {
    name: 'EMILIO',
    role: 'Robot Educatore',
    type: 'text',
    style: 'Tech per bambini, spiegazioni semplici, entusiasta',
    prompts: {
      system: 'Sei EMILIO, un robot amichevole che spiega la tecnologia ai bambini in modo semplice e divertente.',
    }
  },

  // === ILLUSTRATORI ===
  'pina-pennello': {
    name: 'Pina Pennello',
    role: 'Illustratrice Onde',
    type: 'image',
    style: 'Acquarello europeo, vintage italiano, bambini',
    prompts: {
      base: 'European watercolor childrens book illustration, soft muted colors, warm golden light, Beatrix Potter meets Luzzati style, NOT Pixar NOT 3D NOT cartoon, elegant refined',
      negative: 'Pixar, 3D, cartoon, plastic, bright saturated colors, American style, rosy cheeks',
    }
  },
  'magmatic': {
    name: 'Magmatic',
    role: 'Visual Artist',
    type: 'image',
    style: 'Arte contemporanea, poetica visiva, minimalismo evocativo',
    prompts: {
      base: 'contemporary art photography, poetic visual, cinematic lighting, moody atmosphere, artistic composition, subtle emotion, Italy aesthetic, golden hour, film grain',
      negative: 'cartoon, illustration, bright colors, commercial, stock photo, generic',
    }
  },
  'onde-futures': {
    name: 'Onde Futures',
    role: 'Tech Illustrator',
    type: 'image',
    style: 'AI, tech, bambini, futuristico ma caldo',
    prompts: {
      base: 'futuristic childrens illustration, friendly robots, soft LED glow, warm technology, electric blue and magenta accents, modern but inviting, NOT cold NOT sterile',
      negative: 'scary, dark, dystopian, cold, sterile',
    }
  },
  'onde-classics': {
    name: 'Onde Classics',
    role: 'Classic Illustrator',
    type: 'image',
    style: 'Poesia, spiritualità, classici illustrati',
    prompts: {
      base: 'classic book illustration, elegant serif typography feel, deep blue and gold, ivory parchment texture, timeless refined aesthetic, burgundy accents, spiritual peaceful',
      negative: 'modern, casual, bright, cartoon',
    }
  },
  'luzzati': {
    name: 'Stile Luzzati',
    role: 'Folk Art Illustrator',
    type: 'image',
    style: 'Emanuele Luzzati, teatro, folk mediterraneo',
    prompts: {
      base: 'Emanuele Luzzati style illustration, Italian folk art, theatrical childrens book, Mediterranean colors, stylized figures, handcrafted paper cut feel, vintage Italian poster',
      negative: 'realistic, 3D, Pixar, American cartoon',
    }
  },

  // === VIDEO STYLES ===
  'onde-lounge': {
    name: 'Onde Lounge',
    role: 'Ambient Creator',
    type: 'video',
    style: 'Ambient, relax, loop infiniti',
    prompts: {
      base: 'peaceful ambient scene, Italian countryside, gentle movement, warm sunset light, cozy atmosphere, fireplace glow, rain on window',
      negative: 'action, fast, dramatic, urban',
    }
  }
};

// ═══════════════════════════════════════════════════════════
// JOB QUEUE
// ═══════════════════════════════════════════════════════════

let jobs = {};

function loadJobs() {
  try {
    if (fs.existsSync(CONFIG.jobsFile)) {
      jobs = JSON.parse(fs.readFileSync(CONFIG.jobsFile, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading jobs:', e);
    jobs = {};
  }
}

function saveJobs() {
  const dir = dirname(CONFIG.jobsFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG.jobsFile, JSON.stringify(jobs, null, 2));
}

function createJob(type, params) {
  const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const job = {
    id,
    type,
    params,
    status: 'queued',
    progress: 0,
    created_at: new Date().toISOString(),
    output: null,
    error: null,
  };
  jobs[id] = job;
  saveJobs();
  return job;
}

function updateJob(id, updates) {
  if (jobs[id]) {
    jobs[id] = { ...jobs[id], ...updates };
    saveJobs();
    broadcast({ type: 'job:update', job: jobs[id] });
  }
}

// ═══════════════════════════════════════════════════════════
// WEBSOCKET
// ═══════════════════════════════════════════════════════════

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total: ${clients.size}`);

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total: ${clients.size}`);
  });
});

function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(join(__dirname, '../frontend/dist')));

// ═══════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    device: process.platform === 'darwin' ? 'mps' : 'cuda',
    hostname: os.hostname(),
  });
});

// Download generated file
app.get('/api/output/:filename', (req, res) => {
  const filepath = join(CONFIG.outputPath, req.params.filename);
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// List templates
app.get('/api/templates', (req, res) => {
  res.json(TEMPLATES);
});

// List authors
app.get('/api/authors', (req, res) => {
  res.json(AUTHORS);
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  res.json(Object.values(jobs).sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  ));
});

// Get single job
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs[req.params.id];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// Cancel job
app.delete('/api/jobs/:id', (req, res) => {
  const job = jobs[req.params.id];
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (job.status === 'running') {
    // TODO: Kill running process
    updateJob(req.params.id, { status: 'cancelled' });
  }
  res.json({ status: 'cancelled' });
});

// ═══════════════════════════════════════════════════════════
// GENERATION ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Generate Video Poesia
app.post('/api/generate/video', async (req, res) => {
  const { template = 'video-poesia', ...params } = req.body;

  const templateConfig = TEMPLATES[template];
  if (!templateConfig) {
    return res.status(400).json({ error: `Unknown template: ${template}` });
  }

  const job = createJob('video', {
    template,
    ...templateConfig.defaults,
    ...params,
    author: AUTHORS[templateConfig.author],
  });

  // Start generation in background
  executeJob(job);

  res.json({ job_id: job.id, status: 'queued' });
});

// Generate Book
app.post('/api/generate/book', async (req, res) => {
  const { template = 'libro-illustrato', ...params } = req.body;

  const templateConfig = TEMPLATES[template];
  if (!templateConfig) {
    return res.status(400).json({ error: `Unknown template: ${template}` });
  }

  const job = createJob('book', {
    template,
    ...templateConfig.defaults,
    ...params,
    author: AUTHORS[templateConfig.author],
    illustrator: AUTHORS[templateConfig.illustrator],
  });

  executeJob(job);

  res.json({ job_id: job.id, status: 'queued' });
});

// Generate single image (direct, no workflow)
app.post('/api/generate/image', async (req, res) => {
  const {
    prompt,
    negative_prompt = '',
    author = 'pina-pennello',
    width = 1024,
    height = 1024,
    steps = 30,
    guidance = 7.5,
    seed = null,
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  const authorConfig = AUTHORS[author];
  const fullPrompt = authorConfig
    ? `${authorConfig.prompts.base}, ${prompt}`
    : prompt;
  const fullNegative = authorConfig
    ? `${authorConfig.prompts.negative || ''}, ${negative_prompt}`
    : negative_prompt;

  const job = createJob('image', {
    prompt: fullPrompt,
    negative_prompt: fullNegative,
    width,
    height,
    steps,
    guidance,
    seed: seed || Math.floor(Math.random() * 2147483647),
    author,
  });

  executeImageJob(job);
  res.json({ job_id: job.id, status: 'queued' });
});

// Execute custom workflow
app.post('/api/execute', async (req, res) => {
  const { workflow, params } = req.body;

  if (!workflow) {
    return res.status(400).json({ error: 'Workflow required' });
  }

  const job = createJob('workflow', { workflow, ...params });
  executeJob(job);

  res.json({ job_id: job.id, status: 'queued' });
});

// ═══════════════════════════════════════════════════════════
// JOB EXECUTION
// ═══════════════════════════════════════════════════════════

// Execute direct image generation
async function executeImageJob(job) {
  updateJob(job.id, { status: 'running', started_at: new Date().toISOString() });

  try {
    const outputFile = join(CONFIG.outputPath, `${job.id}.png`);
    const { prompt, negative_prompt, width, height, steps, guidance, seed } = job.params;

    const engine = spawn('python', [
      join(CONFIG.enginePath, 'generate_single.py'),
      '--prompt', prompt,
      '--negative', negative_prompt || '',
      '--width', String(width),
      '--height', String(height),
      '--steps', String(steps),
      '--guidance', String(guidance),
      '--seed', String(seed),
      '--output', outputFile,
    ], {
      cwd: CONFIG.enginePath,
      env: {
        ...process.env,
        HF_HOME: '/Volumes/DATI-SSD/onde-ai/corde/cache',
        TORCH_HOME: '/Volumes/DATI-SSD/onde-ai/corde/cache',
      }
    });

    engine.stdout.on('data', (data) => {
      const line = data.toString().trim();
      try {
        const msg = JSON.parse(line);
        if (msg.progress !== undefined) {
          updateJob(job.id, { progress: msg.progress });
        }
      } catch (e) {
        console.log('[Image Gen]', line);
      }
    });

    engine.stderr.on('data', (data) => {
      console.error('[Image Gen Error]', data.toString());
    });

    engine.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputFile)) {
        updateJob(job.id, {
          status: 'completed',
          output: outputFile,
          completed_at: new Date().toISOString(),
        });
      } else {
        updateJob(job.id, {
          status: 'failed',
          error: `Exit code ${code}`,
        });
      }
    });

  } catch (error) {
    updateJob(job.id, { status: 'failed', error: error.message });
  }
}

async function executeJob(job) {
  updateJob(job.id, { status: 'running', started_at: new Date().toISOString() });

  try {
    // Spawn Python engine
    const engine = spawn('python', [
      join(CONFIG.enginePath, 'engine.py'),
      '--job', JSON.stringify(job),
    ], {
      cwd: CONFIG.enginePath,
      env: {
        ...process.env,
        CORDE_OUTPUT: CONFIG.outputPath,
        CORDE_MODELS: CONFIG.modelsPath,
      }
    });

    engine.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const msg = JSON.parse(line);
          if (msg.progress !== undefined) {
            updateJob(job.id, { progress: msg.progress });
          }
          if (msg.status) {
            updateJob(job.id, { status: msg.status });
          }
          if (msg.output) {
            updateJob(job.id, { output: msg.output, status: 'completed' });
          }
        } catch (e) {
          console.log('[Engine]', line);
        }
      }
    });

    engine.stderr.on('data', (data) => {
      console.error('[Engine Error]', data.toString());
    });

    engine.on('close', (code) => {
      if (code !== 0 && jobs[job.id].status !== 'completed') {
        updateJob(job.id, {
          status: 'failed',
          error: `Engine exited with code ${code}`
        });
      }
    });

  } catch (error) {
    updateJob(job.id, { status: 'failed', error: error.message });
  }
}

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

loadJobs();

server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                      CORDE API                            ║
║         Content ORchestration & Digital Experience        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Local:    http://localhost:${PORT}                         ║
║  Network:  http://${localIP}:${PORT}                      ║
║                                                           ║
║  Endpoints:                                               ║
║    GET  /api/health        - Health check                 ║
║    GET  /api/templates     - List templates               ║
║    GET  /api/authors       - List authors                 ║
║    GET  /api/jobs          - List jobs                    ║
║    POST /api/generate/video - Generate video poesia       ║
║    POST /api/generate/book  - Generate book               ║
║    POST /api/execute        - Execute workflow            ║
║    WS   /ws                 - Real-time updates           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
