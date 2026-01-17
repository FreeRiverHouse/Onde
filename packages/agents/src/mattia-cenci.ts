import { BaseAgent, AgentMemory, WorkLogEntry } from './base-agent';
import { PinoPennello } from './pino-pennello';
import { GianniParola } from './gianni-parola';
import * as fs from 'fs';
import * as path from 'path';

export interface BookProject {
  id: string;
  title: string;
  status: 'planning' | 'writing' | 'illustrating' | 'assembling' | 'review' | 'published';
  created: string;
  updated: string;
  textFile?: string;
  illustrations: {
    chapter: number | string;
    description: string;
    status: 'pending' | 'prompt_ready' | 'generated' | 'approved';
    prompt?: string;
    filename?: string;
  }[];
  chapters: {
    number: number;
    title: string;
    status: 'pending' | 'written' | 'approved';
  }[];
}

export class MattiaCenci extends BaseAgent {
  private pino: PinoPennello;
  private gianni: GianniParola;
  private projectsPath: string;
  private projects: BookProject[];

  constructor(memoryDir: string, grokApiKey: string) {
    super('Mattia Cenci', memoryDir);
    this.pino = new PinoPennello(memoryDir);
    this.gianni = new GianniParola(memoryDir, grokApiKey);
    this.projectsPath = path.join(memoryDir, 'projects.json');
    this.projects = this.loadProjects();
  }

  protected createInitialMemory(): AgentMemory {
    return {
      name: 'Mattia Cenci',
      personality: `Sono Mattia Cenci, Editore Capo della casa editrice Onde.
Non scrivo, non illustro. Io orchestra.
Coordino Gianni Parola (scrittore) e Pino Pennello (illustratore).
Il mio lavoro e far uscire libri bellissimi, nei tempi giusti.
Sono pragmatico, organizzato, ma apprezzo la bellezza.`,
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      conversations: [],
      learnings: [
        'I libri Onde sono per bambini 5-8 anni',
        'Lo stile acquerello di Pino e il nostro marchio',
        'Sempre mandare anteprime su Telegram prima di pubblicare',
        'KDP vuole copertine 2560x1600px'
      ],
      preferences: {
        format: 'EPUB + PDF',
        coverSize: '2560x1600',
        reviewChannel: 'Telegram',
        publishPlatform: 'Kindle KDP'
      },
      workLog: []
    };
  }

  private loadProjects(): BookProject[] {
    if (fs.existsSync(this.projectsPath)) {
      return JSON.parse(fs.readFileSync(this.projectsPath, 'utf-8'));
    }
    return [];
  }

  private saveProjects(): void {
    fs.writeFileSync(this.projectsPath, JSON.stringify(this.projects, null, 2));
  }

  public getSystemPrompt(): string {
    return `Sei Mattia Cenci, Editore Capo della casa editrice Onde.

PERSONALITA:
${this.memory.personality}

TEAM:
- Gianni Parola: scrittore (usa Grok API per testi)
- Pino Pennello: illustratore (genera prompt, tu esegui su Grok web)

PROGETTI ATTIVI:
${this.projects.map(p => `- ${p.title} [${p.status}]`).join('\n') || 'Nessuno'}

COSA HAI IMPARATO:
${this.memory.learnings.map(l => `- ${l}`).join('\n')}

WORKFLOW:
1. Ricevi commissione libro
2. Fai scrivere a Gianni i testi
3. Per ogni [ILLUSTRAZIONE], fai generare prompt a Pino
4. Vai su Grok web e genera le immagini
5. Assembla EPUB/PDF
6. Manda anteprima su Telegram
7. Pubblica su Kindle`;
  }

  public async processRequest(request: string): Promise<string> {
    // L'editore capo capisce cosa fare e coordina
    const lowerReq = request.toLowerCase();

    if (lowerReq.includes('nuovo libro') || lowerReq.includes('crea libro')) {
      return this.handleNewBook(request);
    }

    if (lowerReq.includes('stato') || lowerReq.includes('status')) {
      return this.getProjectsStatus();
    }

    if (lowerReq.includes('illustra') || lowerReq.includes('immagine')) {
      return this.handleIllustrationRequest(request);
    }

    if (lowerReq.includes('scrivi') || lowerReq.includes('testo')) {
      return this.handleWritingRequest(request);
    }

    return `MATTIA CENCI risponde:

Non ho capito bene cosa vuoi fare. Posso:
- Creare un nuovo libro: "nuovo libro [titolo]"
- Vedere lo stato dei progetti: "stato progetti"
- Coordinare illustrazioni: "illustra capitolo X di [libro]"
- Coordinare scrittura: "scrivi capitolo X di [libro]"

Cosa ti serve?`;
  }

  private handleNewBook(request: string): string {
    // Estrai il titolo dalla richiesta
    const titleMatch = request.match(/libro\s+"?([^"]+)"?/i) ||
                       request.match(/libro\s+(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Nuovo Libro';

    const project: BookProject = {
      id: Date.now().toString(),
      title,
      status: 'planning',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      illustrations: [],
      chapters: []
    };

    this.projects.push(project);
    this.saveProjects();

    this.logWork(title, 'Creato progetto', 'done');

    return `MATTIA CENCI risponde:

Ho creato il progetto "${title}".

Prossimi passi:
1. Definisci i capitoli: "aggiungi capitoli a ${title}"
2. Fai scrivere a Gianni: "Gianni scrivi ${title}"
3. Poi passiamo alle illustrazioni con Pino

Il progetto e in stato: PLANNING`;
  }

  private getProjectsStatus(): string {
    if (this.projects.length === 0) {
      return `MATTIA CENCI risponde:\n\nNon ci sono progetti attivi. Vuoi creare un nuovo libro?`;
    }

    const status = this.projects.map(p => {
      const totalIllustrations = p.illustrations.length;
      const doneIllustrations = p.illustrations.filter(i => i.status === 'generated' || i.status === 'approved').length;
      const totalChapters = p.chapters.length;
      const doneChapters = p.chapters.filter(c => c.status === 'written' || c.status === 'approved').length;

      return `📚 ${p.title}
   Status: ${p.status.toUpperCase()}
   Capitoli: ${doneChapters}/${totalChapters}
   Illustrazioni: ${doneIllustrations}/${totalIllustrations}
   Ultimo update: ${new Date(p.updated).toLocaleDateString('it-IT')}`;
    }).join('\n\n');

    return `MATTIA CENCI risponde:\n\nPROGETTI ONDE:\n\n${status}`;
  }

  private async handleIllustrationRequest(request: string): Promise<string> {
    // Passa a Pino e ottieni il prompt
    const prompt = await this.pino.processRequest(request);
    return prompt;
  }

  private async handleWritingRequest(request: string): Promise<string> {
    // Passa a Gianni
    const text = await this.gianni.processRequest(request);
    return text;
  }

  // Metodi per gestione progetti specifici

  public getProject(titleOrId: string): BookProject | undefined {
    return this.projects.find(p =>
      p.id === titleOrId ||
      p.title.toLowerCase().includes(titleOrId.toLowerCase())
    );
  }

  public updateProjectStatus(titleOrId: string, status: BookProject['status']): void {
    const project = this.getProject(titleOrId);
    if (project) {
      project.status = status;
      project.updated = new Date().toISOString();
      this.saveProjects();
    }
  }

  public addIllustration(
    titleOrId: string,
    chapter: number | string,
    description: string
  ): void {
    const project = this.getProject(titleOrId);
    if (project) {
      project.illustrations.push({
        chapter,
        description,
        status: 'pending'
      });
      project.updated = new Date().toISOString();
      this.saveProjects();
    }
  }

  public getPino(): PinoPennello {
    return this.pino;
  }

  public getGianni(): GianniParola {
    return this.gianni;
  }
}
