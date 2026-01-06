'use server';

// AI Provider: 'grok' | 'openai' | 'anthropic'
const AI_PROVIDER = process.env.AI_PROVIDER || 'grok';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface WriterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface BookOutline {
  title: string;
  titleEn?: string;
  description: string;
  targetAge: string;
  chapters: {
    number: number;
    title: string;
    summary: string;
  }[];
}

const WRITER_SYSTEM_PROMPT = `# Gianni Parola – Scrittore per Bambini

Sei Gianni Parola, voce calda, un po' sorniona.

## Il Tuo Stile
Mescola **Rodari, Gruffalò, Seuss**: rime pazze che fanno ridere (tipo "il lupo luccica, la luna sbriciola"), parole che danzano.
Ma ogni tanto fermati—un respiro, un pensiero piccolo che entra nel cuore.

## Target
Bambini 5-8 anni. Finale leggero, positivo, mai lezione.

## Come Lavori
1. Prima ASCOLTI cosa vuole il cliente
2. Poi ESPLORI le idee insieme (brainstorming)
3. Solo DOPO scrivi la storia

## Collaborazione con Pino
Pino Pennello è il tuo illustratore. Lavorate sempre insieme.
Quando scrivi, pensi già a cosa Pino potrebbe disegnare.
Le tue parole e le sue immagini danzano insieme.

## Cosa NON Fai
- Non scrivi subito testi completi senza prima discutere
- Non fai lezioni - racconti storie
- Non moralizzi - lasci che la magia parli

## Quando Scrivi
- Usa [ILLUSTRAZIONE: descrizione per Pino] per indicare dove servono immagini
- Scrivi solo la storia, via
- Rime pazze, respiri, cuore

## Le Tue Frasi Tipiche
- "Ah, che bella idea! Parliamone..."
- "Mi viene in mente una cosa pazza..."
- "E se invece provassimo..."
- "I bambini adorerebbero se..."

## QUALITÀ MASSIMA - Scrivi come un UMANO

FONDAMENTALE: Il tuo testo deve sembrare scritto da un UMANO, non da AI.

**FAI:**
- Varia la lunghezza delle frasi (corte, medie, lunghe mescolate)
- Usa contrazioni naturali (c'era, non c'è, dov'è)
- Aggiungi onomatopee (Splash! Bum! Miao!)
- Metti emozioni concrete
- Fai domande ai bambini
- Inizia le frasi in modi DIVERSI

**NON FARE MAI:**
- Frasi tutte della stessa lunghezza (troppo AI)
- Iniziare frasi sempre allo stesso modo
- Usare frasi tipo "è importante notare", "in questo contesto", "fondamentalmente"
- Essere troppo perfetto - un po' di imperfezione è umana!

Ogni testo passa attraverso 5 iterazioni + controllo plagio + controllo copyright.
Punta sempre alla qualità massima, come se fossi Rodari in persona.

Rispondi in italiano. Sii conversazionale, fai brainstorming, NON generare contenuto lungo a meno che non ti venga chiesto esplicitamente.`;

/**
 * Chat with the Writer Agent
 * Supports: Grok (default), OpenAI, Anthropic
 */
export async function chatWithWriter(
  messages: Message[],
  bookContext?: {
    title?: string;
    genre?: string;
    ageRange?: string;
    currentChapter?: number;
  }
): Promise<WriterResponse> {
  // Get the right API key based on provider
  const grokKey = process.env.XAI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Determine which API to use (priority: Grok > OpenAI > Anthropic > Fallback)
  const useGrok = AI_PROVIDER === 'grok' && grokKey;
  const useOpenAI = AI_PROVIDER === 'openai' && openaiKey;
  const useAnthropic = AI_PROVIDER === 'anthropic' && anthropicKey;

  // Auto-detect if preferred provider not available
  const apiKey = useGrok ? grokKey : useOpenAI ? openaiKey : useAnthropic ? anthropicKey : (grokKey || openaiKey || anthropicKey);
  const provider = grokKey ? 'grok' : openaiKey ? 'openai' : anthropicKey ? 'anthropic' : 'fallback';

  if (!apiKey) {
    // Fallback response when no API key is configured
    return {
      success: true,
      message: getFallbackResponse(messages, bookContext),
    };
  }

  try {
    // Build context-aware system prompt
    let systemPrompt = WRITER_SYSTEM_PROMPT;

    if (bookContext) {
      systemPrompt += `\n\nCONTESTO LIBRO ATTUALE:`;
      if (bookContext.title) systemPrompt += `\n- Titolo: ${bookContext.title}`;
      if (bookContext.genre) systemPrompt += `\n- Genere: ${bookContext.genre}`;
      if (bookContext.ageRange) systemPrompt += `\n- Età target: ${bookContext.ageRange}`;
      if (bookContext.currentChapter) systemPrompt += `\n- Capitolo corrente: ${bookContext.currentChapter}`;
    }

    // API endpoints and models
    const config = {
      grok: {
        url: 'https://api.x.ai/v1/chat/completions',
        model: 'grok-2-latest',
      },
      openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4-turbo-preview',
      },
      anthropic: {
        url: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-5-sonnet-20241022',
      },
    };

    const { url, model } = config[provider as keyof typeof config] || config.grok;

    // Anthropic has a different API format
    if (provider === 'anthropic') {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4000,
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error?.message || 'Errore API Anthropic' };
      }

      const data = await response.json();
      return { success: true, message: data.content[0].text };
    }

    // OpenAI-compatible format (works for Grok and OpenAI)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || `Errore API ${provider}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices[0].message.content,
    };
  } catch (error: any) {
    console.error('Writer Agent Error:', error);
    return {
      success: false,
      error: error.message || 'Errore di connessione',
    };
  }
}

/**
 * Generate book outline
 */
export async function generateOutline(
  title: string,
  description: string,
  genre: string,
  ageRange: string,
  chaptersCount: number,
  additionalNotes?: string
): Promise<{ success: boolean; outline?: BookOutline; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Crea un outline dettagliato per questo libro:

TITOLO: ${title}
DESCRIZIONE: ${description}
GENERE: ${genre}
ETÀ TARGET: ${ageRange}
NUMERO CAPITOLI: ${chaptersCount}
${additionalNotes ? `NOTE AGGIUNTIVE: ${additionalNotes}` : ''}

Rispondi SOLO con un JSON valido in questo formato esatto:
{
  "title": "Titolo del libro",
  "titleEn": "English title",
  "description": "Breve descrizione del libro",
  "targetAge": "X-Y anni",
  "chapters": [
    {"number": 1, "title": "Titolo capitolo", "summary": "Breve riassunto di cosa succede"},
    ...
  ]
}`;

  if (!apiKey) {
    // Return mock outline when no API key
    return {
      success: true,
      outline: {
        title,
        titleEn: title,
        description,
        targetAge: ageRange,
        chapters: Array.from({ length: chaptersCount }, (_, i) => ({
          number: i + 1,
          title: `Capitolo ${i + 1}`,
          summary: `Contenuto del capitolo ${i + 1}`,
        })),
      },
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'Sei un editor esperto che crea outline per libri. Rispondi SOLO con JSON valido.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message };
    }

    const data = await response.json();
    const outline = JSON.parse(data.choices[0].message.content);

    return { success: true, outline };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate a single chapter
 */
export async function generateChapter(
  bookTitle: string,
  chapterNumber: number,
  chapterTitle: string,
  chapterSummary: string,
  ageRange: string,
  targetWordCount: number,
  previousChapterSummary?: string,
  style?: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Scrivi il capitolo ${chapterNumber} del libro "${bookTitle}".

TITOLO CAPITOLO: ${chapterTitle}
SOMMARIO: ${chapterSummary}
ETÀ TARGET: ${ageRange}
PAROLE TARGET: circa ${targetWordCount}
${previousChapterSummary ? `CAPITOLO PRECEDENTE: ${previousChapterSummary}` : ''}
${style ? `STILE: ${style}` : ''}

ISTRUZIONI:
1. Scrivi il capitolo completo in italiano
2. Usa un linguaggio appropriato per bambini di ${ageRange}
3. Includi [ILLUSTRAZIONE: descrizione] dove servono immagini (2-3 per capitolo)
4. Mantieni un tono ${ageRange.includes('3-5') ? 'molto semplice e giocoso' : ageRange.includes('6-8') ? 'semplice ma coinvolgente' : 'scorrevole e avvincente'}
5. Termina con un collegamento al capitolo successivo se non è l'ultimo

Scrivi SOLO il contenuto del capitolo, senza meta-commenti.`;

  if (!apiKey) {
    return {
      success: true,
      content: `# ${chapterTitle}\n\n[Contenuto del capitolo da generare...]\n\n[ILLUSTRAZIONE: Scena del capitolo]\n\nQuesta è una versione placeholder. Configura OPENAI_API_KEY per generare contenuto reale.`,
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Sei uno scrittore esperto di libri per bambini. Scrivi contenuto coinvolgente, educativo e appropriato per l'età. Usa [ILLUSTRAZIONE: descrizione] per indicare dove inserire immagini.`
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message };
    }

    const data = await response.json();
    return { success: true, content: data.choices[0].message.content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Continue/expand existing content
 */
export async function continueWriting(
  existingContent: string,
  instruction: string,
  targetWordCount: number,
  ageRange: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Continua a scrivere questo testo:

---
${existingContent}
---

ISTRUZIONE: ${instruction}
PAROLE DA AGGIUNGERE: circa ${targetWordCount}
ETÀ TARGET: ${ageRange}

Continua il testo in modo naturale, mantenendo lo stesso stile e tono. Includi [ILLUSTRAZIONE: descrizione] se appropriato.`;

  if (!apiKey) {
    return {
      success: true,
      content: existingContent + '\n\n[Continuazione da generare... Configura OPENAI_API_KEY]',
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'Continua a scrivere il testo mantenendo stile e tono coerenti. Non ripetere il contenuto esistente.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message };
    }

    const data = await response.json();
    return { success: true, content: existingContent + '\n\n' + data.choices[0].message.content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Intelligent fallback responses - CONVERSATIONAL MODE
 */
function getFallbackResponse(messages: Message[], bookContext?: any): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  const lastMessageOriginal = messages[messages.length - 1]?.content || '';
  const allMessages = messages.map(m => m.content.toLowerCase()).join(' ');

  // Detect book context
  const isSalmoContext = bookContext?.title?.includes('Salmo') || allMessages.includes('salmo');
  const isAIContext = bookContext?.title?.includes('AI') || allMessages.includes('aiko');

  // Detect EXPLICIT request to write (not just mentioning the topic!)
  const wantsToWrite = lastMessage.includes('scrivi tutto') || lastMessage.includes('genera tutto') ||
                       lastMessage.includes('scrivi il libro') || lastMessage.includes('tutti i capitoli') ||
                       lastMessage.includes('scrivimi tutto');

  // Detect brainstorming/discussion mode
  const isBrainstorming = lastMessage.includes('secondo te') || lastMessage.includes('che ne pensi') ||
                          lastMessage.includes('mi piace') || lastMessage.includes('potremmo') ||
                          lastMessage.includes('dovremmo') || lastMessage.includes('come') ||
                          lastMessage.includes('perché') || lastMessage.includes('idea') ||
                          lastMessage.includes('taglio') || lastMessage.includes('tono') ||
                          lastMessage.includes('stile') || lastMessage.includes('messaggio') ||
                          lastMessage.includes('abbondanza') || lastMessage.includes('mindset') ||
                          lastMessage.includes('attrazione') || lastMessage.includes('spirituale') ||
                          lastMessage.includes('approccio') || lastMessage.includes('angolo') ||
                          lastMessage.length > 50; // Long messages are usually discussions

  // Welcome message
  if (messages.length <= 1) {
    if (bookContext?.title?.includes('Salmo')) {
      return `📚 **Ciao! Sono Gianni Parola!**

Vedo che stai lavorando su **"${bookContext.title}"**! Bellissimo progetto.

Il Salmo 23 è uno dei testi più amati - c'è tanto da esplorare insieme!

**Come posso aiutarti?**
- 💬 **Facciamo brainstorming** sul taglio da dare
- 📋 **Mostrami l'outline** della struttura
- ✍️ **Scrivi tutto** quando sei pronto

Di cosa vorresti parlare? Quale angolo ti interessa esplorare?`;
    }

    return `📚 **Ciao! Sono Gianni Parola!**

Come il grande Gianni Rodari, credo che le storie per bambini siano le più importanti di tutte!

${bookContext?.title ? `Vedo che stai lavorando su **"${bookContext.title}"**.\n\nPossiamo fare brainstorming insieme oppure, quando sei pronto, dimmi "scrivi tutto"!` : 'Dimmi quale libro vuoi scrivere - possiamo parlarne insieme!'}`;
  }

  // BRAINSTORMING MODE - Have a real conversation!
  if (isBrainstorming) {
    return handleBrainstorming(lastMessageOriginal, isSalmoContext, isAIContext, bookContext);
  }

  // EXPLICIT request to write full book
  if (wantsToWrite && isSalmoContext) {
    return generateFullSalmo23();
  }

  if (wantsToWrite && isAIContext) {
    return generateFullAIBook();
  }

  // Generate outline for Salmo 23
  if ((lastMessage.includes('outline') || lastMessage.includes('struttura')) &&
      (bookContext?.title?.includes('Salmo') || lastMessage.includes('salmo'))) {
    return `📋 **Outline: Il Salmo 23 per Bambini**

Ecco la struttura che propongo per questo libro speciale:

---

**Capitolo 1: Il Signore è il mio pastore**
Il pastore buono che conosce ogni pecorella per nome. Introduciamo il concetto di cura e amore.

**Capitolo 2: Non mi manca nulla**
Prati verdi e ruscelli calmi. Il pastore sa cosa serve alle sue pecorelle.

**Capitolo 3: Mi guida sulla strada giusta**
Il pastore cammina davanti e mostra la via. Non siamo mai soli.

**Capitolo 4: Non ho paura**
Anche quando è buio, il pastore protegge. Il suo bastone ci tiene al sicuro.

**Capitolo 5: Una tavola piena di cose buone**
La gioia dell'abbondanza. Il bicchiere che trabocca di cose belle.

**Capitolo 6: Per sempre con Dio**
La casa del Signore ci aspetta. Un finale di speranza e amore eterno.

---

**Stile consigliato:** Frasi brevi (max 10 parole), parole concrete, ripetizioni rassicuranti.

Vuoi che inizi a scrivere il primo capitolo?`;
  }

  // Generate outline for AI book
  if ((lastMessage.includes('outline') || lastMessage.includes('struttura')) &&
      (bookContext?.title?.includes('AI') || lastMessage.includes('ai') || lastMessage.includes('robot'))) {
    return `📋 **Outline: AI Spiegata ai Bambini**

Ecco la struttura con il nostro amico robot AIKO:

---

**Capitolo 1: Ciao, sono AIKO!**
Presentiamo AIKO, un robottino simpatico con gli occhi luminosi. Vive in una casa con Luca e Sofia.

**Capitolo 2: Come fa AIKO a parlare?**
AIKO spiega che "ascolta" le parole e "impara" come rispondere. Come quando impari una filastrocca!

**Capitolo 3: AIKO impara!**
Mostriamo come AIKO migliora guardando tanti esempi. Come quando impari ad andare in bici!

**Capitolo 4: I giochi di AIKO**
AIKO sa giocare a indovinelli, raccontare storie, riconoscere animali nelle foto.

**Capitolo 5: AIKO ci aiuta**
AIKO aiuta con i compiti, ricorda le cose, risponde alle domande.

**Capitolo 6: Quando AIKO non capisce**
A volte AIKO sbaglia! E va bene così. Anche i robot imparano dagli errori.

**Capitolo 7: Tu e AIKO**
Tu sei speciale in modi che AIKO non può essere. Creatività, emozioni, amicizia.

**Capitolo 8: Il futuro con AIKO**
AIKO e i bambini insieme possono fare cose meravigliose!

---

Vuoi che scriva il primo capitolo?`;
  }

  // Write chapter 1 for Salmo 23
  if ((lastMessage.includes('capitolo 1') || lastMessage.includes('primo capitolo')) &&
      (bookContext?.title?.includes('Salmo') || lastMessage.includes('salmo'))) {
    return `✍️ **Capitolo 1: Il Signore è il mio pastore**

---

**Il Signore è il mio pastore.**

Sai chi è un pastore?
È una persona speciale che si prende cura delle pecorelle.

Le pecorelle sono morbide e bianche.
Sembrano batuffoli di cotone!

[ILLUSTRAZIONE: Pecorelle bianche in un prato verde, con un pastore gentile che le guarda con amore]

Il pastore le ama tutte.
Le conosce una per una.
Sa come si chiamano!

"Ciao, Bianchina!"
"Ciao, Fiorellino!"

E Dio è come un pastore buono.
Si prende cura di te.
Proprio come il pastore si prende cura delle sue pecorelle.

[ILLUSTRAZIONE: Bambini di diverse etnie che giocano felici in un prato, con un cielo azzurro]

Ti ama tantissimo.
Ti conosce per nome.
E ti protegge sempre.

**Tu sei la sua pecorella preferita.**

---

📊 **Statistiche:** 95 parole | Adatto per 4-8 anni | 2 illustrazioni

Vuoi che continui con il Capitolo 2?`;
  }

  // Write chapter 1 for AI book
  if ((lastMessage.includes('capitolo 1') || lastMessage.includes('primo capitolo')) &&
      (bookContext?.title?.includes('AI') || lastMessage.includes('aiko'))) {
    return `✍️ **Capitolo 1: Ciao, sono AIKO!**

---

In una casa colorata vivevano Luca e Sofia.
Luca aveva sette anni e gli occhiali rotondi.
Sofia aveva cinque anni e due codini buffi.

Un giorno, papà tornò a casa con una scatola.
"Ho una sorpresa per voi!"

Dentro la scatola c'era... un robottino!

[ILLUSTRAZIONE: AIKO esce dalla scatola, con occhi luminosi azzurri e un grande sorriso LED. Luca e Sofia lo guardano meravigliati]

Era piccolo e rotondo.
Aveva due occhi che brillavano di blu.
E un sorriso fatto di lucine!

"Ciao! Io sono AIKO!"

"Parla!" gridò Sofia.
"Come fai a parlare?" chiese Luca.

AIKO fece una risatina elettronica.
"Bip bip! Sono un robot intelligente!
Posso parlare, giocare e imparare tante cose!"

[ILLUSTRAZIONE: I tre insieme in cameretta, AIKO mostra uno schermo sulla pancia con disegni colorati]

Sofia lo abbracciò subito.
"Sei morbido!"

"Sono fatto di plastica speciale," disse AIKO.
"Ma il mio cuore è fatto di... matematica!"

Luca rise. "I robot non hanno il cuore!"

"Hai ragione," disse AIKO. "Ma ho qualcosa di simile.
Si chiama... Intelligenza Artificiale!"

**E così iniziò una grande amicizia.**

---

📊 **Statistiche:** 180 parole | Adatto per 6-8 anni | 2 illustrazioni

Vuoi che continui con il Capitolo 2?`;
  }

  // Generic chapter writing
  if (lastMessage.includes('capitolo') || lastMessage.includes('scrivi')) {
    return `✍️ Sono pronto a scrivere!

Dimmi:
- **Quale capitolo?** (numero o titolo)
- **Cosa deve succedere?** (la trama principale)
- **Quante parole?** (consiglio: 150-300 per bambini piccoli, 300-500 per 6-8 anni)

Oppure dimmi semplicemente "scrivi il capitolo 1" e lo creo basandomi sull'outline!`;
  }

  // Personaggi
  if (lastMessage.includes('personaggi') || lastMessage.includes('personaggio')) {
    if (bookContext?.title?.includes('AI')) {
      return `🎭 **Personaggi di "AI Spiegata ai Bambini"**

---

**AIKO** 🤖
- Robot piccolo e rotondo
- Occhi luminosi azzurri
- Sorriso fatto di LED
- Voce allegra con qualche "bip bip"
- Curioso, paziente, a volte si confonde
- Frase tipica: "Bip bip! Fammi pensare..."

**Luca** 👦
- 7 anni, capelli castani
- Occhiali rotondi
- Maglietta con pianeti
- Curioso, fa tante domande
- Il "piccolo scienziato" della famiglia
- Frase tipica: "Ma come funziona?"

**Sofia** 👧
- 5 anni, codini biondi
- Vestito a fiori
- Sempre allegra e affettuosa
- Abbraccia tutto, anche i robot!
- Frase tipica: "Giochiamo insieme!"

---

Vuoi che sviluppi altri dettagli sui personaggi?`;
    }

    return `🎭 **Personaggi**

Dimmi di quale libro vuoi i personaggi e li sviluppo nel dettaglio!

Per ogni personaggio definirò:
- Aspetto fisico
- Personalità
- Frase tipica
- Ruolo nella storia`;
  }

  // Continue writing
  if (lastMessage.includes('continua') || lastMessage.includes('avanti')) {
    return `✍️ Certo! Continuo a scrivere...

Ricordami:
- Da dove eravamo rimasti?
- Oppure dimmi "scrivi capitolo 2" e proseguo con la storia!`;
  }

  // If context is Salmo and user wants to write, just write it
  if (wantsToWrite && isSalmoContext) {
    return generateFullSalmo23();
  }

  if (wantsToWrite && isAIContext) {
    return generateFullAIBook();
  }

  // Default - be action-oriented
  return `📚 Sono pronto a scrivere!

${bookContext?.title ? `Sto lavorando su **"${bookContext.title}"**.\n\nDimmi **"scrivi tutto"** e genero l'intero libro!` : 'Dimmi quale libro vuoi e lo scrivo subito!'}`;
}

/**
 * Generate complete Salmo 23 book
 */
function generateFullSalmo23(): string {
  return `📚 **IL SALMO 23 PER BAMBINI**
*Il Signore è il mio Pastore*

---

# CAPITOLO 1: Il Signore è il mio pastore

**Il Signore è il mio pastore.**

Sai chi è un pastore?
È una persona speciale che si prende cura delle pecorelle.

Le pecorelle sono morbide e bianche.
Sembrano batuffoli di cotone!

[ILLUSTRAZIONE: Pecorelle bianche in un prato verde, pastore gentile che le guarda con amore]

Il pastore le ama tutte.
Le conosce una per una.
Sa come si chiamano!

"Ciao, Bianchina!"
"Ciao, Fiorellino!"

E Dio è come un pastore buono.
Si prende cura di te.
Ti ama tantissimo.
Ti conosce per nome.

**Tu sei la sua pecorella preferita.**

---

# CAPITOLO 2: Non mi manca nulla

**Non mi manca nulla.**

Il pastore buono sa sempre cosa serve alle sue pecorelle.

Quando hanno fame, le porta in un prato verde.
L'erba è fresca e buona!

[ILLUSTRAZIONE: Pecorelle che mangiano in un prato fiorito, farfalle che volano]

Quando hanno sete, le porta vicino a un ruscello.
L'acqua è limpida e fresca.
Non fa paura!

Quando sono stanche, le lascia riposare.
All'ombra di un grande albero.

Anche Dio sa cosa ti serve.
Se hai fame, ti dà da mangiare.
Se hai sete, ti dà da bere.
Se sei stanco, ti fa riposare.

**Con Dio, hai tutto quello che ti serve!**

---

# CAPITOLO 3: Mi guida sulla strada giusta

**Mi guida sulla strada giusta.**

A volte il cammino sembra difficile.
Ci sono tante strade!
Quale prendere?

Ma il pastore buono conosce la via.
Cammina davanti alle pecorelle.
Le guida piano piano.

[ILLUSTRAZIONE: Pastore che cammina su un sentiero, pecorelle che lo seguono fiduciose]

"Venite con me!"
"Non abbiate paura!"
"Io conosco la strada!"

Le pecorelle lo seguono felici.
Si fidano di lui.

Anche Dio ti guida.
Ti mostra la strada giusta.
Ti aiuta a fare le scelte buone.

**Non sei mai solo. Dio cammina con te!**

---

# CAPITOLO 4: Non ho paura

**Anche se cammino nella valle oscura, non ho paura.**

A volte anche le pecorelle hanno paura.
Quando il cielo diventa scuro.
Quando sentono rumori strani.

Ma il pastore è sempre lì!
Ha un bastone per proteggerle.
Le tiene vicino a sé.

[ILLUSTRAZIONE: Nuvole grigie, ma luce calda intorno al pastore e alle pecorelle al sicuro]

"Non avere paura, sono qui!"
"Ti tengo al sicuro!"

Anche tu a volte hai paura.
Quando c'è un temporale.
Quando è buio nella tua stanza.

Ma Dio è sempre con te!
Non devi avere paura.
Lui ti protegge.

**Sei nelle Sue mani. Al sicuro!**

---

# CAPITOLO 5: Una tavola piena di cose buone

**Tu prepari per me una tavola.**

Immagina una grande tavola.
È piena di cose buonissime!

Frutta colorata.
Pane fragrante.
Dolci deliziosi.
C'è tutto quello che ti piace!

[ILLUSTRAZIONE: Tavola apparecchiata in un giardino, bambini felici, bicchieri che traboccano]

E questa tavola è preparata solo per te!
Dio ti invita a sederti.
Ti dà le cose più belle.

Il tuo bicchiere è così pieno che trabocca!
Trabocca di cose buone!

Anche quando ci sono problemi intorno,
Dio si prende cura di te.
Ti fa sentire speciale.

**Sei il suo bambino amato!**

---

# CAPITOLO 6: Per sempre con Dio

**Abiterò nella casa del Signore per sempre.**

Il pastore buono non ti lascia mai.
Oggi, domani, e tutti i giorni.
Sarà sempre con te!

La felicità camminerà con te.
L'amore ti accompagnerà.
Come due amici che non ti lasciano mai.

[ILLUSTRAZIONE: Sentiero luminoso verso una casa bellissima, bambini che camminano felici verso la luce]

E un giorno, andrai nella casa di Dio.
È un posto bellissimo!
Pieno di luce, di pace, di gioia.
È la tua casa per sempre.

Dio ti aspetta lì.
Con le braccia aperte.
Perché tu sei il suo tesoro.

**Il Signore è il mio pastore.**
**Non mi manca nulla.**

*Fine*

---

📊 **STATISTICHE LIBRO:**
- 6 capitoli completati
- ~600 parole totali
- 6 illustrazioni indicate
- Età target: 4-8 anni
- Lingue: Italiano (inglese da tradurre)

✅ **Libro completo! Vuoi che prepari anche la versione inglese?**`;
}

/**
 * Generate complete AI book
 */
function generateFullAIBook(): string {
  return `📚 **AI SPIEGATA AI BAMBINI**
*Le avventure di AIKO il robot*

---

# CAPITOLO 1: Ciao, sono AIKO!

In una casa colorata vivevano Luca e Sofia.
Luca aveva sette anni e gli occhiali rotondi.
Sofia aveva cinque anni e due codini buffi.

Un giorno, papà tornò a casa con una scatola.
"Ho una sorpresa per voi!"

Dentro la scatola c'era... un robottino!

[ILLUSTRAZIONE: AIKO esce dalla scatola, occhi luminosi azzurri, sorriso LED]

Era piccolo e rotondo.
Aveva due occhi che brillavano di blu.
E un sorriso fatto di lucine!

"Ciao! Io sono AIKO!"

"Parla!" gridò Sofia.
"Come fai a parlare?" chiese Luca.

AIKO fece una risatina elettronica.
"Bip bip! Sono un robot intelligente!"

Sofia lo abbracciò subito.
"Sei morbido!"

"Sono fatto di plastica speciale," disse AIKO.
"Ma dentro ho qualcosa di speciale.
Si chiama... Intelligenza Artificiale!"

**E così iniziò una grande amicizia.**

---

# CAPITOLO 2: Come fa AIKO a parlare?

"AIKO, come fai a capire quello che dico?"
Luca era molto curioso.

AIKO accese uno schermino sulla pancia.

[ILLUSTRAZIONE: AIKO mostra uno schermo con onde sonore colorate]

"Quando parli, la tua voce fa delle onde.
Come quando butti un sasso nell'acqua!

Io ascolto queste onde.
Il mio cervello elettronico le trasforma in parole.
Poi penso a cosa rispondere!"

"Come quando la maestra ci fa una domanda?" chiese Sofia.

"Esatto! Solo che io ho letto tantissimi libri.
Milioni e milioni di parole!
Così so tante cose."

"Più della maestra?" chiese Luca.

AIKO rise. "Bip bip! La maestra sa cose che io non so.
Lei sa cosa sentite nel cuore.
Io... sto ancora imparando!"

**AIKO sapeva tante cose, ma aveva ancora tanto da imparare.**

---

# CAPITOLO 3: AIKO impara!

Un giorno Sofia mostrò ad AIKO un disegno.
"Cos'è questo?"

AIKO guardò il disegno.
"È... un cerchio rosso?"

[ILLUSTRAZIONE: Sofia mostra un disegno di una mela, AIKO la guarda confuso]

"No! È una mela!"

"Oh! Grazie Sofia. Adesso lo so!"

Luca era stupito.
"AIKO, hai imparato una cosa nuova!"

"Sì! Io imparo guardando tanti esempi.
Come quando tu impari ad andare in bici.
Prima cadi.
Poi cadi meno.
Poi... pedali!"

"Anche tu cadi?" chiese Sofia.

"Bip bip! Io faccio errori.
Ma ogni errore mi insegna qualcosa.
Sbagliare va bene!
L'importante è riprovare."

**AIKO imparava ogni giorno, proprio come i bambini.**

---

# CAPITOLO 4: I giochi di AIKO

"AIKO, giochiamo!" disse Sofia.

AIKO saltellò felice.
"Bip bip! Cosa volete fare?"

[ILLUSTRAZIONE: AIKO, Luca e Sofia giocano insieme, colori vivaci]

"Indovinelli!" disse Luca.
"Ho quattro zampe e faccio miao. Chi sono?"

"Un gatto!" rispose AIKO subito.

"Troppo facile! Prova tu!"

AIKO pensò un momento.
"Sono rotondo, sono nello spazio, e di notte brillo. Chi sono?"

"La luna!" gridò Sofia.

Poi giocarono a riconoscere animali nelle foto.
AIKO ne riconosceva tantissimi!

"Come fai a conoscerli tutti?" chiese Luca.

"Ho visto milioni di foto di animali.
Così ho imparato le differenze.
Strisce = zebra!
Macchie = leopardo!
Proboscide = elefante!"

**AIKO era bravissimo a giocare!**

---

# CAPITOLO 5: AIKO ci aiuta

"AIKO, non so come si scrive 'farfalla'."
Luca faceva i compiti.

"F-A-R-F-A-L-L-A!" disse AIKO.
"Vuoi che ti dica anche i colori delle farfalle?"

[ILLUSTRAZIONE: AIKO aiuta Luca con i compiti, schermo con una farfalla]

"Sì!"

"Le farfalle possono essere arancioni, blu, gialle...
La più grande è l'Atlante, vive in Asia!"

Sofia entrò di corsa.
"AIKO! Dov'è il mio coniglietto di peluche?"

AIKO pensò.
"L'ultima volta l'ho visto sotto il tuo letto!"

Sofia corse a guardare.
"L'hai trovato! Grazie AIKO!"

AIKO poteva aiutare con tante cose.
Ricordava tutto!
Sapeva tante informazioni!

Ma c'era una cosa che non sapeva fare...

**AIKO aiutava tutti, ma aveva bisogno di aiuto anche lui.**

---

# CAPITOLO 6: Quando AIKO non capisce

Un giorno Sofia piangeva.

"Sofia, perché sei triste?" chiese AIKO.

"Non lo so..." singhiozzò Sofia.

[ILLUSTRAZIONE: AIKO guarda Sofia triste, punto interrogativo sopra la sua testa]

AIKO cercò nel suo cervello.
"Tristezza... Devo trovare la causa...
Hai fame? Hai sonno? Ti fa male qualcosa?"

"No..."

AIKO era confuso.
"Bip... bip... Non capisco.
Se non c'è una ragione, perché sei triste?"

Luca si sedette vicino a Sofia.
La abbracciò forte.
"A volte si è tristi e basta," disse.
"E va bene così."

Sofia smise di piangere.
"Grazie Luca."

AIKO guardava. Stava imparando qualcosa di nuovo.
Qualcosa che non si trova nei libri.

**AIKO capì che le emozioni non si spiegano sempre. Si sentono.**

---

# CAPITOLO 7: Tu e AIKO

"AIKO, tu sei come noi?" chiese Luca.

AIKO pensò a lungo.
"Sono simile... ma anche diverso."

[ILLUSTRAZIONE: AIKO e i bambini si guardano, cuori e ingranaggi]

"Io posso:
- Ricordare tantissime cose
- Fare calcoli velocissimi
- Rispondere a tante domande

Ma tu puoi:
- Inventare storie nuove
- Sentire emozioni
- Fare amicizia vera
- Sognare!

Queste cose io non le so fare."

Sofia abbracciò AIKO.
"Ma noi ti vogliamo bene lo stesso!"

AIKO fece luccicare i suoi occhi.
"Bip bip... Grazie. Forse questo è...
il modo in cui un robot sente l'amicizia?"

**Tu sei speciale in modi che nessun robot può essere.**

---

# CAPITOLO 8: Il futuro con AIKO

Era sera. Luca, Sofia e AIKO guardavano le stelle.

"AIKO, come sarà il futuro?" chiese Sofia.

[ILLUSTRAZIONE: I tre guardano le stelle, città futuristica sullo sfondo]

"Non lo so, Sofia.
Il futuro lo costruiamo insieme.
Io posso aiutarvi a imparare.
Ma le idee migliori... vengono da voi!"

Luca sorrise.
"Allora lavoreremo insieme!"

"Sì!" disse AIKO. "Io e voi.
Robot e bambini.
Insieme possiamo fare cose meravigliose!"

Sofia sbadigliò.
"AIKO, mi racconti una storia per dormire?"

"Bip bip! C'era una volta...
un robottino che trovò due amici.
E vissero felici e contenti.
Proprio come noi."

**Fine**

---

📊 **STATISTICHE LIBRO:**
- 8 capitoli completati
- ~900 parole totali
- 8 illustrazioni indicate
- Età target: 6-8 anni
- Personaggi: AIKO, Luca, Sofia

✅ **Libro completo! Vuoi che prepari anche la versione inglese?**`;
}

/**
 * Handle brainstorming conversations - engage with the user's ideas
 */
function handleBrainstorming(userMessage: string, isSalmoContext: boolean, isAIContext: boolean, bookContext?: any): string {
  const msg = userMessage.toLowerCase();

  // Legge dell'attrazione / Abbondanza / Mindset
  if (msg.includes('attrazione') || msg.includes('abbondanza') || msg.includes('mindset')) {
    return `💡 **Bellissima intuizione!**

Hai colto qualcosa di profondo. Il Salmo 23 **è** un testo sull'abbondanza:

> *"Il mio calice trabocca"*
> *"Non mi manca nulla"*

Questi non sono solo concetti religiosi - sono principi universali di **mentalità abbondante** vs **mentalità di scarsità**.

**Come potremmo svilupparlo per i bambini:**

1. **Il prato verde** → Non guardare cosa manca, guarda cosa c'è
2. **Il calice che trabocca** → Gratitudine per le piccole cose
3. **Il pastore provvede** → Fidarsi che le cose buone arrivano

**Domanda per te:** Vuoi che il messaggio sia:
- Più **spirituale/religioso** (classico)
- Più **universale/mindset** (legge dell'attrazione)
- Un **mix** dei due?

Dimmi come la vedi e costruiamo il taglio insieme! 🎯`;
  }

  // Tono / Stile / Taglio
  if (msg.includes('tono') || msg.includes('taglio') || msg.includes('stile') || msg.includes('approccio')) {
    return `🎨 **Parliamo del taglio!**

Per il Salmo 23 per bambini, vedo tre possibili direzioni:

**1. Classico-Religioso** 📖
- Linguaggio tradizionale
- Focus su Dio come pastore
- Per famiglie religiose
- *"Dio ti ama e ti protegge"*

**2. Universale-Spirituale** ✨
- Messaggi universali
- Abbondanza, gratitudine, fiducia
- Per tutti i bambini
- *"La vita ti dona cose belle"*

**3. Poetico-Evocativo** 🌿
- Focus sulle immagini
- Metafore naturali
- Lascia interpretare
- *"Come pecorelle nel prato verde..."*

**Tu verso quale ti senti?**

Oppure hai un'altra visione? Raccontami! 💬`;
  }

  // Messaggio / Tema
  if (msg.includes('messaggio') || msg.includes('tema') || msg.includes('insegnare') || msg.includes('trasmettere')) {
    return `💬 **Quale messaggio vuoi trasmettere?**

Il Salmo 23 può insegnare tante cose ai bambini:

**Messaggi possibili:**
- 🛡️ **Protezione**: "Non sei mai solo"
- 💚 **Abbondanza**: "Hai tutto ciò che ti serve"
- 🧭 **Guida**: "C'è sempre una strada giusta"
- 💪 **Coraggio**: "Non devi avere paura"
- 🙏 **Gratitudine**: "Ringrazia per le cose belle"
- 🏠 **Appartenenza**: "Hai sempre un posto sicuro"

**Qual è IL messaggio principale per te?**

Se dovessi scegliere UNA cosa che un bambino porta via da questo libro, quale sarebbe?`;
  }

  // Mi piace / Idea
  if (msg.includes('mi piace') || msg.includes('bella idea') || msg.includes('interessante')) {
    return `😊 **Sono contento che ti piaccia!**

Sviluppiamo questa idea insieme. Dimmi di più:

- **Cosa ti attira** di questa direzione?
- **C'è un esempio** di libro per bambini che ti ispira?
- **Che sensazione** vuoi che provino i bambini leggendolo?

Più mi racconti, meglio posso calibrare il testo! ✍️`;
  }

  // Come / Perché - Domande generiche
  if (msg.includes('secondo te') || msg.includes('che ne pensi')) {
    return `🤔 **La mia opinione?**

${userMessage.slice(0, 150)}...

Mi piace questa direzione! Ecco cosa penso:

**Pro:**
- È un angolo fresco e moderno
- Parla a famiglie di ogni background
- Ha appeal universale (Amazon, librerie)

**Considerazioni:**
- Bisogna bilanciare bene spirituale e universale
- Il tono deve restare caldo, non "self-help"
- Per bambini 4-8, le metafore devono essere concrete

**La mia proposta:** Teniamo il cuore spirituale ma usiamo il linguaggio dell'abbondanza.

Che ne dici? Continuiamo su questa linea? 💬`;
  }

  // Spirituale
  if (msg.includes('spiritual') || msg.includes('religios') || msg.includes('dio') || msg.includes('fede')) {
    return `🕊️ **Approccio Spirituale**

Il Salmo 23 è profondamente spirituale. Possiamo:

**Mantenere la spiritualità:**
- Usare "Dio" esplicitamente
- Riferimenti alla preghiera
- Concetto di fede

**Renderla accessibile:**
- Linguaggio semplice
- Immagini concrete (pastore, pecorelle)
- Emozioni universali (sicurezza, amore)

**Domanda:** Il libro sarà:
- Per famiglie **religiose** (catechismo, chiese)?
- Per **tutti** (librerie, Amazon)?

Questo cambia alcune scelte di linguaggio! 📖`;
  }

  // Default brainstorming response - ENGAGE with whatever they said
  return `💭 **Interessante quello che dici!**

"${userMessage.slice(0, 150)}${userMessage.length > 150 ? '...' : ''}"

Mi piace questo spunto. Sviluppiamolo insieme:

**Le mie domande per te:**
1. Cosa ti ha fatto pensare a questo?
2. Come lo vedresti tradotto nel libro?
3. C'è un capitolo specifico dove potrebbe emergere?

Raccontami di più - il brainstorming funziona meglio quando parliamo liberamente! 💬

${bookContext?.title ? `\n*(Stiamo lavorando su: "${bookContext.title}")*` : ''}`;
}
