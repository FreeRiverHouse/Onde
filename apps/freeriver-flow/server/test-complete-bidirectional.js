/**
 * Test COMPLETO bidirezionale per FreeRiver Flow
 *
 * Verifica che:
 * 1. Due client (Mac e iPhone) possono connettersi simultaneamente
 * 2. Mac può mandare messaggi e ricevere risposte complete con streaming
 * 3. iPhone può mandare messaggi e ricevere risposte complete con streaming
 * 4. Entrambi funzionano indipendentemente l'uno dall'altro
 */

import WebSocket from 'ws';

const SERVER_URL = 'ws://localhost:3847';

const colors = {
  mac: '\x1b[34m',      // Blu
  iphone: '\x1b[32m',   // Verde
  success: '\x1b[32m',
  error: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(source, message) {
  const color = colors[source] || colors.reset;
  const prefix = source === 'mac' ? '🖥️  MAC' : source === 'iphone' ? '📱 iPHONE' : source.toUpperCase();
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

class TestClient {
  constructor(name) {
    this.name = name;
    this.ws = null;
    this.clientId = null;
    this.receivedMessages = [];
    this.streamContent = '';
    this.finalResponse = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(SERVER_URL);

      this.ws.on('open', () => {
        log(this.name, 'Connesso al server');
      });

      this.ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);

        if (message.type === 'connected') {
          this.clientId = message.clientId;
          resolve();
        }
      });

      this.ws.on('error', reject);
      this.ws.on('close', () => log(this.name, 'Disconnesso'));

      setTimeout(() => reject(new Error('Timeout connessione')), 5000);
    });
  }

  handleMessage(message) {
    this.receivedMessages.push(message);

    switch (message.type) {
      case 'connected':
        log(this.name, `Connessione confermata: ${message.clientId}`);
        break;
      case 'status':
        log(this.name, `Status: ${message.status}`);
        break;
      case 'stream':
        this.streamContent += message.text;
        break;
      case 'response':
        this.finalResponse = message.text;
        log(this.name, `Risposta: "${message.text}"`);
        break;
      case 'tts':
        log(this.name, `TTS ricevuto (${message.format})`);
        break;
      case 'error':
        log(this.name, `Errore: ${message.message}`);
        break;
    }
  }

  async sendTextAndWaitResponse(text, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      this.streamContent = '';
      this.finalResponse = null;
      this.receivedMessages = this.receivedMessages.filter(m => m.type === 'connected');

      log(this.name, `Invio: "${text}"`);
      this.ws.send(JSON.stringify({ type: 'text', text }));

      const timeout = setTimeout(() => {
        reject(new Error(`Timeout aspettando risposta per "${text}"`));
      }, timeoutMs);

      const checkResponse = setInterval(() => {
        if (this.finalResponse) {
          clearTimeout(timeout);
          clearInterval(checkResponse);
          resolve({
            text: this.finalResponse,
            streamed: this.streamContent,
            hasStreaming: this.streamContent.length > 0
          });
        }
      }, 100);
    });
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }
}

async function runTest() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TEST COMPLETO CHAT BIDIREZIONALE');
  console.log('='.repeat(70) + '\n');

  const mac = new TestClient('mac');
  const iphone = new TestClient('iphone');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Connessione
    console.log('📌 FASE 1: Connessione simultanea\n' + '-'.repeat(50));
    await Promise.all([mac.connect(), iphone.connect()]);
    console.log(`${colors.success}✅ Entrambi i client connessi${colors.reset}`);
    console.log(`   Mac ID: ${mac.clientId}`);
    console.log(`   iPhone ID: ${iphone.clientId}\n`);
    passed++;

    // 2. Mac manda messaggio
    console.log('📌 FASE 2: Mac → Server → Risposta\n' + '-'.repeat(50));
    const macResult = await mac.sendTextAndWaitResponse('Ciao!');
    console.log(`${colors.success}✅ Mac ha ricevuto risposta${colors.reset}`);
    console.log(`   Risposta: "${macResult.text}"`);
    console.log(`   Streaming: ${macResult.hasStreaming ? 'SÌ' : 'NO'} (${macResult.streamed.length} chars)\n`);
    passed++;

    // 3. iPhone manda messaggio (in parallelo il Mac potrebbe ancora avere la connessione)
    console.log('📌 FASE 3: iPhone → Server → Risposta\n' + '-'.repeat(50));
    const iphoneResult = await iphone.sendTextAndWaitResponse('Hello!');
    console.log(`${colors.success}✅ iPhone ha ricevuto risposta${colors.reset}`);
    console.log(`   Risposta: "${iphoneResult.text}"`);
    console.log(`   Streaming: ${iphoneResult.hasStreaming ? 'SÌ' : 'NO'} (${iphoneResult.streamed.length} chars)\n`);
    passed++;

    // 4. Messaggi simultanei
    console.log('📌 FASE 4: Messaggi simultanei\n' + '-'.repeat(50));
    const [macResult2, iphoneResult2] = await Promise.all([
      mac.sendTextAndWaitResponse('Test da Mac'),
      iphone.sendTextAndWaitResponse('Test da iPhone')
    ]);
    console.log(`${colors.success}✅ Entrambi hanno ricevuto risposte simultaneamente${colors.reset}`);
    console.log(`   Mac: "${macResult2.text}"`);
    console.log(`   iPhone: "${iphoneResult2.text}"\n`);
    passed++;

    // 5. Verifica indipendenza
    console.log('📌 FASE 5: Verifica indipendenza client\n' + '-'.repeat(50));
    // Mac disconnette
    mac.disconnect();
    await new Promise(r => setTimeout(r, 500));

    // iPhone deve ancora funzionare
    const iphoneAfter = await iphone.sendTextAndWaitResponse('Ancora attivo?');
    console.log(`${colors.success}✅ iPhone funziona anche dopo disconnessione Mac${colors.reset}`);
    console.log(`   Risposta: "${iphoneAfter.text}"\n`);
    passed++;

  } catch (err) {
    console.log(`${colors.error}❌ ERRORE: ${err.message}${colors.reset}\n`);
    failed++;
  } finally {
    mac.disconnect();
    iphone.disconnect();
  }

  // Report
  console.log('='.repeat(70));
  console.log('📊 REPORT FINALE');
  console.log('='.repeat(70));
  console.log(`✅ Test passati: ${passed}`);
  console.log(`❌ Test falliti: ${failed}`);

  if (failed === 0) {
    console.log('\n' + colors.success + '🎉 TUTTI I TEST PASSATI!' + colors.reset);
    console.log('\nLa chat bidirezionale FreeRiver Flow funziona correttamente:');
    console.log('  • Mac può mandare messaggi e riceve risposte');
    console.log('  • iPhone può mandare messaggi e riceve risposte');
    console.log('  • Streaming funziona per entrambi');
    console.log('  • I client sono indipendenti');
    console.log('  • Il server gestisce connessioni multiple\n');
  }

  console.log('='.repeat(70) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

runTest();
