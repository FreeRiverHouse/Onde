/**
 * Free River Flow - Connessione al Mac
 *
 * L'app mobile si connette al Mac di casa dove gira Claude Code.
 * NON chiama API cloud - usa la subscription esistente di Mattia.
 *
 * Architettura:
 * 📱 iPhone/Watch/Occhiali → 🌐 WebSocket → 🖥️ Mac a casa → Claude Code
 */

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface MacServerMessage {
  type: string;
  [key: string]: any;
}

interface ConnectionCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  onTranscription?: (text: string) => void;
  onStream?: (text: string) => void;
  onResponse?: (text: string, actions?: any[]) => void;
  onTTS?: (audioBase64: string, format: string) => void;
  onStatus?: (status: string, message: string) => void;
}

class MacConnection {
  private ws: WebSocket | null = null;
  private serverUrl: string = '';
  private status: ConnectionStatus = 'disconnected';
  private callbacks: ConnectionCallbacks = {};
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private pingInterval: NodeJS.Timeout | null = null;

  /**
   * Connetti al Mac server
   * @param url - URL del server (es. ws://192.168.1.100:3847 o wss://freeriver.loca.lt)
   */
  async connect(url: string, callbacks: ConnectionCallbacks = {}): Promise<void> {
    this.serverUrl = url;
    this.callbacks = callbacks;
    this.status = 'connecting';

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('🔗 Connesso al Mac server');
          this.status = 'connected';
          this.reconnectAttempts = 0;
          this.startPing();
          this.callbacks.onConnected?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('❌ Errore WebSocket:', error);
          this.status = 'error';
          this.callbacks.onError?.('Errore connessione');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('👋 Disconnesso dal Mac server');
          this.status = 'disconnected';
          this.stopPing();
          this.callbacks.onDisconnected?.();
          this.attemptReconnect();
        };

        // Timeout connessione
        setTimeout(() => {
          if (this.status === 'connecting') {
            this.ws?.close();
            reject(new Error('Timeout connessione'));
          }
        }, 10000);

      } catch (err) {
        this.status = 'error';
        reject(err);
      }
    });
  }

  /**
   * Gestisce messaggi dal server
   */
  private handleMessage(data: string) {
    try {
      const message: MacServerMessage = JSON.parse(data);

      switch (message.type) {
        case 'connected':
          console.log('✅ Server conferma connessione:', message.clientId);
          break;

        case 'pong':
          // Risposta al ping, connessione ok
          break;

        case 'status':
          this.callbacks.onStatus?.(message.status, message.message);
          break;

        case 'transcription':
          this.callbacks.onTranscription?.(message.text);
          break;

        case 'stream':
          this.callbacks.onStream?.(message.text);
          break;

        case 'response':
          this.callbacks.onResponse?.(message.text, message.actions);
          break;

        case 'tts':
          this.callbacks.onTTS?.(message.data, message.format);
          break;

        case 'error':
          console.error('❌ Errore dal server:', message.message);
          this.callbacks.onError?.(message.message);
          break;

        case 'server_shutdown':
          console.log('⚠️ Server in chiusura');
          this.callbacks.onError?.('Server in chiusura');
          break;

        default:
          console.log('📨 Messaggio non gestito:', message.type);
      }
    } catch (err) {
      console.error('Errore parsing messaggio:', err);
    }
  }

  /**
   * Manda comando testuale al server
   */
  sendText(text: string): void {
    if (!this.isConnected()) {
      throw new Error('Non connesso al server');
    }

    this.ws?.send(JSON.stringify({
      type: 'text',
      text
    }));
  }

  /**
   * Manda audio al server per trascrizione
   * @param audioBase64 - Audio in formato base64
   */
  sendAudio(audioBase64: string): void {
    if (!this.isConnected()) {
      throw new Error('Non connesso al server');
    }

    this.ws?.send(JSON.stringify({
      type: 'audio',
      data: audioBase64
    }));
  }

  /**
   * Manda audio binario al server
   * @param audioBuffer - Buffer audio
   */
  sendAudioBuffer(audioBuffer: ArrayBuffer): void {
    if (!this.isConnected()) {
      throw new Error('Non connesso al server');
    }

    this.ws?.send(audioBuffer);
  }

  /**
   * Seleziona un agente specifico
   */
  selectAgent(agentId: string): void {
    if (!this.isConnected()) return;

    this.ws?.send(JSON.stringify({
      type: 'agent',
      agent: agentId
    }));
  }

  /**
   * Verifica se connesso
   */
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Stato attuale
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Disconnetti
   */
  disconnect(): void {
    this.stopPing();
    this.ws?.close();
    this.ws = null;
    this.status = 'disconnected';
  }

  /**
   * Ping periodico per mantenere connessione
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.ws?.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ogni 30 secondi
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Tenta riconnessione automatica
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max tentativi riconnessione raggiunti');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Tentativo riconnessione ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

    setTimeout(() => {
      if (this.serverUrl && this.status === 'disconnected') {
        this.connect(this.serverUrl, this.callbacks).catch(() => {
          // Fallisce silenziosamente, ritenterà
        });
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }
}

// Singleton per uso globale
export const macConnection = new MacConnection();

// Export tipo per config
export interface MacServerConfig {
  // URL locale (rete domestica)
  localUrl: string; // es. ws://192.168.1.100:3847

  // URL tunnel (fuori casa)
  tunnelUrl?: string; // es. wss://freeriver.loca.lt
}

/**
 * Trova e connetti al Mac server
 * Prima prova URL locale, poi tunnel
 */
export async function connectToMac(
  config: MacServerConfig,
  callbacks: ConnectionCallbacks
): Promise<void> {
  // Prima prova connessione locale
  try {
    console.log('🏠 Provo connessione locale...');
    await macConnection.connect(config.localUrl, callbacks);
    console.log('✅ Connesso via rete locale');
    return;
  } catch (err) {
    console.log('❌ Connessione locale fallita');
  }

  // Se fallisce, prova tunnel
  if (config.tunnelUrl) {
    try {
      console.log('🌐 Provo connessione tunnel...');
      await macConnection.connect(config.tunnelUrl, callbacks);
      console.log('✅ Connesso via tunnel');
      return;
    } catch (err) {
      console.log('❌ Connessione tunnel fallita');
    }
  }

  throw new Error('Impossibile connettersi al Mac server');
}

export type { ConnectionStatus, ConnectionCallbacks };
