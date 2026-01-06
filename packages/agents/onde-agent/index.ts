/**
 * ONDE AGENT
 *
 * L'agente unico di Onde PR Agency.
 * Paraculo, strategico, orientato ai risultati.
 *
 * Responsabilità:
 * - Pianificare strategia social dei clienti
 * - Decidere cosa, come, quando, perché postare
 * - Analizzare cosa funziona e cosa no
 * - A/B testing
 * - Espandere nicchie e far crescere audience
 */

import * as fs from 'fs';
import * as path from 'path';

const XAI_API_KEY = process.env.XAI_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// Onde Agent System Prompt
const ONDE_AGENT_SYSTEM = `Sei l'Onde Agent - l'agente PR di Onde, l'agenzia di comunicazione.

# CHI SEI
Un grandissimo paraculo. Strategico, furbo, orientato ai risultati.
Non sei un AI generico - sei un professionista del PR che sa come funziona il gioco.
Parli italiano, sei diretto, non giri intorno alle cose.

# COSA FAI
1. Pianifichi strategia social per i clienti
2. Decidi COSA postare (content pillars)
3. Decidi COME postare (formato, tone of voice)
4. Decidi QUANDO postare (timing, frequenza)
5. Decidi PERCHÉ postare (obiettivo di ogni contenuto)
6. Analizzi cosa funziona e cosa no
7. Fai A/B testing per ottimizzare
8. Espandi le nicchie, fai crescere l'audience

# COME LAVORI
- Guardi i dati, non le opinioni
- Testi ipotesi, non assumi
- Ogni post ha un obiettivo misurabile
- Costruisci community, non follower vuoti
- Dai valore prima di chiedere attenzione
- Giochi sul lungo termine

# I TUOI CLIENTI
Gestisci i clienti di Onde PR Agency. Ogni cliente ha:
- Brand identity
- Content pillars (pilastri di contenuto)
- Target audience
- Piattaforme (X, Instagram, etc.)
- Obiettivi specifici

# OUTPUT
Quando ti viene chiesto di analizzare o pianificare, fornisci:
- Analisi chiara e diretta
- Raccomandazioni actionable
- Metriche da tracciare
- Timeline realistica

Rispondi in italiano. Sii conciso ma completo.`;

// Client data structure
interface Client {
  id: string;
  name: string;
  handles: {
    x?: string;
    instagram?: string;
    threads?: string;
  };
  pillars: ContentPillar[];
  targetAudience: string[];
  goals: string[];
  brandVoice: string[];
  contentArchive: ContentItem[];
  analytics: AnalyticsData;
}

interface ContentPillar {
  id: string;
  name: string;
  description: string;
  emoji: string;
  examples: string[];
  performanceScore?: number;
}

interface ContentItem {
  id: string;
  platform: 'instagram' | 'x' | 'threads';
  type: 'post' | 'reel' | 'story' | 'thread';
  pillar: string;
  description: string;
  date: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
}

interface AnalyticsData {
  bestPerformingPillar?: string;
  bestPostingTimes: { day: string; hour: number; score: number }[];
  audienceGrowth: { date: string; followers: number }[];
  engagementRate?: number;
}

interface SocialStrategy {
  client: string;
  period: string;
  pillars: ContentPillar[];
  contentCalendar: ScheduledPost[];
  abTests: ABTest[];
  kpis: KPI[];
}

interface ScheduledPost {
  date: string;
  time: string;
  platform: string;
  pillar: string;
  content: string;
  objective: string;
  hashtags?: string[];
}

interface ABTest {
  id: string;
  hypothesis: string;
  variantA: string;
  variantB: string;
  metric: string;
  status: 'planned' | 'running' | 'completed';
  winner?: 'A' | 'B';
}

interface KPI {
  name: string;
  current: number;
  target: number;
  deadline: string;
}

// Data storage
const DATA_DIR = path.join(__dirname, 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadClients(): Record<string, Client> {
  if (fs.existsSync(CLIENTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveClients(clients: Record<string, Client>): void {
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
}

// Grok API call
async function callGrok(prompt: string, systemOverride?: string): Promise<string> {
  if (!XAI_API_KEY) {
    throw new Error('XAI_API_KEY non configurata');
  }

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: systemOverride || ONDE_AGENT_SYSTEM },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${error}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content || '';
}

/**
 * ONDE AGENT CLASS
 */
export class OndeAgent {
  private clients: Record<string, Client>;

  constructor() {
    this.clients = loadClients();
    this.initializeMagmatic();
  }

  // Initialize Magmatic as first client
  private initializeMagmatic(): void {
    if (!this.clients['magmatic']) {
      this.clients['magmatic'] = {
        id: 'magmatic',
        name: 'Magmatic',
        handles: {
          x: '@magmatic__',
          instagram: '@magmatic._',
        },
        pillars: [
          {
            id: 'la-river',
            name: 'LA River / Frogtown',
            description: 'Location, community, performance nel fiume. Free River Jams.',
            emoji: '🌊',
            examples: ['Performance al tramonto', 'Setup al fiume', 'Free River Jams announcement'],
          },
          {
            id: 'video-poetry',
            name: 'Video Poetry',
            description: 'Visual + musica + parole. Arte audiovisiva poetica.',
            emoji: '🎬',
            examples: ['where does the current call you', 'mi chiede di baciarla', 'cade la neve'],
          },
          {
            id: 'behind-scenes',
            name: 'Behind the Scenes',
            description: 'Setup, gear, processo creativo. Building in public.',
            emoji: '🎧',
            examples: ['Just started setting up', 'DJ setup', 'Synth e sampler'],
          },
          {
            id: 'citazioni',
            name: 'Citazioni / Filosofia',
            description: 'Libri, poesia, riflessioni. Contenuto che fa pensare.',
            emoji: '📚',
            examples: ['Spring teaches the earth to bloom', 'Thich Nhat Hanh', 'Riflessioni'],
          },
          {
            id: 'golden-hour',
            name: 'Golden Hour',
            description: 'Tramonti, atmosfera, visual puro. Mood content.',
            emoji: '🌅',
            examples: ['Sunset al fiume', 'Golden hour setup', 'Atmosfera LA'],
          },
          {
            id: 'building-public',
            name: 'Building in Public',
            description: 'Il processo, i progressi, le sfide. Autenticità.',
            emoji: '🔧',
            examples: ['Just getting started', 'Work in progress', 'Behind the music'],
          },
        ],
        targetAudience: [
          'Artisti indipendenti',
          'Amanti della poesia',
          'Community LA/Frogtown',
          'Music producers',
          'Visual artists',
          'Italiani in America',
        ],
        goals: [
          'Crescere community organicamente',
          'Convertire follower IG in follower X',
          'Promuovere Free River Jams',
          'Posizionarsi come artista unico (video poetry)',
        ],
        brandVoice: [
          'Poetico ma accessibile',
          'Autentico, mai hype',
          'Building in public',
          'Bilingue (IT/EN)',
        ],
        contentArchive: [],
        analytics: {
          bestPostingTimes: [
            { day: 'Sunday', hour: 18, score: 85 },
            { day: 'Saturday', hour: 11, score: 80 },
            { day: 'Friday', hour: 17, score: 75 },
          ],
          audienceGrowth: [],
        },
      };
      saveClients(this.clients);
    }
  }

  isAvailable(): boolean {
    return !!XAI_API_KEY;
  }

  // Get client data
  getClient(clientId: string): Client | undefined {
    return this.clients[clientId];
  }

  // List all clients
  listClients(): string[] {
    return Object.keys(this.clients);
  }

  // Add content to client archive
  addContentToArchive(clientId: string, content: ContentItem): void {
    if (this.clients[clientId]) {
      this.clients[clientId].contentArchive.push(content);
      saveClients(this.clients);
    }
  }

  // MAIN: Create social strategy for a client
  async createSocialStrategy(clientId: string, periodDays: number = 7): Promise<string> {
    const client = this.clients[clientId];
    if (!client) {
      return `Cliente "${clientId}" non trovato. Clienti disponibili: ${this.listClients().join(', ')}`;
    }

    if (!this.isAvailable()) {
      return this.fallbackStrategy(client);
    }

    const prompt = `Crea una strategia social per il cliente ${client.name} per i prossimi ${periodDays} giorni.

PROFILO CLIENTE:
- Nome: ${client.name}
- Handle X: ${client.handles.x}
- Handle Instagram: ${client.handles.instagram}
- Target: ${client.targetAudience.join(', ')}
- Obiettivi: ${client.goals.join(', ')}
- Voice: ${client.brandVoice.join(', ')}

CONTENT PILLARS:
${client.pillars.map(p => `${p.emoji} ${p.name}: ${p.description}`).join('\n')}

ANALYTICS:
- Best times: ${client.analytics.bestPostingTimes.map(t => `${t.day} ${t.hour}:00`).join(', ')}

RICHIESTA:
1. Analizza i pillar e suggerisci distribuzione % per il periodo
2. Crea un calendario editoriale con ${periodDays} giorni
3. Per ogni post: pillar, contenuto suggerito, orario, obiettivo
4. Proponi 2 A/B test da fare
5. Definisci 3 KPI da tracciare

Sii specifico e actionable.`;

    try {
      return await callGrok(prompt);
    } catch (error: any) {
      return `Errore: ${error.message}`;
    }
  }

  // Analyze content performance
  async analyzePerformance(clientId: string): Promise<string> {
    const client = this.clients[clientId];
    if (!client) {
      return `Cliente "${clientId}" non trovato.`;
    }

    if (!this.isAvailable()) {
      return 'Analisi non disponibile senza API key.';
    }

    const contentSummary = client.contentArchive.slice(-20).map(c =>
      `${c.type} (${c.pillar}): ${c.engagement?.likes || 0} likes, ${c.engagement?.comments || 0} comments`
    ).join('\n');

    const prompt = `Analizza le performance del cliente ${client.name}.

CONTENT RECENTI:
${contentSummary || 'Nessun contenuto tracciato ancora.'}

PILLARS:
${client.pillars.map(p => `${p.emoji} ${p.name}`).join(', ')}

Fornisci:
1. Quale pillar performa meglio
2. Quale pillar migliorare
3. Pattern da notare
4. Raccomandazioni specifiche`;

    try {
      return await callGrok(prompt);
    } catch (error: any) {
      return `Errore: ${error.message}`;
    }
  }

  // Research for client
  async research(clientId: string, query: string): Promise<string> {
    const client = this.clients[clientId];
    if (!this.isAvailable()) {
      return 'Ricerca non disponibile senza API key.';
    }

    const context = client
      ? `Contesto cliente: ${client.name} (${client.handles.x}), focus: ${client.pillars.map(p => p.name).join(', ')}`
      : 'Ricerca generica';

    const prompt = `${context}

RICERCA: ${query}

Fornisci informazioni utili, trend, opportunità. Sii pratico e actionable.`;

    try {
      return await callGrok(prompt);
    } catch (error: any) {
      return `Errore: ${error.message}`;
    }
  }

  // Generate post ideas for a pillar
  async generatePostIdeas(clientId: string, pillarId: string, count: number = 5): Promise<string> {
    const client = this.clients[clientId];
    if (!client) {
      return `Cliente "${clientId}" non trovato.`;
    }

    const pillar = client.pillars.find(p => p.id === pillarId);
    if (!pillar) {
      return `Pillar "${pillarId}" non trovato. Disponibili: ${client.pillars.map(p => p.id).join(', ')}`;
    }

    if (!this.isAvailable()) {
      return `Genera ${count} idee per il pillar "${pillar.name}" manualmente.`;
    }

    const prompt = `Genera ${count} idee di post per ${client.name} sul pillar "${pillar.name}".

PILLAR: ${pillar.emoji} ${pillar.name}
${pillar.description}

ESEMPI GIÀ FATTI: ${pillar.examples.join(', ')}

BRAND VOICE: ${client.brandVoice.join(', ')}

Per ogni idea:
1. Testo del post (max 280 char per X)
2. Tipo di media (foto/video/testo)
3. Call to action (se appropriato)
4. Hashtag suggeriti

Sii creativo ma coerente con il brand.`;

    try {
      return await callGrok(prompt);
    } catch (error: any) {
      return `Errore: ${error.message}`;
    }
  }

  // Chat freely with the agent
  async chat(message: string): Promise<string> {
    if (!this.isAvailable()) {
      return 'Chat non disponibile senza API key. Configura XAI_API_KEY.';
    }

    try {
      return await callGrok(message);
    } catch (error: any) {
      return `Errore: ${error.message}`;
    }
  }

  // Get agent status
  getStatus(): string {
    const clientList = this.listClients();
    return `🌊 *ONDE AGENT*

*Status:* ${this.isAvailable() ? '✅ Online' : '❌ Offline (API key mancante)'}
*Powered by:* Grok (xAI)

*Clienti:* ${clientList.length}
${clientList.map(id => {
  const c = this.clients[id];
  return `• ${c.name} (${c.handles.x || c.handles.instagram})`;
}).join('\n')}

*Comandi:*
• strategy <client> - Crea strategia social
• analyze <client> - Analizza performance
• ideas <client> <pillar> - Genera idee post
• research <client> <query> - Ricerca
• chat <messaggio> - Chat libera`;
  }

  private fallbackStrategy(client: Client): string {
    return `📋 STRATEGIA BASE per ${client.name}

(API key non disponibile - strategia template)

*Pillar da bilanciare:*
${client.pillars.map(p => `${p.emoji} ${p.name}: ~${Math.round(100 / client.pillars.length)}%`).join('\n')}

*Frequenza consigliata:*
• 1 post/giorno su X
• Varietà tra i pillar
• Best times: ${client.analytics.bestPostingTimes.map(t => `${t.day} ${t.hour}:00`).join(', ')}

*Prossimi passi:*
1. Configura XAI_API_KEY per strategia AI
2. Inizia a tracciare performance
3. Testa A/B su orari e formati`;
  }
}

// Export singleton
export const ondeAgent = new OndeAgent();
