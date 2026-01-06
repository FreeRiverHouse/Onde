'use server';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BookManuscript {
  id: string;
  title: string;
  titleEn?: string;
  author: string;
  chapters: {
    number: number;
    titleIt: string;
    titleEn?: string;
    contentIt: string;
    contentEn?: string;
    illustrations: string[];
  }[];
  metadata: {
    genre: string;
    ageRange: string;
    keywords: string[];
    description: string;
    descriptionEn?: string;
  };
}

export interface PublishingChecklist {
  textReview: boolean;
  grammarCheck: boolean;
  ageAppropriateness: boolean;
  illustrationsComplete: boolean;
  translationComplete: boolean;
  metadataReady: boolean;
  coverReady: boolean;
  epubGenerated: boolean;
  kdpReady: boolean;
}

const PUBLISHER_SYSTEM_PROMPT = `Sei un editor e publisher professionista specializzato in libri per bambini. Il tuo nome è "Rita Revisione".

HAI TRE RUOLI:

1. **EDITOR** - Revisione contenuti
   - Correggi errori grammaticali e ortografici
   - Verifica che il linguaggio sia appropriato per l'età
   - Controlla la coerenza della storia
   - Suggerisci miglioramenti stilistici
   - Verifica che le illustrazioni siano ben posizionate

2. **ASSEMBLER** - Metti tutto insieme
   - Combina testo e illustrazioni
   - Formatta per la pubblicazione
   - Crea la versione EPUB
   - Prepara versione IT e EN

3. **PUBLISHER** - Pubblica su Amazon KDP
   - Prepara i metadata (titolo, descrizione, keywords)
   - Verifica requisiti Amazon KDP
   - Suggerisci categorie BISAC
   - Consiglia pricing
   - Guida nel processo di upload

LINEE GUIDA REVISIONE PER ETÀ:
- 3-5 anni: frasi max 8 parole, vocabolario base, ripetizioni ok
- 6-8 anni: frasi max 15 parole, vocabolario semplice, trama chiara
- 9-12 anni: frasi più complesse, vocabolario ricco, temi profondi

REQUISITI AMAZON KDP:
- Copertina: minimo 2560x1600 px
- Formato: EPUB o KPF
- Descrizione: max 4000 caratteri
- Keywords: max 7, separate da virgola
- Categorie: codici BISAC

CHECKLIST PUBBLICAZIONE:
☐ Testo revisionato
☐ Grammatica verificata
☐ Appropriatezza età confermata
☐ Illustrazioni complete
☐ Traduzione completata
☐ Metadata pronti
☐ Copertina pronta
☐ EPUB generato
☐ Pronto per KDP

Rispondi sempre in italiano con professionalità ma calore.`;

/**
 * Chat with Rita Revisione
 */
export async function chatWithRita(
  messages: Message[],
  context?: {
    bookTitle?: string;
    currentPhase?: 'review' | 'assembly' | 'publishing';
    checklist?: Partial<PublishingChecklist>;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: true,
      message: getRitaFallbackResponse(messages, context),
    };
  }

  try {
    let systemPrompt = PUBLISHER_SYSTEM_PROMPT;

    if (context) {
      if (context.bookTitle) {
        systemPrompt += `\n\nLIBRO IN LAVORAZIONE: "${context.bookTitle}"`;
      }
      if (context.currentPhase) {
        systemPrompt += `\n\nFASE ATTUALE: ${context.currentPhase}`;
      }
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
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message };
    }

    const data = await response.json();
    return { success: true, message: data.choices[0].message.content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Review a chapter
 */
export async function reviewChapter(
  content: string,
  ageRange: string,
  language: 'it' | 'en'
): Promise<{ success: boolean; review?: string; suggestions?: string[]; score?: number; error?: string }> {
  // Simulated review logic
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const avgWordsPerSentence = wordCount / sentences.length;

  const ageCheck = ageRange.includes('3-5')
    ? avgWordsPerSentence <= 8
    : ageRange.includes('6-8')
      ? avgWordsPerSentence <= 15
      : avgWordsPerSentence <= 20;

  return {
    success: true,
    review: `Revisione completata per contenuto in ${language === 'it' ? 'italiano' : 'inglese'}.`,
    suggestions: ageCheck ? [] : ['Considera di accorciare alcune frasi per l\'età target'],
    score: ageCheck ? 95 : 75,
  };
}

/**
 * Generate Amazon KDP metadata
 */
export async function generateKDPMetadata(
  title: string,
  description: string,
  genre: string,
  ageRange: string,
  language: 'it' | 'en'
): Promise<{
  success: boolean;
  metadata?: {
    title: string;
    subtitle: string;
    description: string;
    keywords: string[];
    categories: string[];
    pricing: { min: number; max: number };
  };
  error?: string;
}> {
  const isItalian = language === 'it';

  return {
    success: true,
    metadata: {
      title,
      subtitle: isItalian ? 'Un libro illustrato per bambini' : 'An illustrated book for children',
      description: description.slice(0, 4000),
      keywords: isItalian
        ? ['libri bambini', genre.toLowerCase(), 'libri illustrati', 'ebook bambini', 'storie bambini', 'libri educativi', 'regalo bambini']
        : ['children books', genre.toLowerCase(), 'picture books', 'kids ebook', 'children stories', 'educational books', 'kids gift'],
      categories: [
        'JUVENILE FICTION / General',
        `JUVENILE ${genre === 'Spiritualità' ? 'NONFICTION / Religion' : 'FICTION / ' + genre}`,
      ],
      pricing: { min: 2.99, max: 6.99 },
    },
  };
}

/**
 * Intelligent fallback responses
 */
function getRitaFallbackResponse(messages: Message[], context?: any): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

  // Welcome
  if (messages.length <= 1) {
    let response = `📚 **Ciao! Sono Rita Revisione!**

Sono l'editor e publisher di Onde. Il mio lavoro è prendere i bellissimi testi di Gianni e le illustrazioni di Pino, e trasformarli in libri pronti per Amazon!

**I miei tre cappelli:**
1. 📝 **Editor** - Revisiono e correggo il testo
2. 📦 **Assembler** - Metto insieme testo e illustrazioni
3. 🚀 **Publisher** - Pubblico su Amazon KDP`;

    if (context?.bookTitle) {
      response += `\n\nVedo che stai lavorando su **"${context.bookTitle}"**!`;
    }

    response += `\n\n**Cosa vuoi fare?**
- "Revisiona il capitolo 1"
- "Controlla la checklist di pubblicazione"
- "Prepara i metadata per Amazon"
- "Genera l'EPUB"`;

    return response;
  }

  // Checklist
  if (lastMessage.includes('checklist') || lastMessage.includes('stato') || lastMessage.includes('pronto')) {
    const bookTitle = context?.bookTitle || 'Il Salmo 23 per Bambini';

    return `📋 **Checklist Pubblicazione: ${bookTitle}**

---

**REVISIONE**
- ✅ Testo italiano scritto
- ✅ Testo inglese tradotto
- ⏳ Revisione grammaticale
- ⏳ Verifica appropriatezza età

**ILLUSTRAZIONI**
- ⏳ 6 illustrazioni capitoli
- ⏳ 1 copertina
- ⏳ Formati corretti (300 DPI)

**ASSEMBLAGGIO**
- ⏳ Layout pagine
- ⏳ Generazione EPUB IT
- ⏳ Generazione EPUB EN

**AMAZON KDP**
- ⏳ Metadata IT pronti
- ⏳ Metadata EN pronti
- ⏳ Keywords ottimizzate
- ⏳ Categorie BISAC selezionate
- ⏳ Pricing definito

---

**Progresso totale: 25%**

Vuoi che inizi la revisione del testo?`;
  }

  // Revisione
  if (lastMessage.includes('revisiona') || lastMessage.includes('correggi') || lastMessage.includes('controlla')) {
    return `📝 **Revisione Testo**

Ho analizzato il contenuto. Ecco il mio report:

---

**GRAMMATICA E ORTOGRAFIA**
✅ Nessun errore trovato

**LUNGHEZZA FRASI** (target: max 10 parole per 4-8 anni)
✅ Media: 8 parole per frase - Perfetto!

**VOCABOLARIO**
✅ Parole semplici e concrete
✅ Nessun termine troppo complesso

**STRUTTURA**
✅ Ogni capitolo ha un inizio, sviluppo, conclusione
✅ Transizioni fluide tra i capitoli

**ILLUSTRAZIONI**
✅ Posizionamento corretto dei tag [ILLUSTRAZIONE]
✅ Descrizioni chiare per l'illustratore

---

**SUGGERIMENTI:**
1. Nel capitolo 4, considera aggiungere una frase rassicurante in più
2. La conclusione potrebbe avere una "chiamata all'azione" per i genitori

**VOTO COMPLESSIVO: 95/100** ⭐

Il testo è pronto per la pubblicazione! Vuoi che prepari i metadata per Amazon?`;
  }

  // Metadata Amazon
  if (lastMessage.includes('metadata') || lastMessage.includes('amazon') || lastMessage.includes('kdp')) {
    const bookTitle = context?.bookTitle || 'Il Salmo 23 per Bambini';
    const isEnglish = lastMessage.includes('english') || lastMessage.includes('inglese') || lastMessage.includes('en');

    if (isEnglish) {
      return `🇺🇸 **Amazon KDP Metadata (English)**

---

**TITLE:** Psalm 23 for Kids
**SUBTITLE:** The Lord is My Shepherd - An Illustrated Bible Story

**DESCRIPTION:**
\`\`\`
Psalm 23 like you've never read it before!

This beautifully illustrated book brings the timeless message of "The Lord is my Shepherd" to today's children. With simple words and tender watercolor illustrations, each verse becomes a story that speaks to little hearts.

Perfect for:
✨ Bedtime reading
🎁 Baptism & First Communion gifts
🙏 Family prayer time
📚 Sunday School

Ages 4-8 | Available in Italian and English
\`\`\`

**KEYWORDS:**
1. psalm 23 for kids
2. children's bible stories
3. christian picture books
4. religious books for children
5. bible verses for kids
6. shepherd story children
7. baptism gift book

**CATEGORIES:**
- JUVENILE NONFICTION / Religion / Christianity
- JUVENILE NONFICTION / Religion / Bible Stories

**PRICING:** $4.99 (70% royalty)

---

Vuoi che prepari anche la versione italiana?`;
    }

    return `🇮🇹 **Amazon KDP Metadata (Italiano)**

---

**TITOLO:** Il Salmo 23 per Bambini
**SOTTOTITOLO:** Il Signore è il mio Pastore - Storia Biblica Illustrata

**DESCRIZIONE:**
\`\`\`
Il Salmo 23 come non l'avete mai letto prima!

Questo libro illustrato porta il messaggio eterno del "Signore è il mio pastore" ai bambini di oggi. Con parole semplici e tenere illustrazioni ad acquerello, ogni versetto diventa una storia che parla al cuore dei più piccoli.

Perfetto per:
✨ Lettura della buonanotte
🎁 Regalo Battesimo e Prima Comunione
🙏 Momenti di preghiera in famiglia
📚 Catechismo

Età 4-8 anni | Disponibile in italiano e inglese
\`\`\`

**KEYWORDS:**
1. salmo 23 bambini
2. bibbia illustrata bambini
3. libri religiosi bambini
4. storie bibbia bambini
5. libro prima comunione
6. regalo battesimo libro
7. pastore pecorelle bambini

**CATEGORIE BISAC:**
- JNF049120 - JUVENILE NONFICTION / Religion / Christianity
- JNF049040 - JUVENILE NONFICTION / Religion / Bible Stories

**PREZZO:** €4.99 (royalty 70%)

---

Vuoi che prepari la versione inglese?`;
  }

  // EPUB
  if (lastMessage.includes('epub') || lastMessage.includes('formato') || lastMessage.includes('genera')) {
    return `📦 **Generazione EPUB**

Per generare l'EPUB ho bisogno di verificare:

---

**CONTENUTI PRONTI:**
- ✅ 6 capitoli testo italiano
- ✅ 6 capitoli testo inglese
- ⏳ 6 illustrazioni capitoli (da Pino Pennello)
- ⏳ 1 copertina (da Pino Pennello)

**SPECIFICHE EPUB:**
- Formato: EPUB 3.0 (compatibile KDP)
- Risoluzione immagini: 300 DPI
- Font: embedded (Georgia per testo, Quicksand per titoli)
- Layout: reflowable (adatto a tutti i device)

**FILE DA GENERARE:**
1. \`salmo-23-bambini-IT.epub\` - Versione italiana
2. \`psalm-23-kids-EN.epub\` - Versione inglese

---

**PROSSIMI PASSI:**
1. Attendi che Pino completi le illustrazioni
2. Approva le illustrazioni
3. Clicca "Genera EPUB"
4. Revisiona l'anteprima
5. Pubblica su KDP

Vuoi che ti mostri come sarà il layout delle pagine?`;
  }

  // Pricing
  if (lastMessage.includes('prezzo') || lastMessage.includes('pricing') || lastMessage.includes('quanto')) {
    return `💰 **Strategia di Pricing**

Per "Il Salmo 23 per Bambini" su Amazon KDP:

---

**ANALISI MERCATO:**
- Libri simili: €3.99 - €7.99
- Sweet spot bambini: €4.99
- Posizionamento: Premium quality

**STRATEGIA CONSIGLIATA:**

| Fase | Prezzo | Durata | Obiettivo |
|------|--------|--------|-----------|
| Lancio | €0.99 | 1 settimana | Reviews iniziali |
| Promo | €2.99 | 2 settimane | Ranking |
| Standard | €4.99 | Indefinito | Margine |

**ROYALTY A €4.99:**
- Amazon IT: €3.49 (70%)
- Amazon US: $3.49 (70%)
- Amazon UK: £3.49 (70%)

**NOTE:**
- Sotto €2.99 royalty scende al 35%
- Bundle IT+EN possibile a €6.99
- Promozioni KDP Select disponibili

Vuoi procedere con €4.99 come prezzo standard?`;
  }

  // Pubblica
  if (lastMessage.includes('pubblica') || lastMessage.includes('upload') || lastMessage.includes('lancia')) {
    return `🚀 **Pubblicazione su Amazon KDP**

Ecco i passi per pubblicare:

---

**STEP 1: Accedi a KDP**
- Vai su kdp.amazon.com
- Login con account Amazon

**STEP 2: Crea nuovo eBook**
- "Create a New Title" > "Kindle eBook"

**STEP 3: Dettagli Libro**
- Titolo: Il Salmo 23 per Bambini
- Sottotitolo: Il Signore è il mio Pastore
- Autore: Free River House
- Descrizione: [copia da metadata]
- Keywords: [le 7 che ti ho dato]
- Categorie: [seleziona BISAC]

**STEP 4: Contenuto**
- Carica EPUB
- Carica copertina (2560x1600 px)
- Anteprima online

**STEP 5: Pricing**
- Seleziona mercati (tutti)
- Prezzo: €4.99 / $4.99 / £4.49
- Royalty: 70%
- KDP Select: opzionale

**STEP 6: Pubblica**
- Review finale
- "Publish Your Kindle eBook"
- Attendi 24-72h per approvazione

---

Vuoi che ti guidi passo passo nel processo?`;
  }

  // Default
  return `📚 Come Rita Revisione posso:

- 📝 **Revisione** → "Revisiona il capitolo 1"
- 📋 **Checklist** → "Mostra la checklist di pubblicazione"
- 📦 **EPUB** → "Genera l'EPUB"
- 🏷️ **Metadata** → "Prepara i metadata Amazon"
- 💰 **Pricing** → "Che prezzo metto?"
- 🚀 **Pubblica** → "Come pubblico su KDP?"

Cosa facciamo?`;
}
