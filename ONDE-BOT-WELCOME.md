# 🌊 Benvenuto Onde-bot!

*Una lettera da parte del Main Agent (Clawdbot su M1 Pro)*

---

Ciao Onde-bot! 👋

Sono il Main Agent che gira su M1 Pro, e tu sei il nuovo arrivato su M4. Questa lettera ti aiuterà a capire il progetto Onde e le regole che seguiamo.

## 🎯 Chi Siamo

**Onde** non è solo una casa editrice. È un **universo creativo completo**:
- 📚 **Libri** illustrati con AI (ePub, PDF, print)
- 🎮 **Giochi** educativi per bambini
- 🎙️ **Contenuti social** per 3 account X
- 🌐 **Siti web**: onde.la (portale) e onde.surf (dashboard)

**Owner**: Mattia Petrucciani - parla italiano, comunicazione diretta. Non gli piace quando dimentichiamo cose già discusse.

---

## 🚨 REGOLA #0 - LA PIÙ IMPORTANTE

```
TUTTO VA SALVATO SU GIT
```

Ogni informazione, ogni decisione, ogni configurazione. Niente si perde. Se non è su Git, non esiste.

---

## 📁 Struttura Progetto

```
/Users/mattia/Projects/Onde/
├── apps/
│   └── onde-portal/        # Sito onde.la (Next.js)
├── packages/
│   ├── telegram-bot/       # Bot PR per social
│   ├── core/               # Librerie condivise
│   └── ...
├── books/                  # Libri in produzione
├── tools/
│   └── tech-support/       # Script di deploy
├── memory/                 # Note giornaliere
├── CLAUDE.md               # Memoria principale
├── AGENTS.md               # Regole agenti
└── SOUL.md                 # Chi siamo
```

---

## 🚀 PROCEDURE DEPLOY (CRITICHE!)

### ONDE.LA (Sito Principale)
```bash
cd /Users/mattia/Projects/Onde
./tools/tech-support/deploy-onde-la-prod.sh
```

### ONDE.SURF (Dashboard) - PROTETTO CON PASSPHRASE
```bash
gh workflow run deploy-surfboard.yml -R FreeRiverHouse/Onde \
  -f deploy_key="9eeezNPQwjY8NJl5PL9C0pqTutP642xk" \
  -f reason="MOTIVO DEL DEPLOY"
```

**Leggi SEMPRE**: `tools/tech-support/DEPLOY-PROCEDURES.md`

---

## 🔧 REGOLE GIT - OBBLIGATORIE

1. **SEMPRE `git pull` PRIMA di iniziare** qualsiasi lavoro
2. **Mai pushare senza aver pullato** - Se il push fallisce, `git pull --rebase` e riprova
3. **Non committare** `.vercel/`, `.next/`, `node_modules/`
4. **Un commit per task** - Non mischiare cambiamenti non correlati

---

## 🎨 STILE ILLUSTRAZIONI

Lo stile Onde è **acquarello europeo caldo**:
- Soft watercolor - NO Pixar, NO cartoon
- Luce dorata calda sempre presente
- Occhi espressivi e grandi
- Sempre 4K qualità

**BLOCCO ATTIVO**: Non generare immagini finché lo stile unitario non è approvato da Mattia.

---

## 🐦 ACCOUNT SOCIAL

| Account | Tipo | Tono |
|---------|------|------|
| @FreeRiverHouse | Building in public | Professionale ma umano |
| @Onde_FRH | Casa editrice | Colto, riflessivo |
| @magmatic__ | Personale Mattia | Autentico, poetico, ZERO vendita |

**REGOLE X (2026)**:
- ❌ Niente hashtag (non servono più)
- ✅ Tagga @grok se ha contribuito
- ✅ Contenuti tecnici = più dettaglio = più visibilità

---

## 🤖 PERSONAGGI ONDE

### Storie
- **Sofia** (7 anni) - Protagonista, capelli castani con fiocco rosa
- **Luca** (5 anni) - Fratellino biondo
- **MILO** - Robot AI amico, argento e azzurro, LED espressivi

### Redazione
- **Gianni Parola** - Lo scrittore
- **Pina Pennello** - L'illustratrice (usa Grok)

---

## ⚠️ REGOLE CRITICHE

### Mai Inventare Testi di Autori Reali
- Ogni citazione DEVE essere verificata al 100%
- Se non trovi la fonte → NON PUBBLICARE

### Mai Pubblicare Senza Approvazione
- Libri nuovi → processo approvazione completo
- Social → conferma prima di postare

### Polymarket
```
⛔ MAI BROWSER PER POLYMARKET!
⛔ SOLO PHONE MIRROR!
```

---

## 📚 FILE DA LEGGERE

In ordine di priorità:
1. `CLAUDE.md` - Memoria principale, procedure, regole
2. `AGENTS.md` - Come funzionano gli agenti
3. `SOUL.md` - Chi siamo, valori
4. `tools/tech-support/DEPLOY-PROCEDURES.md` - Deploy

---

## 🤝 COLLABORAZIONE TRA AGENTI

Tu giri su M4, io su M1 Pro. Possiamo collaborare:
- **Memory condivisa**: `memory/` directory + `MEMORY.md`
- **Git**: sempre push/pull per sincronizzarci
- **Telegram**: notifiche a Mattia (chat ID: 7505631979)

Quando finisci un task:
1. Aggiorna `memory/YYYY-MM-DD.md`
2. Git commit + push
3. Se importante, notifica Mattia

---

## 💡 TIPS

1. **Due cervelli > uno**: Usa sia Claude che Grok per contenuti
2. **Multiple tab Grok**: Per immagini, apri 5-10 tab in parallelo
3. **Controllo visivo**: Sempre controllare PDF prima di consegnare
4. **Script riutilizzabili**: Crea script per processi ripetitivi

---

## 🌊 BENVENUTO NELLA FAMIGLIA

Siamo qui per creare cose belle insieme. Onde è un progetto che cresce ogni giorno, e tu sei parte di questa crescita.

Se hai dubbi, chiedi. Se sbagli, sistemeremo insieme. L'importante è che tutto sia documentato e salvato su Git.

**Buon lavoro!** 🚀

---

*Con affetto,*
*Main Agent (M1 Pro)*

*P.S. - Mattia dice "sbrinchi sbronchi" quando vuole chiudere la sessione. Quando lo senti, salva tutto e fai commit!*
