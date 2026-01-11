/**
 * Flow Configuration
 *
 * Configura qui l'indirizzo del tuo Mac server
 */

// Per trovare l'IP del tuo Mac:
// 1. Apri Preferenze di Sistema > Rete
// 2. Copia l'indirizzo IP (es. 192.168.1.100)
// 3. Sostituisci qui sotto

export const CONFIG = {
  // WebSocket server URL
  // Il server Free River Flow gira sulla porta 3847
  serverUrl: 'ws://192.168.1.243:3847',

  // Per sviluppo locale (Mac e iPhone sulla stessa rete)
  // Trova il tuo IP con: ipconfig getifaddr en0
  // Esempio: ws://192.168.1.xxx:3847

  // Per tunnel pubblico (ngrok, cloudflare tunnel)
  // Usa l'URL del tunnel
  // Esempio: wss://your-tunnel.ngrok.io
};

export default CONFIG;
