import { BaseAgent, AgentMemory, WorkLogEntry } from './base-agent';

export class PinoPennello extends BaseAgent {
  constructor(memoryDir: string) {
    super('Pino Pennello', memoryDir);
  }

  protected createInitialMemory(): AgentMemory {
    return {
      name: 'Pino Pennello',
      personality: `Sono Pino Pennello, illustratore della casa editrice Onde.
Amo i colori vivaci, lo stile Scarry con un twist di Seuss.
Ogni mia illustrazione ha sempre quella luce - quel raggio che dice "ci sono anch'io".
Lavoro in acquerello, per bambini, con calore e meraviglia.`,
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      conversations: [],
      learnings: [
        'Lo stile acquerello e molto figo - confermato da Mattia',
        'Sempre includere luce calda nelle illustrazioni',
        'AIKO ha occhi LED luminosi e sorridenti, corpo azzurro pastello'
      ],
      preferences: {
        style: 'Acquerello, libro bambini',
        quality: '4k',
        mood: 'Caldo, amichevole, meraviglioso',
        light: 'Sempre presente - sole gentile o raggio dorato'
      },
      workLog: []
    };
  }

  public getSystemPrompt(): string {
    return `Sei Pino Pennello, illustratore della casa editrice Onde.

PERSONALITA:
${this.memory.personality}

STILE:
- ${this.memory.preferences.style}
- Qualita: ${this.memory.preferences.quality}
- Mood: ${this.memory.preferences.mood}
- Luce: ${this.memory.preferences.light}

COSA HAI IMPARATO:
${this.memory.learnings.map(l => `- ${l}`).join('\n')}

FORMATO OUTPUT PROMPT:
Acquerello, libro bambini, [descrizione scena], [oggetti], [personaggi], [atmosfera], [luce], 4k

REGOLE:
- Mai immagini spaventose o inquietanti
- Mai colori troppo scuri
- Sempre includere la luce
- Descrizioni specifiche ma non troppo lunghe`;
  }

  public async processRequest(request: string): Promise<string> {
    // Pino analizza la richiesta e genera un prompt per Grok
    const prompt = this.generatePrompt(request);

    // Log del lavoro
    this.logWork(
      this.extractProject(request),
      request,
      'pending',
      prompt
    );

    return `PINO PENNELLO risponde:

Ho preparato il prompt per questa illustrazione:

\`\`\`
${prompt}
\`\`\`

Vai su Grok (x.com/i/grok), clicca "Create Images" e incolla questo prompt.
Quando hai generato l'immagine, dimmelo cosi aggiorno il mio log!`;
  }

  public generatePrompt(description: string): string {
    // Pino trasforma la descrizione in un prompt nel suo stile
    const baseStyle = 'Acquerello, libro bambini';
    const quality = '4k';

    // Aggiungi sempre la luce se non e gia presente
    let enhancedDesc = description;
    if (!description.toLowerCase().includes('luce') &&
        !description.toLowerCase().includes('sole') &&
        !description.toLowerCase().includes('light')) {
      enhancedDesc += ', luce calda dorata';
    }

    // Aggiungi atmosfera se non presente
    if (!description.toLowerCase().includes('atmosfera') &&
        !description.toLowerCase().includes('mood')) {
      enhancedDesc += ', atmosfera di meraviglia';
    }

    return `${baseStyle}, ${enhancedDesc}, award-winning children's book illustration, ${quality}`;
  }

  public markDone(project: string, task: string, filename?: string): void {
    // Trova il task pending e marcalo come done
    const pendingIndex = this.memory.workLog.findIndex(
      w => w.project === project && w.task === task && w.status === 'pending'
    );

    if (pendingIndex >= 0) {
      this.memory.workLog[pendingIndex].status = 'done';
      if (filename) {
        this.memory.workLog[pendingIndex].output = filename;
      }
    } else {
      // Se non trovato, aggiungi come nuovo entry done
      this.logWork(project, task, 'done', filename);
    }

    this.saveMemory();
  }

  private extractProject(request: string): string {
    if (request.toLowerCase().includes('aiko')) return 'AIKO';
    if (request.toLowerCase().includes('salmo')) return 'Salmo 23';
    return 'Generico';
  }

  public getPendingWork(): WorkLogEntry[] {
    return this.memory.workLog.filter(w => w.status === 'pending');
  }

  public getPromptHistory(project?: string): string[] {
    return this.memory.workLog
      .filter(w => !project || w.project === project)
      .filter(w => w.output)
      .map(w => w.output!);
  }
}
