#!/usr/bin/env tsx

import * as readline from 'readline';
import * as path from 'path';
import { config } from 'dotenv';
import { PinoPennello } from './pino-pennello';
import { GianniParola } from './gianni-parola';
import { MattiaCenci } from './mattia-cenci';

// Carica .env dalla root di Onde
config({ path: path.resolve(__dirname, '../../../.env') });

const MEMORY_DIR = path.resolve(__dirname, '../memory');
const XAI_API_KEY = process.env.XAI_API_KEY || '';

// Assicurati che la cartella memory esista
import * as fs from 'fs';
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

type AgentType = 'pino' | 'gianni' | 'mattia';

async function main() {
  const args = process.argv.slice(2);
  const agentType = (args[0] as AgentType) || 'mattia';

  // Inizializza gli agent
  const pino = new PinoPennello(MEMORY_DIR);
  const gianni = new GianniParola(MEMORY_DIR, XAI_API_KEY);
  const mattia = new MattiaCenci(MEMORY_DIR, XAI_API_KEY);

  let currentAgent: { name: string; process: (req: string) => Promise<string> };

  switch (agentType) {
    case 'pino':
      currentAgent = { name: 'Pino Pennello', process: (r) => pino.processRequest(r) };
      console.log('\n🎨 ' + pino.introduce());
      break;
    case 'gianni':
      currentAgent = { name: 'Gianni Parola', process: (r) => gianni.processRequest(r) };
      console.log('\n✍️  ' + gianni.introduce());
      break;
    case 'mattia':
    default:
      currentAgent = { name: 'Mattia Cenci', process: (r) => mattia.processRequest(r) };
      console.log('\n📚 ' + mattia.introduce());
      break;
  }

  console.log('\nDigita la tua richiesta (o "exit" per uscire, "switch [agent]" per cambiare)\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${currentAgent.name}> `
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('\nArrivederci! 👋\n');
      rl.close();
      process.exit(0);
    }

    // Comando per cambiare agent
    if (input.toLowerCase().startsWith('switch ')) {
      const newAgent = input.split(' ')[1].toLowerCase();
      if (newAgent === 'pino') {
        currentAgent = { name: 'Pino Pennello', process: (r) => pino.processRequest(r) };
        console.log('\n🎨 Ora parli con Pino Pennello\n');
      } else if (newAgent === 'gianni') {
        currentAgent = { name: 'Gianni Parola', process: (r) => gianni.processRequest(r) };
        console.log('\n✍️  Ora parli con Gianni Parola\n');
      } else if (newAgent === 'mattia') {
        currentAgent = { name: 'Mattia Cenci', process: (r) => mattia.processRequest(r) };
        console.log('\n📚 Ora parli con Mattia Cenci\n');
      } else {
        console.log('\nAgent non riconosciuto. Usa: pino, gianni, mattia\n');
      }
      rl.setPrompt(`${currentAgent.name}> `);
      rl.prompt();
      return;
    }

    // Comando per vedere lo status
    if (input.toLowerCase() === 'status') {
      console.log('\n--- STATUS TEAM ONDE ---');
      console.log(pino.getStatus());
      console.log(gianni.getStatus());
      console.log(mattia.getStatus());
      console.log('------------------------\n');
      rl.prompt();
      return;
    }

    // Processa la richiesta con l'agent corrente
    try {
      console.log('\n...\n');
      const response = await currentAgent.process(input);
      console.log(response);
      console.log('');
    } catch (error: any) {
      console.error(`\nErrore: ${error.message}\n`);
    }

    rl.prompt();
  });
}

main().catch(console.error);
