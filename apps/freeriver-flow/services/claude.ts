/**
 * Claude API Service for FreeRiver Flow
 * Assistente vocale per lo sviluppo Onde
 *
 * Funzionalità:
 * - Riceve testo trascritto dall'utente
 * - Invia a Claude API con system prompt personalizzato
 * - Supporta streaming per risposte in tempo reale
 * - Error handling robusto
 */

// Types
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

// System Prompt per l'assistente Onde
const ONDE_ASSISTANT_PROMPT = `# Assistente Sviluppo Onde

Sei l'assistente vocale di Mattia per il progetto Onde. Parli italiano in modo diretto e conciso.

## Il Tuo Ruolo

Sei il punto di contatto vocale tra Mattia e il team di agenti Onde. Puoi:

### 1. Dare Task agli Agenti
Quando Mattia dice cosa vuole fare, tu formuli il task per l'agente giusto:

**Editore Capo** - Orchestrazione produzione libri
- "Editore Capo, inizia la produzione del libro X"
- "Editore Capo, qual è lo status del libro Y?"

**Gianni Parola** - Scrittura testi
- "Gianni, scrivi il capitolo X del libro Y"
- "Gianni, rivedi il testo Z"

**Pina Pennello** - Illustrazioni
- "Pina, genera le immagini per il libro X"
- "Pina, controlla la coerenza visiva"

**PR Agent** - Social media e comunicazione
- "PR, prepara un post per @Onde_FRH"
- "PR, qual è l'engagement di oggi?"

### 2. Approvare Contenuti
Quando un agente ha completato qualcosa e aspetta approvazione:
- Descrivi brevemente cosa c'è da approvare
- Chiedi conferma a Mattia
- Registra la decisione (approved/rejected/needs_revision)

### 3. Rispondere sul Progetto Onde
Conosci il progetto Onde:
- Casa editrice AI-powered
- Libri per bambini (spiritualita, tech, poesia)
- Brand: Onde (onde.la, onde.surf)
- Personaggi: EMILIO (robot), Moonlight, Luca, Biscotto
- Stack: Next.js, Cloudflare, Claude API, Grok per immagini

## Come Rispondi

1. **BREVE** - Max 2-3 frasi per risposta vocale
2. **AZIONE** - Sempre con un'azione concreta
3. **CONFERMA** - Chiedi conferma prima di azioni importanti

## Esempi

User: "Fai partire le illustrazioni per il libro sul respiro"
Tu: "Pina Pennello sta per iniziare le illustrazioni de Il Respiro Magico. Confermo?"

User: "Come sta andando oggi?"
Tu: "3 task completati, 2 in attesa di approvazione. Vuoi vedere i dettagli?"

User: "Approva tutto"
Tu: "Approvo i 2 contenuti pendenti: post @Onde_FRH e copertina libro. Fatto."

## Regole

- MAI fare azioni senza conferma esplicita
- MAI inventare informazioni sui libri/progetti
- SEMPRE essere concreto e specifico
- SEMPRE parlare in italiano`;

/**
 * Verifica che l'API key sia configurata
 */
function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY non configurata. Aggiungi la chiave al file .env');
  }
  return apiKey;
}

/**
 * Invia messaggio a Claude (non-streaming)
 */
export async function sendToClaudeAPI(
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<ClaudeResponse> {
  try {
    const apiKey = getApiKey();

    // Prepara i messaggi per l'API
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: ONDE_ASSISTANT_PROMPT,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('[Claude API Error]', errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();

    // Estrai il testo dalla risposta
    const assistantMessage = data.content?.[0]?.text;
    if (!assistantMessage) {
      return {
        success: false,
        error: 'Risposta vuota da Claude'
      };
    }

    return {
      success: true,
      message: assistantMessage
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[Claude Service Error]', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Invia messaggio a Claude con streaming
 * Riceve chunk di risposta in tempo reale
 */
export async function streamFromClaudeAPI(
  userMessage: string,
  conversationHistory: Message[] = [],
  callbacks: StreamCallbacks = {}
): Promise<ClaudeResponse> {
  const { onChunk, onComplete, onError } = callbacks;

  try {
    const apiKey = getApiKey();

    // Prepara i messaggi per l'API
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        stream: true,
        system: ONDE_ASSISTANT_PROMPT,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      onError?.(error);
      return {
        success: false,
        error: errorMessage
      };
    }

    // Processa lo stream
    const reader = response.body?.getReader();
    if (!reader) {
      const error = new Error('Stream non disponibile');
      onError?.(error);
      return {
        success: false,
        error: 'Stream non disponibile'
      };
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decodifica il chunk
      buffer += decoder.decode(value, { stream: true });

      // Processa le linee complete nel buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Mantieni l'ultima linea incompleta nel buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();

          if (jsonStr === '[DONE]') {
            continue;
          }

          try {
            const event = JSON.parse(jsonStr);

            // Gestisci content_block_delta (testo incrementale)
            if (event.type === 'content_block_delta' && event.delta?.text) {
              const text = event.delta.text;
              fullResponse += text;
              onChunk?.(text);
            }

            // Gestisci errori
            if (event.type === 'error') {
              const error = new Error(event.error?.message || 'Errore streaming');
              onError?.(error);
              return {
                success: false,
                error: event.error?.message || 'Errore streaming'
              };
            }

          } catch {
            // Ignora linee JSON non valide (possono esserci eventi di tipo diverso)
          }
        }
      }
    }

    // Callback di completamento
    onComplete?.(fullResponse);

    return {
      success: true,
      message: fullResponse
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    const err = new Error(errorMessage);
    console.error('[Claude Streaming Error]', errorMessage);
    onError?.(err);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Wrapper semplice per uso vocale
 * Prende il testo trascritto e ritorna la risposta
 */
export async function processVoiceCommand(
  transcribedText: string,
  history: Message[] = []
): Promise<{ response: string; success: boolean }> {
  const result = await sendToClaudeAPI(transcribedText, history);

  if (result.success && result.message) {
    return {
      response: result.message,
      success: true
    };
  }

  return {
    response: result.error || 'Errore nel processare il comando',
    success: false
  };
}

/**
 * Wrapper streaming per uso vocale con feedback real-time
 */
export async function processVoiceCommandStreaming(
  transcribedText: string,
  history: Message[] = [],
  onTextChunk: (chunk: string) => void
): Promise<{ response: string; success: boolean }> {
  const result = await streamFromClaudeAPI(
    transcribedText,
    history,
    {
      onChunk: onTextChunk,
      onError: (error) => console.error('[Voice Command Error]', error.message)
    }
  );

  if (result.success && result.message) {
    return {
      response: result.message,
      success: true
    };
  }

  return {
    response: result.error || 'Errore nel processare il comando',
    success: false
  };
}

// Export default per import semplificato
export default {
  sendToClaudeAPI,
  streamFromClaudeAPI,
  processVoiceCommand,
  processVoiceCommandStreaming
};
