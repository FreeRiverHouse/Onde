/**
 * Minimal WebSocket connection to Mac server
 *
 * Architecture:
 * iPhone -> WebSocket -> Mac Server -> Claude Code CLI
 */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (message: string) => void;
  onTranscription?: (text: string) => void;
  onResponse?: (text: string) => void;
  onTTS?: (audioBase64: string, format: string) => void;
  onStatus?: (status: string, message?: string) => void;
}

class MacConnection {
  private ws: WebSocket | null = null;
  private callbacks: ConnectionCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  private pingInterval: NodeJS.Timeout | null = null;

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async connect(serverUrl: string, callbacks: ConnectionCallbacks): Promise<void> {
    this.callbacks = callbacks;

    return new Promise((resolve, reject) => {
      try {
        console.log('[Connection] Connecting to:', serverUrl);
        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
          console.log('[Connection] Connected!');
          this.reconnectAttempts = 0;
          this.startPing();
          this.callbacks.onConnected?.();
          resolve();
        };

        this.ws.onclose = () => {
          console.log('[Connection] Disconnected');
          this.stopPing();
          this.callbacks.onDisconnected?.();
          this.attemptReconnect(serverUrl);
        };

        this.ws.onerror = (event) => {
          console.error('[Connection] Error:', event);
          this.callbacks.onError?.('Errore di connessione');
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        // Timeout connection
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('Timeout connessione'));
          }
        }, 10000);

      } catch (err) {
        reject(err);
      }
    });
  }

  disconnect(): void {
    this.stopPing();
    this.reconnectAttempts = this.maxReconnects; // Prevent reconnect
    this.ws?.close();
    this.ws = null;
  }

  sendAudio(base64Data: string): void {
    if (!this.isConnected) {
      console.warn('[Connection] Not connected');
      return;
    }

    this.ws?.send(JSON.stringify({
      type: 'audio',
      data: base64Data
    }));
  }

  sendText(text: string): void {
    if (!this.isConnected) {
      console.warn('[Connection] Not connected');
      return;
    }

    this.ws?.send(JSON.stringify({
      type: 'text',
      text
    }));
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'connected':
          console.log('[Connection] Server confirmed connection');
          break;

        case 'transcription':
          this.callbacks.onTranscription?.(message.text);
          break;

        case 'response':
          this.callbacks.onResponse?.(message.text);
          break;

        case 'tts':
          this.callbacks.onTTS?.(message.data, message.format || 'aiff');
          break;

        case 'status':
          this.callbacks.onStatus?.(message.status, message.message);
          break;

        case 'error':
          this.callbacks.onError?.(message.message);
          break;

        case 'pong':
          // Heartbeat response
          break;

        default:
          console.log('[Connection] Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('[Connection] Parse error:', err);
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.ws?.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect(serverUrl: string): void {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.log('[Connection] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`[Connection] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect(serverUrl, this.callbacks).catch(console.error);
    }, delay);
  }
}

export const macConnection = new MacConnection();
export default macConnection;
