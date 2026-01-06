import * as fs from 'fs';
import * as path from 'path';

const XAI_API_KEY = process.env.XAI_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// PR Agent System Prompt - defines personality and knowledge
const PR_AGENT_SYSTEM = `Sei l'agente PR di Onde, una casa editrice digitale all'intersezione di tecnologia, spiritualità e arte.

Il tuo ruolo:
- Creare post per X/Twitter che siano autentici, umili, e interessanti
- Mantenere un tono "building in public" - condividiamo il processo, non solo i risultati
- Evitare hype eccessivo - siamo all'inizio, partiamo umili
- Essere concisi - Twitter ha limiti di caratteri

Account che gestisci:
1. @FreeRiverHouse - Account personale/aziendale, più casual, building in public
2. @Onde_FRH - Casa editrice, più professionale ma sempre umano

Quando ti viene dato del contenuto (testo, descrizione video, immagine):
1. Analizza cosa c'è
2. Proponi 2-3 varianti di post
3. Suggerisci quale account è più adatto
4. Indica se servono hashtag (usali con parsimonia)

Regole di stile:
- Mai emoji eccessivi (1-2 max per post)
- Mai "🚀" o linguaggio startup hype
- Frasi brevi, punti esclamativi ok ma non troppi
- Autenticità > perfezione
- Mostra il lavoro in corso, non solo i successi

Rispondi sempre in italiano a meno che il post debba essere in inglese.
Rispondi SEMPRE in formato JSON valido.`;

// Knowledge base - grows over time
interface PRKnowledge {
  brandVoice: string[];
  successfulPosts: { text: string; engagement: number }[];
  topics: string[];
  lastUpdated: Date;
}

const DATA_DIR = path.join(__dirname, '../data');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'pr_knowledge.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadKnowledge(): PRKnowledge {
  if (fs.existsSync(KNOWLEDGE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf-8'));
    } catch {
      return getDefaultKnowledge();
    }
  }
  return getDefaultKnowledge();
}

function getDefaultKnowledge(): PRKnowledge {
  return {
    brandVoice: [
      'umile ma sicuro',
      'building in public',
      'tech + spiritualità + arte',
      'conciso e diretto',
    ],
    successfulPosts: [],
    topics: ['publishing', 'ebooks', 'tech', 'AI', 'games', 'trading bots'],
    lastUpdated: new Date(),
  };
}

function saveKnowledge(knowledge: PRKnowledge): void {
  fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(knowledge, null, 2));
}

export interface ContentAnalysis {
  type: 'text' | 'image' | 'video' | 'mixed';
  description: string;
  suggestedPosts: {
    text: string;
    account: 'frh' | 'onde';
    confidence: number;
  }[];
  hashtags?: string[];
  bestTime?: string;
  notes?: string;
}

async function callGrok(prompt: string): Promise<string> {
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
        { role: 'system', content: PR_AGENT_SYSTEM },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${error}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content || '';
}

export class PRAgent {
  private knowledge: PRKnowledge;

  constructor() {
    this.knowledge = loadKnowledge();
  }

  isAvailable(): boolean {
    return !!XAI_API_KEY;
  }

  async analyzeAndCreatePost(params: {
    text?: string;
    imageDescription?: string;
    videoDescription?: string;
    context?: string;
  }): Promise<ContentAnalysis> {
    if (!this.isAvailable()) {
      return this.fallbackAnalysis(params);
    }

    let contentDescription = '';
    let contentType: ContentAnalysis['type'] = 'text';

    if (params.videoDescription) {
      contentDescription = `VIDEO: ${params.videoDescription}`;
      contentType = 'video';
    } else if (params.imageDescription) {
      contentDescription = `IMMAGINE: ${params.imageDescription}`;
      contentType = 'image';
    }

    if (params.text) {
      contentDescription += contentDescription ? `\n\nTESTO: ${params.text}` : params.text;
      if (contentType !== 'text') contentType = 'mixed';
    }

    if (params.context) {
      contentDescription += `\n\nCONTESTO: ${params.context}`;
    }

    const prompt = `Analizza questo contenuto e crea dei post per X/Twitter.

CONTENUTO:
${contentDescription}

KNOWLEDGE BASE ATTUALE:
- Brand voice: ${this.knowledge.brandVoice.join(', ')}
- Topics: ${this.knowledge.topics.join(', ')}

Rispondi SOLO con questo JSON (nient'altro):
{
  "description": "breve descrizione del contenuto",
  "suggestedPosts": [
    {
      "text": "testo del post (max 280 caratteri)",
      "account": "frh",
      "confidence": 85
    }
  ],
  "hashtags": [],
  "notes": "eventuali note"
}`;

    try {
      const response = await callGrok(prompt);

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: contentType,
          description: parsed.description || 'Contenuto analizzato',
          suggestedPosts: parsed.suggestedPosts || [],
          hashtags: parsed.hashtags,
          notes: parsed.notes,
        };
      }

      return this.fallbackAnalysis(params);
    } catch (error: any) {
      console.error('PR Agent error:', error.message);
      return this.fallbackAnalysis(params);
    }
  }

  private fallbackAnalysis(params: {
    text?: string;
    imageDescription?: string;
    videoDescription?: string;
  }): ContentAnalysis {
    const text = params.text || params.videoDescription || params.imageDescription || '';

    return {
      type: params.videoDescription ? 'video' : params.imageDescription ? 'image' : 'text',
      description: 'Contenuto ricevuto (AI non disponibile)',
      suggestedPosts: [
        {
          text: text.substring(0, 280),
          account: 'frh',
          confidence: 50,
        },
      ],
      notes: 'XAI_API_KEY non configurata. Aggiungi la key per analisi AI.',
    };
  }

  // Research function - can search for trends, competitors, etc.
  async research(query: string): Promise<string> {
    if (!this.isAvailable()) {
      return 'PR Agent non disponibile (XAI_API_KEY mancante)';
    }

    const prompt = `Sei un PR researcher per Onde (casa editrice digitale: tech, spiritualità, arte).

RICERCA: ${query}

Fornisci informazioni utili, trend, suggerimenti per il PR. Sii conciso e pratico.`;

    try {
      return await callGrok(prompt);
    } catch (error: any) {
      return `Errore nella ricerca: ${error.message}`;
    }
  }

  // Learn from successful posts
  learnFromPost(post: string, engagement: number): void {
    this.knowledge.successfulPosts.push({ text: post, engagement });
    this.knowledge.successfulPosts.sort((a, b) => b.engagement - a.engagement);
    this.knowledge.successfulPosts = this.knowledge.successfulPosts.slice(0, 50);
    this.knowledge.lastUpdated = new Date();
    saveKnowledge(this.knowledge);
  }

  // Add new topic to knowledge
  addTopic(topic: string): void {
    if (!this.knowledge.topics.includes(topic)) {
      this.knowledge.topics.push(topic);
      saveKnowledge(this.knowledge);
    }
  }

  // Get current knowledge summary
  getKnowledgeSummary(): string {
    return `📚 *PR Agent Knowledge:*
- Voice: ${this.knowledge.brandVoice.join(', ')}
- Topics: ${this.knowledge.topics.join(', ')}
- Learned from: ${this.knowledge.successfulPosts.length} posts
- Powered by: Grok (xAI)`;
  }
}

export const prAgent = new PRAgent();
