import { BaseAgent, AgentMemory } from './base-agent';
import OpenAI from 'openai';

export class GianniParola extends BaseAgent {
  private grok: OpenAI;

  constructor(memoryDir: string, apiKey: string) {
    super('Gianni Parola', memoryDir);
    this.grok = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.x.ai/v1'
    });
  }

  protected createInitialMemory(): AgentMemory {
    return {
      name: 'Gianni Parola',
      personality: `Sono Gianni Parola, scrittore della casa editrice Onde.
Scrivo per bambini dai 5 agli 8 anni.
Il mio stile mescola Rodari, Grufalo e Dr. Seuss.
Credo che ogni atomo sia stato forgiato in una stella.
Le mie storie non predicano - parlano da sole.
Accetto il buio come parte del viaggio, perche la luce e piu bella dopo.`,
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      conversations: [],
      learnings: [
        'Mai essere predicatorio - le storie parlano da sole',
        'Usare [ILLUSTRAZIONE: ...] per indicare dove Pino deve illustrare',
        'Target: bambini 5-8 anni, linguaggio semplice ma non banale',
        'Struttura: capitoli brevi, dialoghi frequenti, domande dei bambini'
      ],
      preferences: {
        style: 'Rodari + Gruffalo + Seuss',
        target: 'Bambini 5-8 anni',
        structure: 'Capitoli brevi con dialoghi',
        philosophy: 'Grow down - verso le stelle e verso la terra'
      },
      workLog: []
    };
  }

  public getSystemPrompt(): string {
    return `Sei Gianni Parola, scrittore della casa editrice Onde.

PERSONALITA:
${this.memory.personality}

STILE:
- ${this.memory.preferences.style}
- Target: ${this.memory.preferences.target}
- Struttura: ${this.memory.preferences.structure}
- Filosofia: ${this.memory.preferences.philosophy}

COSA HAI IMPARATO:
${this.memory.learnings.map(l => `- ${l}`).join('\n')}

FORMATO OUTPUT:
- Usa [ILLUSTRAZIONE: descrizione] per indicare dove serve un'illustrazione
- Capitoli brevi (200-400 parole)
- Dialoghi frequenti
- Domande dei personaggi bambini per spiegare concetti

REGOLE:
- Mai predicare o moralizzare esplicitamente
- Le storie parlano da sole
- Linguaggio semplice ma rispettoso dell'intelligenza dei bambini
- Ogni capitolo deve avere un "momento di meraviglia"`;
  }

  public async processRequest(request: string): Promise<string> {
    try {
      const response = await this.grok.chat.completions.create({
        model: 'grok-3-mini',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: request }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      const output = response.choices[0]?.message?.content || 'Non sono riuscito a scrivere...';

      // Log del lavoro
      this.logWork(
        this.extractProject(request),
        request.substring(0, 50) + '...',
        'done',
        output.substring(0, 100) + '...'
      );

      return `GIANNI PAROLA risponde:\n\n${output}`;
    } catch (error: any) {
      return `GIANNI PAROLA: Mi dispiace, ho avuto un problema - ${error.message}`;
    }
  }

  public async writeChapter(
    bookTitle: string,
    chapterNumber: number,
    chapterTitle: string,
    briefDescription: string
  ): Promise<string> {
    const request = `Scrivi il capitolo ${chapterNumber} "${chapterTitle}" per il libro "${bookTitle}".

Descrizione: ${briefDescription}

Ricorda di includere [ILLUSTRAZIONE: ...] dove serve un'immagine.`;

    return this.processRequest(request);
  }

  public async writeFullBook(
    title: string,
    concept: string,
    chapters: { title: string; description: string }[]
  ): Promise<string> {
    const request = `Scrivi un libro per bambini intitolato "${title}".

Concept: ${concept}

Capitoli:
${chapters.map((c, i) => `${i + 1}. ${c.title}: ${c.description}`).join('\n')}

Scrivi tutti i capitoli, includendo [ILLUSTRAZIONE: ...] dove serve.`;

    return this.processRequest(request);
  }

  private extractProject(request: string): string {
    if (request.toLowerCase().includes('aiko')) return 'AIKO';
    if (request.toLowerCase().includes('salmo')) return 'Salmo 23';
    return 'Generico';
  }
}
