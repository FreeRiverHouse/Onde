#!/usr/bin/env node
// UserPromptSubmit Hook - Detecta "sbrinchi sbronchi" e inietta procedura fine sessione
// L'input del user arriva via stdin come JSON

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    setTimeout(() => resolve(data), 500);
  });
}

async function main() {
  const input = await readStdin();

  // Check if user message contains "sbrinchi sbronchi"
  const lowerInput = input.toLowerCase();
  if (!lowerInput.includes('sbrinchi') && !lowerInput.includes('sbronchi')) {
    process.exit(0);
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  // Output the procedure - Claude will see this
  console.log('=== HOOK: FINE SESSIONE (sbrinchi sbronchi) ===');
  console.log('');
  console.log('ESEGUI ORA:');
  console.log(`1. CREA/AGGIORNA: chat-history/${today}-ideas.md (riassumi cosa fatto, decisioni, idee)`);
  console.log('2. AGGIORNA ROADMAP.md se ci sono nuove priorita');
  console.log('3. git pull && git add . && git commit -m "sbrinchi sbronchi [data]" && git push');
  console.log('4. CONFERMA a Mattia: "Tutto salvato e pushato"');
  console.log('');
  console.log('=== ESEGUI SENZA CHIEDERE ===');
}

main();
