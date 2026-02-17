#!/usr/bin/env node
// Inizializza il sistema memoria per Onde Continuous Claude
// Usa JSON files invece di SQLite per semplicità e zero dipendenze
// Uso: node scripts/init-memory-db.js

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = process.env.CLAUDE_PROJECT_DIR || '/Users/mattia/Projects/Onde';
const MEMORY_DIR = path.join(ONDE_ROOT, '.claude-memory');

// File di memoria
const FILES = {
  memories: path.join(MEMORY_DIR, 'memories.json'),
  handoffs: path.join(MEMORY_DIR, 'handoffs.json'),
  sessions: path.join(MEMORY_DIR, 'sessions.json'),
  priorities: path.join(MEMORY_DIR, 'priorities.json'),
  config: path.join(MEMORY_DIR, 'config.json')
};

// Assicurati che la directory esista
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// Schema iniziale per ogni file
const schemas = {
  memories: {
    version: 1,
    items: []
    // item: { id, content, category, source, savedToRoadmap, createdAt }
  },
  handoffs: {
    version: 1,
    items: []
    // item: { id, sessionId, trigger, yamlPath, transcriptPath, createdAt }
  },
  sessions: {
    version: 1,
    items: []
    // item: { id, startTime, endTime, status, filesTouched, tasksCompleted }
  },
  priorities: {
    version: 1,
    items: []
    // item: { id, content, priorityLevel, source, completed, createdAt }
  },
  config: {
    version: 1,
    initialized: new Date().toISOString(),
    lastCleanup: null,
    settings: {
      maxMemories: 1000,
      maxHandoffs: 100,
      autoCleanupDays: 30
    }
  }
};

// Inizializza i file
let filesCreated = 0;
let filesExisting = 0;

for (const [name, filePath] of Object.entries(FILES)) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(schemas[name], null, 2));
    console.log(`✅ Creato: ${name}.json`);
    filesCreated++;
  } else {
    console.log(`📂 Esiste: ${name}.json`);
    filesExisting++;
  }
}

// Inserisci memoria di test
const memoriesPath = FILES.memories;
const memories = JSON.parse(fs.readFileSync(memoriesPath, 'utf8'));

const testMemory = {
  id: `mem-${Date.now()}`,
  content: 'Continuous Claude implementato - hooks attivi per PreCompact e SessionStart',
  category: 'milestone',
  source: 'init-memory-db.js',
  savedToRoadmap: false,
  createdAt: new Date().toISOString()
};

// Evita duplicati
const exists = memories.items.some(m => m.content === testMemory.content);
if (!exists) {
  memories.items.push(testMemory);
  fs.writeFileSync(memoriesPath, JSON.stringify(memories, null, 2));
  console.log('\n✅ Memoria di test aggiunta');
}

console.log(`\n📊 Statistiche:`);
console.log(`   File creati: ${filesCreated}`);
console.log(`   File esistenti: ${filesExisting}`);
console.log(`   Memorie totali: ${memories.items.length}`);
console.log(`\n📁 Directory: ${MEMORY_DIR}`);
console.log('\n🎉 Sistema memoria pronto!');
