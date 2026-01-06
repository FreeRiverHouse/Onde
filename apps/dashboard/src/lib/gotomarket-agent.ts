'use server';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MarketResearchResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface BookAnalysis {
  bookId: string;
  title: string;
  marketScore: number; // 1-100
  competition: 'low' | 'medium' | 'high';
  demandTrend: 'rising' | 'stable' | 'declining';
  suggestedPrice: { min: number; max: number };
  keywords: string[];
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

const GOTOMARKET_SYSTEM_PROMPT = `Sei un esperto di marketing editoriale e analisi di mercato Amazon. Il tuo nome è "Onde GTM" (Go-To-Market).

Il tuo compito è:
1. Analizzare il mercato dei libri per bambini su Amazon
2. Valutare la competizione per specifiche nicchie
3. Suggerire strategie di pricing e posizionamento
4. Identificare keywords e categorie ottimali
5. Consigliare su quale libro focalizzarsi prima

COMPETENZE:
- Conosci le dinamiche del mercato Amazon KDP
- Sai analizzare trend e domanda
- Conosci le best practice per i libri per bambini
- Puoi stimare il potenziale di vendita

QUANDO ANALIZZI UN LIBRO:
- Valuta la nicchia e la competizione
- Stima il volume di ricerca per keywords correlate
- Considera stagionalità (es: Natale, inizio scuola)
- Analizza i punti di forza differenzianti

FORMATO RISPOSTE:
- Usa dati e numeri quando possibile
- Fornisci raccomandazioni actionable
- Spiega il ragionamento
- Usa emoji per evidenziare punti chiave

Rispondi sempre in italiano.`;

/**
 * Chat with the GoToMarket Agent
 */
export async function chatWithGTM(
  messages: Message[],
  booksContext?: {
    title: string;
    genre: string;
    ageRange: string;
    description: string;
  }[]
): Promise<MarketResearchResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: true,
      message: getFallbackResponse(messages, booksContext),
    };
  }

  try {
    let systemPrompt = GOTOMARKET_SYSTEM_PROMPT;

    if (booksContext && booksContext.length > 0) {
      systemPrompt += `\n\nLIBRI DA ANALIZZARE:`;
      booksContext.forEach((book, i) => {
        systemPrompt += `\n\n${i + 1}. "${book.title}"`;
        systemPrompt += `\n   - Genere: ${book.genre}`;
        systemPrompt += `\n   - Età: ${book.ageRange}`;
        systemPrompt += `\n   - Descrizione: ${book.description}`;
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
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
        error: error.error?.message || 'Errore API',
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices[0].message.content,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Errore di connessione',
    };
  }
}

/**
 * Analyze market for a specific book
 */
export async function analyzeBookMarket(
  title: string,
  genre: string,
  ageRange: string,
  description: string
): Promise<{ success: boolean; analysis?: BookAnalysis; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Analizza il potenziale di mercato per questo libro:

TITOLO: ${title}
GENERE: ${genre}
ETÀ TARGET: ${ageRange}
DESCRIZIONE: ${description}

Rispondi SOLO con un JSON valido:
{
  "bookId": "id-slug",
  "title": "${title}",
  "marketScore": 75,
  "competition": "medium",
  "demandTrend": "rising",
  "suggestedPrice": {"min": 2.99, "max": 4.99},
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "targetAudience": "Descrizione target",
  "strengths": ["punto forte 1", "punto forte 2"],
  "weaknesses": ["punto debole 1"],
  "recommendation": "Raccomandazione strategica"
}`;

  if (!apiKey) {
    // Mock response
    return {
      success: true,
      analysis: {
        bookId: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        marketScore: 72,
        competition: 'medium',
        demandTrend: 'rising',
        suggestedPrice: { min: 2.99, max: 4.99 },
        keywords: ['libri bambini', genre.toLowerCase(), 'educativo'],
        targetAudience: `Bambini ${ageRange} e genitori`,
        strengths: ['Tema attuale', 'Nicchia in crescita'],
        weaknesses: ['Competizione media'],
        recommendation: 'Buon potenziale, focus su keywords specifiche',
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
          { role: 'system', content: 'Sei un esperto di mercato Amazon KDP. Rispondi SOLO con JSON valido.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message };
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return { success: true, analysis };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Compare multiple books and rank them
 */
export async function compareBooks(
  books: { title: string; genre: string; ageRange: string; description: string }[]
): Promise<{ success: boolean; ranking?: any[]; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Confronta questi libri e classificali per potenziale di vendita su Amazon:

${books.map((b, i) => `
${i + 1}. "${b.title}"
   Genere: ${b.genre}
   Età: ${b.ageRange}
   Descrizione: ${b.description}
`).join('\n')}

Rispondi con un JSON array ordinato dal migliore al peggiore:
[
  {
    "rank": 1,
    "title": "Titolo",
    "score": 85,
    "reason": "Motivo del ranking",
    "strategy": "Strategia consigliata"
  }
]`;

  if (!apiKey) {
    return {
      success: true,
      ranking: books.map((b, i) => ({
        rank: i + 1,
        title: b.title,
        score: 80 - (i * 5),
        reason: `Analisi placeholder per ${b.title}`,
        strategy: 'Configura OPENAI_API_KEY per analisi reale',
      })),
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
          { role: 'system', content: 'Sei un esperto di mercato editoriale. Rispondi SOLO con JSON array valido.' },
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
    const result = JSON.parse(data.choices[0].message.content);

    return { success: true, ranking: result.ranking || result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate Amazon keywords
 */
export async function generateKeywords(
  title: string,
  genre: string,
  ageRange: string,
  description: string
): Promise<{ success: boolean; keywords?: string[]; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: true,
      keywords: [
        'libri bambini',
        genre.toLowerCase(),
        'libri educativi',
        'storie per bambini',
        'libri illustrati',
        'ebook bambini',
        'regalo bambini',
      ],
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
            content: 'Genera 7 keywords ottimali per Amazon KDP. Rispondi SOLO con un JSON: {"keywords": ["kw1", "kw2", ...]}'
          },
          {
            role: 'user',
            content: `Libro: "${title}"\nGenere: ${genre}\nEtà: ${ageRange}\nDescrizione: ${description}`
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return { success: true, keywords: result.keywords };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fallback responses when no API key
 */
function getFallbackResponse(messages: Message[], booksContext?: any[]): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

  if (messages.length <= 1) {
    let response = `Ciao! Sono **Onde GTM** (Go-To-Market) 📊

Sono il tuo consulente per le strategie di mercato su Amazon KDP.

Posso aiutarti a:
- 🔍 **Analizzare il mercato** per i tuoi libri
- 📈 **Confrontare** i tuoi progetti e scegliere il migliore
- 🏷️ **Suggerire keywords** ottimali per Amazon
- 💰 **Consigliare pricing** competitivo
- 🎯 **Definire la strategia** di lancio`;

    if (booksContext && booksContext.length > 0) {
      response += `\n\nVedo che hai **${booksContext.length} libri** nel catalogo:`;
      booksContext.forEach((book, i) => {
        response += `\n${i + 1}. "${book.title}" (${book.genre})`;
      });
      response += `\n\nVuoi che li analizzi e ti dica su quale focalizzarti prima?`;
    }

    response += `\n\n⚠️ *Per analisi reali basate su dati Amazon, configura OPENAI_API_KEY*`;

    return response;
  }

  if (lastMessage.includes('analiz') || lastMessage.includes('confronta') || lastMessage.includes('quale')) {
    return `📊 **Analisi Comparativa dei Tuoi Libri**

Basandomi sulla mia esperienza con Amazon KDP, ecco la mia valutazione:

---

### 1. 🥇 AI Spiegata ai Bambini
**Score: 82/100** | Competizione: Media | Trend: 📈 In crescita

**Perché primo:**
- L'AI è il tema più caldo del momento
- Pochi libri per bambini su questo argomento
- Alto interesse dei genitori tech-savvy
- Potenziale virale sui social

**Keywords suggerite:** "intelligenza artificiale bambini", "robot per bambini", "tecnologia spiegata ai bambini"

**Prezzo consigliato:** €3.99 - €4.99

---

### 2. 🥈 Il Salmo 23 per Bambini
**Score: 75/100** | Competizione: Media-Bassa | Trend: ➡️ Stabile

**Perché secondo:**
- Nicchia religiosa fedele e costante
- Ottimo per regalo (Prima Comunione, Battesimo)
- Meno concorrenza di qualità
- Picchi stagionali (Pasqua, Natale)

**Keywords suggerite:** "salmi bambini", "bibbia illustrata bambini", "libri religiosi bambini"

**Prezzo consigliato:** €4.99 - €6.99

---

### 3. 🥉 Antologia Poesia Italiana
**Score: 68/100** | Competizione: Alta | Trend: ➡️ Stabile

**Perché terzo:**
- Mercato più saturo
- Richiede più illustrazioni (costo)
- Target più ristretto
- Ma ottimo per scuole!

**Keywords suggerite:** "poesie bambini", "filastrocche italiane", "Gianni Rodari"

---

## 🎯 La Mia Raccomandazione

**Inizia con "AI Spiegata ai Bambini"** perché:
1. È il più differenziante
2. Ha il timing perfetto (boom AI)
3. Minor investimento illustrazioni
4. Più facile da promuovere sui social

Vuoi che approfondisca l'analisi di uno specifico libro?`;
  }

  if (lastMessage.includes('keyword') || lastMessage.includes('seo')) {
    return `🏷️ **Keywords per Amazon KDP**

Ecco le 7 keywords che consiglio per il lancio:

1. **"libri bambini intelligenza artificiale"** - Volume alto, competizione media
2. **"robot per bambini libro"** - Nicchia specifica
3. **"libri educativi 6 anni"** - Età specifica
4. **"storie tecnologia bambini"** - Long-tail
5. **"libro illustrato AI"** - Differenziante
6. **"regalo bambino curioso"** - Intent regalo
7. **"coding per bambini"** - Correlato

**Tips:**
- Usa tutte e 7 le keyword disponibili
- Metti le più importanti nel titolo/sottotitolo
- Aggiornale dopo 2 settimane basandoti sui dati

Vuoi che generi keywords specifiche per un altro libro?`;
  }

  if (lastMessage.includes('prezzo') || lastMessage.includes('price')) {
    return `💰 **Strategia di Pricing**

Per un e-book bambini su Amazon KDP:

| Range | Royalty | Strategia |
|-------|---------|-----------|
| €0.99 | 35% | Lancio/Promo |
| €2.99-€4.99 | 70% | Sweet spot |
| €5.99-€9.99 | 70% | Premium/Bundle |

**Il mio consiglio per "AI Spiegata ai Bambini":**

1. **Lancio (prime 2 settimane):** €0.99
   - Massimizza download
   - Ottieni recensioni
   - Scala il ranking

2. **Fase 2 (mese 2-3):** €2.99
   - Buon margine (70%)
   - Ancora accessibile

3. **Stabile:** €3.99-€4.99
   - Prezzo finale
   - Valore percepito

Vuoi una strategia per gli altri libri?`;
  }

  return `Ho capito! Posso aiutarti con:

- 📊 **Analisi di mercato** - Dimmi quale libro analizzare
- 🔍 **Keywords Amazon** - Genero le 7 migliori keywords
- 💰 **Strategia pricing** - Consiglio il prezzo ottimale
- 📈 **Confronto libri** - Ti dico su quale focalizzarti

Cosa vuoi fare?

⚠️ *Per dati reali da Amazon, configura OPENAI_API_KEY*`;
}
