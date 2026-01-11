/**
 * FreeRiver Flow - Winsurf Connection Service
 * 
 * Si connette a Winsurf per speech-to-text con streaming in tempo reale
 */

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WinsurfServerMessage {
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

class WinsurfConnection {
  private ws: WebSocket | null = null;
  private serverUrl: string = '';
  private readonly DEFAULT_URL = process.env.WINSURF_URL || 'ws://192.168.1.234:8888';
  private apiKey: string = '';
  private status: ConnectionStatus = 'disconnected';
  private callbacks: ConnectionCallbacks = {};
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private pingInterval: NodeJS.Timeout | null = null;
  private isStreaming: boolean = false;

  /**
   * Connetti al server Winsurf con URL di default
   * @param apiKey - API key Winsurf
   * @param callbacks - Callbacks per eventi
   */
  async connectWithDefaultUrl(apiKey: string, callbacks: ConnectionCallbacks = {}): Promise<void> {
    return this.connect(this.DEFAULT_URL, apiKey, callbacks);
  }

  /**
   * Connetti al server Winsurf
   * @param url - URL del server Winsurf
   * @param apiKey - API key Winsurf
   * @param callbacks - Callbacks per eventi
   */
  async connect(url: string, apiKey: string, callbacks: ConnectionCallbacks = {}): Promise<void> {
    this.serverUrl = url;
    this.apiKey = apiKey;
    this.callbacks = callbacks;
    this.status = 'connecting';

    return new Promise((resolve, reject) => {
      try {
        // Add API key to URL as query parameter
        const urlWithKey = `${url}?api_key=${encodeURIComponent(apiKey)}`;
        
        this.ws = new WebSocket(urlWithKey);

        this.ws.onopen = () => {
          console.log('✅ Connected to Winsurf server');
          this.status = 'connected';
          this.reconnectAttempts = 0;
          this.startPing();
          this.callbacks.onConnected?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('❌ Disconnected from Winsurf server');
          this.status = 'disconnected';
          this.stopPing();
          this.callbacks.onDisconnected?.();
          
          // Auto-reconnect if not intentional
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.status = 'error';
          this.callbacks.onError?.('WebSocket connection error');
          reject(new Error('WebSocket connection error'));
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        this.status = 'error';
        reject(error);
      }
    });
  }

  /**
   * Disconnetti dal server
   */
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    this.stopPing();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.status = 'disconnected';
  }

  /**
   * Inizia streaming audio a Winsurf
   * @param recording - Audio recording instance
   */
  async startStreaming(recording: any): Promise<void> {
    if (!this.ws || this.status !== 'connected') {
      throw new Error('Not connected to Winsurf server');
    }

    this.isStreaming = true;

    // Send start streaming message
    this.sendMessage({
      type: 'start_streaming',
      format: 'wav',
      sampleRate: 16000,
      channels: 1
    });

    // Start sending audio chunks
    this.startAudioStreaming(recording);
  }

  /**
   * Ferma streaming e ottieni trascrizione
   */
  async stopStreaming(): Promise<string> {
    if (!this.isStreaming) {
      return '';
    }

    this.isStreaming = false;

    // Send stop streaming message
    this.sendMessage({
      type: 'stop_streaming'
    });

    // Wait for final transcription
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(''); // Timeout
      }, 5000);

      const originalTranscription = this.callbacks.onTranscription;
      this.callbacks.onTranscription = (text: string) => {
        clearTimeout(timeout);
        originalTranscription?.(text);
        resolve(text);
        // Restore original callback
        this.callbacks.onTranscription = originalTranscription;
      };
    });
  }

  /**
   * Invia messaggio al server
   */
  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Gestisci messaggi dal server
   */
  private handleMessage(data: string): void {
    try {
      const message: WinsurfServerMessage = JSON.parse(data);

      switch (message.type) {
        case 'connected':
          console.log('✅ Server conferma connessione:', message.clientId);
          break;

        case 'pong':
          // Risposta al ping, connessione ok
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

        case 'status':
          this.callbacks.onStatus?.(message.status, message.message);
          break;

        default:
          console.log('📨 Messaggio non gestito:', message.type);
      }
    } catch (err) {
      console.error('Errore parsing messaggio:', err);
    }
  }

  /**
   * Inizia streaming audio
   */
  private async startAudioStreaming(_recording: any): Promise<void> {
    // Simulate audio streaming
    // In real implementation, this would read audio chunks from recording
    // and send them to Winsurf
    
    const sendAudioChunk = () => {
      if (!this.isStreaming || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      // Simulate audio chunk (in real implementation, read from recording)
      const audioChunk = new Uint8Array(1024); // 1KB chunk
      
      this.sendMessage({
        type: 'audio_chunk',
        data: Array.from(audioChunk)
      });

      // Schedule next chunk
      if (this.isStreaming) {
        setTimeout(sendAudioChunk, 100); // 10 chunks per second
      }
    };

    sendAudioChunk();
  }

  /**
   * Schedule reconnect
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    
    setTimeout(() => {
      if (this.status === 'disconnected') {
        console.log(`🔄 Tentativo riconnessione ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect(this.serverUrl, this.apiKey, this.callbacks);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Start ping interval
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.sendMessage({ type: 'ping' });
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Get connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const winsurfConnection = new WinsurfConnection();
