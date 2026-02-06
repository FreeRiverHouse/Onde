'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// Italian 5-letter words
const ITALIAN_WORDS = [
  // Common words
  'CIAO', 'AMORE', 'TERRA', 'ACQUA', 'FUOCO', 'VENTO', 'CIELO', 'NOTTE',
  'GIORNO', 'LUNA', 'SOLE', 'STELLA', 'MONDO', 'CASA', 'PORTA', 'LIBRO',
  'PENNA', 'CARTA', 'TEMPO', 'VITA', 'MORTE', 'CUORE', 'MANO', 'PIEDE',
  'OCCHI', 'BOCCA', 'NASO', 'TESTA', 'CORPO', 'NOME', 'ANNO', 'MESE',
  // Nature
  'FIORE', 'ALBERO', 'ERBA', 'FOGLIA', 'BOSCO', 'MARE', 'FIUME', 'LAGO',
  'MONTE', 'PIETRA', 'SABBIA', 'NEVE', 'PIOGGIA', 'NUBE', 'LAMPO',
  // Animals
  'CANE', 'GATTO', 'PESCE', 'UCCELLO', 'TOPO', 'LUPO', 'ORSO', 'TIGRE',
  'LEONE', 'RANA', 'SERPE', 'MOSCA', 'APE', 'FARFALLA',
  // Food
  'PANE', 'PASTA', 'PIZZA', 'CARNE', 'LATTE', 'VINO', 'OLIO', 'SALE',
  'MELA', 'PERA', 'ARANCIA', 'LIMONE', 'UOVA', 'RISO', 'TORTA', 'DOLCE',
  // Colors
  'ROSSO', 'VERDE', 'GIALLO', 'AZZURRO', 'NERO', 'BIANCO', 'GRIGIO',
  // Family
  'PADRE', 'MADRE', 'FIGLIO', 'FIGLIA', 'NONNO', 'NONNA', 'ZIO', 'ZIA',
  // Actions/Objects
  'PAROLA', 'VOCE', 'SUONO', 'LUCE', 'OMBRA', 'SOGNO', 'IDEA', 'COSA',
  'FATTO', 'LUOGO', 'PUNTO', 'PARTE', 'FINE', 'INIZIO', 'CENTRO',
  // Extra common 5-letter Italian words
  'CAMPO', 'FERRO', 'LEGNO', 'VETRO', 'CORDA', 'CHIAVE', 'BANCO', 'SEDIA',
  'TAVOLO', 'LETTO', 'STRADA', 'PIAZZA', 'CHIESA', 'SCUOLA', 'PONTE',
  'TRENO', 'NAVE', 'AEREO', 'RUOTA', 'CARRO', 'MURO', 'TETTO', 'SCALA',
  'PIANO', 'STANZA', 'BAGNO', 'CUCINA', 'GIARDINO', 'FRUTTO', 'GUSTO',
  'SENSO', 'FORZA', 'PACE', 'GUERRA', 'STORIA', 'PAESE', 'STATO', 'POPOLO',
  'DONNA', 'UOMO', 'BIMBO', 'RAGAZZO', 'AMICO', 'NEMICO', 'RE', 'REGINA',
].filter(word => word.length === 5).map(w => w.toUpperCase())

// Deduplicate
const WORD_LIST = [...new Set(ITALIAN_WORDS)]

// Valid 5-letter Italian words for guesses (extended list)
const VALID_GUESSES = new Set([
  ...WORD_LIST,
  // Additional valid words
  'CANTO', 'BALLO', 'SALTO', 'CORSA', 'NUOTO', 'GIOCO', 'FESTA', 'BACIO',
  'ABITO', 'GONNA', 'CALZA', 'CAMICIA', 'BORSA', 'ZAINO', 'ANELLO', 'OROLOGIO',
  'TRISTE', 'FELICE', 'BELLO', 'BRUTTO', 'NUOVO', 'VECCHIO', 'GRANDE', 'PICCOLO',
  'ALTO', 'BASSO', 'LUNGO', 'CORTO', 'LARGO', 'STRETTO', 'CALDO', 'FREDDO',
  'BUONO', 'CATTIVO', 'DOLCE', 'AMARO', 'ACIDO', 'SALATO', 'DURO', 'MOLLE',
  'PRIMO', 'ULTIMO', 'TUTTO', 'NULLA', 'MOLTO', 'POCO', 'TANTO', 'QUANTO',
  'OGGI', 'DOMANI', 'SEMPRE', 'ADESSO', 'PRESTO', 'TARDI', 'PRIMA', 'DOPO',
  'SOPRA', 'SOTTO', 'DENTRO', 'FUORI', 'VICINO', 'LONTANO', 'AVANTI', 'DIETRO',
  'ANCHE', 'SENZA', 'VERSO', 'CONTRO', 'CIRCA', 'OLTRE', 'LUNGO', 'PRESSO',
  'ESSERE', 'AVERE', 'FARE', 'DIRE', 'DARE', 'STARE', 'ANDARE', 'VENIRE',
  'VEDERE', 'SAPERE', 'POTERE', 'VOLERE', 'DOVERE', 'TENERE', 'PRENDERE',
  'METTERE', 'PORTARE', 'TROVARE', 'PARLARE', 'PENSARE', 'SENTIRE', 'VIVERE',
  'MORIRE', 'NASCERE', 'CRESCERE', 'CADERE', 'SALIRE', 'SCENDERE', 'ENTRARE',
  'USCIRE', 'APRIRE', 'CHIUDERE', 'INIZIARE', 'FINIRE', 'CONTINUARE',
  // More 5-letter words
  'ACQUA', 'AIUTO', 'ALTRO', 'AMICA', 'AMICO', 'ANCHE', 'ANIMA', 'APICE',
  'ARABO', 'ARARE', 'ARCA', 'ARDUO', 'ARENA', 'ARIDO', 'ARMA', 'AROMA',
  'AVARO', 'AVENA', 'BACIO', 'BALZO', 'BANCO', 'BANDO', 'BARBA', 'BARCA',
  'BASSO', 'BASTA', 'BELLA', 'BELLO', 'BENDA', 'BENNE', 'BERE', 'BERLA',
  'BIDONE', 'BIRRA', 'BOCCA', 'BOMBA', 'BORDO', 'BORGO', 'BRACE', 'BRAVO',
  'BREVE', 'BRODO', 'BRUNO', 'BUGIA', 'BURRO', 'BUSTA', 'CABINA', 'CACCIA',
  'CAFFE', 'CALMA', 'CALVO', 'CAMMA', 'CAMPO', 'CANNA', 'CANTO', 'CAOS',
  'CAPRA', 'CARNE', 'CARRO', 'CARTA', 'CIRCA', 'CASSA', 'CAUSA', 'CAVIA',
  'CELLA', 'CENERE', 'CENTO', 'CERTA', 'CERTO', 'CHINA', 'CIRCA', 'CLIMA',
  'COLPA', 'COLPO', 'CONTO', 'COPPA', 'CORDA', 'CORNO', 'CORPO', 'CORSA',
  'CORTE', 'COSA', 'COSTA', 'CREMA', 'CROCE', 'CUBO', 'CUOCA', 'CUOCO',
  'CURVA', 'DANZA', 'DEBOLE', 'DELLO', 'DELTA', 'DENTE', 'DETTO', 'DIETA',
  'DISCO', 'DITO', 'DOCCIA', 'DOGMA', 'DOLCE', 'DONNA', 'DONO', 'DOPO',
  'DORSO', 'DOSE', 'DRAGO', 'DROGA', 'DUBBIO', 'DUOMO', 'EBANO', 'EBETE',
  'ELICA', 'ENTRO', 'EPOCA', 'ERBA', 'EROE', 'ERRATA', 'ESAME', 'ESITO',
  'EXTRA', 'FANGO', 'FARINA', 'FASE', 'FATO', 'FAUNA', 'FAVE', 'FEGATO',
  'FELCE', 'FEMME', 'FERMO', 'FERRO', 'FESTA', 'FIBRA', 'FIERA', 'FIGLIO',
  'FILMA', 'FILO', 'FIORE', 'FISSO', 'FIUME', 'FLORA', 'FOBIA', 'FOCE',
  'FOGGIA', 'FOLLA', 'FONDO', 'FONTE', 'FORESTA', 'FORMA', 'FORNO', 'FORTE',
  'FORZA', 'FOSSO', 'FOTO', 'FRAGO', 'FRASE', 'FRATE', 'FRECCIA', 'FRENO',
  'FRIGO', 'FRONTE', 'FRUTTA', 'FUMO', 'FUNE', 'FUNGO', 'FUOCO', 'FUORI',
  'GAMBA', 'GAMMA', 'GARA', 'GARBO', 'GASOLIO', 'GATTO', 'GELO', 'GENIO',
  'GENTE', 'GESTO', 'GETTO', 'GHIACCIO', 'GIARA', 'GIGA', 'GIOCO', 'GIOIA',
  'GIRO', 'GONNA', 'GOTTA', 'GRADO', 'GRANA', 'GRANDE', 'GRASSO', 'GRATA',
  'GRAVE', 'GRIDO', 'GRIFO', 'GROTTA', 'GRUMO', 'GUADO', 'GUAIO', 'GUANTO',
  'GUFO', 'GUIDA', 'GUSTO', 'HOTEL', 'IDEA', 'IENA', 'IGLOO', 'IMAGO',
  'INDIA', 'INDIO', 'INNO', 'INVIO', 'IRIDE', 'IRONIA', 'ISOLA', 'JOLLY',
  'JUDO', 'KARMA', 'KIWI', 'KOALA', 'LABBRO', 'LADRO', 'LAGO', 'LAMPO',
  'LANA', 'LANCIA', 'LARGO', 'LATTE', 'LAURO', 'LEGGE', 'LEGNO', 'LENTO',
  'LEONE', 'LEPRE', 'LETTO', 'LEVA', 'LIBRO', 'LICEO', 'LIDO', 'LIETO',
  'LIEVE', 'LILLA', 'LIMBO', 'LIMITE', 'LINEA', 'LINGUA', 'LINO', 'LISTA',
  'LITE', 'LITRO', 'LODE', 'LOGGIA', 'LOGICA', 'LOTTA', 'LUCE', 'LUOGO',
  'LUPO', 'LUSSO', 'MACRO', 'MADRE', 'MAFIA', 'MAGO', 'MAIS', 'MAMMA',
  'MANCA', 'MANCO', 'MANDO', 'MANGO', 'MANTO', 'MARCA', 'MARCO', 'MARE',
  'MARIA', 'MARIO', 'MASSA', 'MASSO', 'MATITA', 'MATTO', 'MEDIA', 'MEDIE',
  'MEDIO', 'MELA', 'MENTA', 'MENTE', 'MERCE', 'MERITO', 'MESSA', 'MESSO',
  'META', 'METRO', 'MEZZO', 'MICRO', 'MIELE', 'MILLE', 'MINA', 'MINIMO',
  'MIRA', 'MISTO', 'MITO', 'MODA', 'MODO', 'MOGLIE', 'MOLLA', 'MOLTO',
  'MONDO', 'MONTE', 'MORA', 'MORTE', 'MOSCA', 'MOSSA', 'MOSSO', 'MOSTRA',
  'MOTO', 'MOTTO', 'MUCCA', 'MUFFA', 'MULO', 'MURO', 'MUSEO', 'MUSICA',
  'MUSO', 'NANO', 'NASCE', 'NASO', 'NASTRO', 'NATO', 'NAVE', 'NEBBIA',
  'NEGOZIO', 'NELLO', 'NEON', 'NERO', 'NERVO', 'NESSO', 'NETTO', 'NEVE',
  'NIDO', 'NINJA', 'NIPOTE', 'NOCCA', 'NODO', 'NOIE', 'NOME', 'NONNO',
  'NORMA', 'NOTA', 'NOTTE', 'NOVE', 'NUBE', 'NUCA', 'NUDO', 'NULLO',
  'NUOTO', 'NUOVA', 'NUOVO', 'OBLIO', 'OCCHI', 'OCEANO', 'OLIO', 'OLIVA',
  'OLMO', 'OLTRE', 'OMBRA', 'OMERO', 'ONDA', 'ONDE', 'ONERE', 'OPERA',
  'OPPIO', 'OPZIONE', 'ORA', 'ORARIO', 'ORBITA', 'ORDINE', 'ORECCHIO',
  'ORGANO', 'ORGIA', 'ORLO', 'ORMAI', 'ORNARE', 'ORO', 'OROLOGIO', 'ORSO',
  'ORTO', 'OSARE', 'OSPEDALE', 'OSSO', 'OSTIA', 'OTITE', 'OTTO', 'OVALE',
  'OVEST', 'OZONO', 'PACE', 'PADRE', 'PAESE', 'PAGA', 'PAIO', 'PALLA',
  'PALMA', 'PALO', 'PANCA', 'PANDA', 'PANE', 'PANNO', 'PAOLO', 'PAPA',
  'PAPÀ', 'PAPPA', 'PARATA', 'PARCO', 'PARI', 'PARLA', 'PAROLA', 'PARTE',
  'PARTO', 'PASQUA', 'PASSO', 'PASTA', 'PASTO', 'PAURA', 'PAUSA', 'PAVONE',
  'PECORA', 'PEGGIO', 'PELLE', 'PELO', 'PENA', 'PENNA', 'PENSO', 'PEPE',
  'PERA', 'PERCHÉ', 'PERLA', 'PERO', 'PERSONA', 'PESCA', 'PESCE', 'PESO',
  'PEZZO', 'PIAGA', 'PIANO', 'PIANTA', 'PIATTO', 'PIAZZA', 'PICCO', 'PIEDE',
  'PIEGA', 'PIENO', 'PIETRA', 'PIGRO', 'PILA', 'PINO', 'PIOGGIA', 'PIPA',
  'PISTA', 'PIZZA', 'PLATEA', 'POCO', 'PODIO', 'POETA', 'POGGIO', 'POLLO',
  'POLPO', 'POLSO', 'POMPA', 'POMO', 'PONTE', 'POPOLO', 'PORCO', 'PORRO',
  'PORTA', 'PORTO', 'POSTA', 'POSTO', 'POZZO', 'PRANZO', 'PRATO', 'PREGIO',
  'PREMI', 'PREMIO', 'PRESA', 'PRESSO', 'PRESTO', 'PRIMA', 'PRIMO', 'PRIVO',
  'PRODA', 'PRONTO', 'PROVA', 'PRUGNO', 'PSICHE', 'PUGNO', 'PUNTA', 'PUNTO',
  'PUOI', 'PURE', 'PURO', 'QUADRO', 'QUALE', 'QUANDO', 'QUASI', 'QUELLO',
  'QUESTO', 'QUIETE', 'QUINDI', 'QUOTA', 'RABBIA', 'RADAR', 'RADIO', 'RAFFA',
  'RAGAZZA', 'RAGAZZO', 'RAGGIO', 'RAGNO', 'RAMO', 'RANA', 'RANGO', 'RARO',
  'RAZZA', 'REALE', 'REATO', 'REGALO', 'REGIME', 'REGINA', 'REGNO', 'RESA',
  'RESTO', 'RETE', 'RICCA', 'RICCO', 'RIDO', 'RIMA', 'RISO', 'RITO',
  'RITMO', 'RIVA', 'ROCCA', 'ROCCIA', 'ROGO', 'ROMA', 'ROMBO', 'RONDA',
  'ROSA', 'ROSPO', 'ROSSO', 'ROTTA', 'ROTTO', 'RULLO', 'RUMORE', 'RUOLO',
  'RUOTA', 'RUSSO', 'SABBIA', 'SACRO', 'SAGGIO', 'SALA', 'SALE', 'SALMO',
  'SALSA', 'SALTO', 'SALVA', 'SALVO', 'SANGUE', 'SANITÀ', 'SANTO', 'SAPERE',
  'SAPONE', 'SARDO', 'SARTO', 'SASSO', 'SCALO', 'SCARPA', 'SCARTO', 'SCAVO',
  'SCENA', 'SCIA', 'SCOPO', 'SCOSSA', 'SCUDO', 'SCUOLA', 'SECCO', 'SECOLO',
  'SEDIA', 'SEGNO', 'SELLA', 'SELVA', 'SEME', 'SENATO', 'SENSO', 'SENTO',
  'SENZA', 'SERA', 'SERIE', 'SERPE', 'SERRA', 'SERVO', 'SESSO', 'SETA',
  'SETTE', 'SFIDA', 'SFOGO', 'SFONDO', 'SFORZO', 'SICURO', 'SIGMA', 'SIGNO',
  'SIMILE', 'SIRENA', 'SITO', 'SLAVO', 'SLOGAN', 'SMALTO', 'SNODO', 'SODA',
  'SOFIA', 'SOGLIA', 'SOGNO', 'SOLDO', 'SOLE', 'SOLITO', 'SOLLO', 'SOLO',
  'SOMMA', 'SONNO', 'SOPRA', 'SORDO', 'SORGE', 'SORSO', 'SORTA', 'SORTE',
  'SOTTO', 'SPADA', 'SPAGO', 'SPALLA', 'SPARO', 'SPAZIO', 'SPECIE', 'SPESA',
  'SPESSO', 'SPIGA', 'SPINA', 'SPIRA', 'SPORT', 'SPOSA', 'SPOSO', 'SPRAY',
  'SPUMA', 'STALLA', 'STAMPA', 'STANCO', 'STANZA', 'STATO', 'STELO', 'STESSO',
  'STILE', 'STIMA', 'STOCK', 'STOFFA', 'STORIA', 'STORMO', 'STRADA', 'STRATO',
  'STRESS', 'STRISCIO', 'STRONZO', 'STUDIO', 'STUFA', 'STUFATO', 'STUPIDO',
  'SUBITO', 'SUCCO', 'SUDORE', 'SUGO', 'SULLA', 'SULLO', 'SUONO', 'SUPER',
  'SUSHI', 'SVAGO', 'SVOLTA', 'TACCO', 'TAGLIO', 'TALE', 'TALPA', 'TANTO',
  'TAPPO', 'TARDI', 'TARGA', 'TASSO', 'TASTO', 'TAVOLA', 'TAZZA', 'TEATRO',
  'TELA', 'TEMA', 'TEMPIO', 'TEMPO', 'TENDA', 'TENERO', 'TERRA', 'TERZO',
  'TESI', 'TESTA', 'TESTO', 'TETTO', 'TIGRE', 'TINTA', 'TIPO', 'TIRO',
  'TITOLO', 'TIZIO', 'TOCCO', 'TONO', 'TONTO', 'TOPO', 'TORBA', 'TORCIA',
  'TORO', 'TORRE', 'TORSO', 'TORTA', 'TOSSE', 'TOTALE', 'TRAM', 'TRANNE',
  'TRATTO', 'TRENO', 'TREND', 'TRONCO', 'TROPPO', 'TROTA', 'TROVA', 'TRULLO',
  'TUBO', 'TULIPANO', 'TUMORE', 'TUONO', 'TURBO', 'TURNO', 'TUTTO', 'UFFICIALE',
  'UGUALI', 'ULIVO', 'ULTIMA', 'ULTIMO', 'UMANO', 'UMIDO', 'UMORE', 'UNICA',
  'UNICO', 'UNITÀ', 'UNITO', 'UOMO', 'UOVA', 'UOVO', 'URBAN', 'URLO',
  'USATO', 'USCIO', 'USCITA', 'USO', 'UTILE', 'UVETTA', 'VACCA', 'VAGO',
  'VALE', 'VALLE', 'VALSO', 'VALVA', 'VAMPIRO', 'VANGA', 'VANO', 'VANTO',
  'VAPORE', 'VASCA', 'VASO', 'VASTO', 'VATE', 'VECCHIO', 'VEDO', 'VELA',
  'VELENO', 'VELO', 'VENA', 'VENDO', 'VENTO', 'VENTRE', 'VERDE', 'VERME',
  'VERO', 'VERSO', 'VESTE', 'VETRO', 'VETTA', 'VIA', 'VIALE', 'VIBRA',
  'VICINO', 'VIDEO', 'VIENE', 'VIGILE', 'VIGNA', 'VILLA', 'VINCA', 'VINO',
  'VIOLA', 'VIRUS', 'VISO', 'VISTA', 'VISTO', 'VITA', 'VITE', 'VITREO',
  'VITTIMA', 'VITTO', 'VIVO', 'VIZIO', 'VOCE', 'VOGLIA', 'VOLARE', 'VOLGE',
  'VOLPE', 'VOLTA', 'VOLTO', 'VORTICE', 'VOTO', 'VULCANO', 'VUOLE', 'VUOTO',
  'WAFER', 'WATT', 'YACHT', 'YOGA', 'ZANNA', 'ZAPPA', 'ZEBRA', 'ZELO',
  'ZENIT', 'ZERO', 'ZINCO', 'ZIO', 'ZITTO', 'ZONA', 'ZOZZO', 'ZUCCA',
  'ZUPPA',
].filter(w => w.length === 5).map(w => w.toUpperCase()))

// Keyboard layout (Italian)
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['INVIO', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
]

type LetterStatus = 'correct' | 'present' | 'absent' | 'unused'
type GameMode = 'menu' | 'daily' | 'practice' | 'won' | 'lost'

interface GuessResult {
  letter: string
  status: LetterStatus
}

// Helper functions
const getDateString = () => new Date().toISOString().split('T')[0]

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const getDailyWord = (): string => {
  const today = getDateString()
  const seed = parseInt(today.replace(/-/g, ''))
  const index = Math.floor(seededRandom(seed) * WORD_LIST.length)
  return WORD_LIST[index]
}

const getRandomWord = (): string => {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
}

const evaluateGuess = (guess: string, target: string): GuessResult[] => {
  const result: GuessResult[] = []
  const targetLetters = target.split('')
  const guessLetters = guess.split('')
  const used = new Array(5).fill(false)

  // First pass: find correct letters
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = { letter: guessLetters[i], status: 'correct' }
      used[i] = true
    }
  }

  // Second pass: find present letters
  for (let i = 0; i < 5; i++) {
    if (result[i]) continue

    const letter = guessLetters[i]
    let found = false

    for (let j = 0; j < 5; j++) {
      if (!used[j] && targetLetters[j] === letter) {
        found = true
        used[j] = true
        break
      }
    }

    result[i] = { letter, status: found ? 'present' : 'absent' }
  }

  return result
}

// Sound effects
const playSound = (type: 'key' | 'submit' | 'win' | 'lose' | 'invalid') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'key':
        osc.type = 'sine'
        osc.frequency.value = 400
        gain.gain.value = 0.05
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'submit':
        osc.type = 'sine'
        osc.frequency.value = 600
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(800, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'win':
        osc.type = 'sine'
        osc.frequency.value = 523.25
        gain.gain.value = 0.06
        osc.start()
        setTimeout(() => {
          osc.frequency.value = 659.25
          setTimeout(() => {
            osc.frequency.value = 783.99
            setTimeout(() => {
              osc.frequency.value = 1046.5
            }, 100)
          }, 100)
        }, 100)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
        osc.stop(audio.currentTime + 0.5)
        break
      case 'lose':
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = 0.05
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(80, audio.currentTime + 0.4)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
        break
      case 'invalid':
        osc.type = 'square'
        osc.frequency.value = 150
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#6aaa64', '#c9b458', '#538d4e', '#b59f3b', '#85c0f9', '#f5793a']
  const confetti = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  )
}

export default function WordleGame() {
  const [gameMode, setGameMode] = useState<GameMode>('menu')
  const [targetWord, setTargetWord] = useState<string>('')
  const [guesses, setGuesses] = useState<GuessResult[][]>([])
  const [currentGuess, setCurrentGuess] = useState<string>('')
  const [keyboardStatus, setKeyboardStatus] = useState<Record<string, LetterStatus>>({})
  const [shake, setShake] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [revealRow, setRevealRow] = useState<number>(-1)
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(false)
  const [streak, setStreak] = useState<number>(0)
  const [stats, setStats] = useState({ played: 0, won: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0] })
  const [wasDaily, setWasDaily] = useState<boolean>(false)

  // Load saved data
  useEffect(() => {
    const savedStats = localStorage.getItem('wordle-stats')
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats))
      } catch {
        // Invalid data
      }
    }

    const dailyDate = localStorage.getItem('wordle-daily-date')
    const today = getDateString()
    if (dailyDate === today) {
      setDailyCompleted(true)
      const savedDaily = localStorage.getItem('wordle-daily-guesses')
      if (savedDaily) {
        try {
          const { guesses: savedGuesses, won } = JSON.parse(savedDaily)
          setGuesses(savedGuesses)
          setTargetWord(getDailyWord())
          if (won) {
            setGameMode('won')
          } else if (savedGuesses.length >= 6) {
            setGameMode('lost')
          }
        } catch {
          // Invalid data
        }
      }
    }

    const savedStreak = localStorage.getItem('wordle-streak')
    if (savedStreak) {
      setStreak(parseInt(savedStreak))
    }
  }, [])

  // Save stats
  useEffect(() => {
    localStorage.setItem('wordle-stats', JSON.stringify(stats))
  }, [stats])

  const startGame = (mode: 'daily' | 'practice') => {
    const word = mode === 'daily' ? getDailyWord() : getRandomWord()
    setTargetWord(word)
    setGuesses([])
    setCurrentGuess('')
    setKeyboardStatus({})
    setMessage('')
    setRevealRow(-1)
    setGameMode(mode)
    setWasDaily(mode === 'daily')
  }

  const updateKeyboardStatus = useCallback((results: GuessResult[]) => {
    setKeyboardStatus(prev => {
      const newStatus = { ...prev }
      for (const { letter, status } of results) {
        const current = newStatus[letter]
        // Priority: correct > present > absent
        if (status === 'correct') {
          newStatus[letter] = 'correct'
        } else if (status === 'present' && current !== 'correct') {
          newStatus[letter] = 'present'
        } else if (status === 'absent' && !current) {
          newStatus[letter] = 'absent'
        }
      }
      return newStatus
    })
  }, [])

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) {
      setShake(true)
      setMessage('Parola troppo corta!')
      playSound('invalid')
      setTimeout(() => {
        setShake(false)
        setMessage('')
      }, 1000)
      return
    }

    if (!VALID_GUESSES.has(currentGuess)) {
      setShake(true)
      setMessage('Parola non valida!')
      playSound('invalid')
      setTimeout(() => {
        setShake(false)
        setMessage('')
      }, 1000)
      return
    }

    playSound('submit')
    const result = evaluateGuess(currentGuess, targetWord)
    const newGuesses = [...guesses, result]
    setGuesses(newGuesses)
    setRevealRow(newGuesses.length - 1)
    updateKeyboardStatus(result)
    setCurrentGuess('')

    // Check win/lose
    const won = currentGuess === targetWord
    const lost = !won && newGuesses.length >= 6

    // Save daily progress
    if (gameMode === 'daily') {
      localStorage.setItem('wordle-daily-date', getDateString())
      localStorage.setItem('wordle-daily-guesses', JSON.stringify({ guesses: newGuesses, won }))
    }

    if (won) {
      setTimeout(() => {
        setShowConfetti(true)
        playSound('win')
        setGameMode('won')
        setMessage(['Geniale! 🧠', 'Magnifico! ✨', 'Impressionante! 🌟', 'Splendido! 💫', 'Grandioso! 🎯', 'Perfetto! 🎉'][newGuesses.length - 1])

        // Update stats
        setStats(prev => ({
          ...prev,
          played: prev.played + 1,
          won: prev.won + 1,
          currentStreak: prev.currentStreak + 1,
          maxStreak: Math.max(prev.maxStreak, prev.currentStreak + 1),
          distribution: prev.distribution.map((d, i) => i === newGuesses.length - 1 ? d + 1 : d)
        }))

        if (gameMode === 'daily') {
          setDailyCompleted(true)
          const newStreak = streak + 1
          setStreak(newStreak)
          localStorage.setItem('wordle-streak', newStreak.toString())
        }

        setTimeout(() => setShowConfetti(false), 3000)
      }, 1500)
    } else if (lost) {
      setTimeout(() => {
        playSound('lose')
        setGameMode('lost')
        setMessage(`La parola era: ${targetWord}`)

        // Update stats
        setStats(prev => ({
          ...prev,
          played: prev.played + 1,
          currentStreak: 0
        }))

        if (gameMode === 'daily') {
          setDailyCompleted(true)
          setStreak(0)
          localStorage.setItem('wordle-streak', '0')
        }
      }, 1500)
    }
  }, [currentGuess, targetWord, guesses, gameMode, streak, updateKeyboardStatus])

  const handleKeyPress = useCallback((key: string) => {
    if (gameMode === 'won' || gameMode === 'lost') return

    if (key === 'INVIO') {
      submitGuess()
    } else if (key === '⌫') {
      setCurrentGuess(prev => prev.slice(0, -1))
      playSound('key')
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key)
      playSound('key')
    }
  }, [gameMode, currentGuess, submitGuess])

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode === 'menu') return

      if (e.key === 'Enter') {
        e.preventDefault()
        handleKeyPress('INVIO')
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleKeyPress('⌫')
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault()
        handleKeyPress(e.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameMode, handleKeyPress])

  const getLetterColor = (status: LetterStatus) => {
    switch (status) {
      case 'correct': return 'bg-green-600 border-green-600 text-white'
      case 'present': return 'bg-yellow-500 border-yellow-500 text-white'
      case 'absent': return 'bg-gray-600 border-gray-600 text-white'
      default: return 'bg-transparent border-gray-400 text-gray-800'
    }
  }

  const getKeyColor = (letter: string) => {
    const status = keyboardStatus[letter]
    switch (status) {
      case 'correct': return 'bg-green-600 text-white border-green-600'
      case 'present': return 'bg-yellow-500 text-white border-yellow-500'
      case 'absent': return 'bg-gray-600 text-white border-gray-600'
      default: return 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300'
    }
  }

  // Menu Screen
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
        <Confetti active={showConfetti} />

        <Link
          href="/games/arcade/"
          className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-lg font-bold text-green-800 shadow-lg hover:scale-105 transition-all"
        >
          ← Giochi
        </Link>

        {/* Stats */}
        {streak > 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-lg font-bold text-white shadow-lg">
            🔥 {streak} giorni!
          </div>
        )}

        {/* Title */}
        <div className="mt-20 mb-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-2">
            🟩 Wordle
          </h1>
          <p className="text-xl text-green-200">
            Indovina la parola italiana!
          </p>
        </div>

        {/* Daily Challenge */}
        <button
          onClick={() => !dailyCompleted && startGame('daily')}
          disabled={dailyCompleted}
          className={`
            w-full max-w-md mb-6 p-6 rounded-2xl shadow-xl font-bold text-xl
            transition-all transform
            ${dailyCompleted
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-105 hover:shadow-2xl animate-pulse'
            }
          `}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <div>Sfida Giornaliera</div>
              <div className="text-sm opacity-80">
                {dailyCompleted ? '✅ Completata oggi!' : 'Nuova parola disponibile!'}
              </div>
            </div>
          </div>
        </button>

        {/* Practice Mode */}
        <button
          onClick={() => startGame('practice')}
          className="w-full max-w-md mb-8 p-6 rounded-2xl shadow-xl font-bold text-xl bg-white text-green-800 hover:scale-105 hover:shadow-2xl transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <div>Modalità Allenamento</div>
              <div className="text-sm opacity-60">Gioca quante volte vuoi!</div>
            </div>
          </div>
        </button>

        {/* Stats */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 text-center">📊 Statistiche</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-black text-white">{stats.played}</div>
              <div className="text-xs text-green-200">Giocate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white">
                {stats.played ? Math.round((stats.won / stats.played) * 100) : 0}%
              </div>
              <div className="text-xs text-green-200">Vittorie</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white">{stats.currentStreak}</div>
              <div className="text-xs text-green-200">Serie</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white">{stats.maxStreak}</div>
              <div className="text-xs text-green-200">Max Serie</div>
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-1">
            {stats.distribution.map((count, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-white w-4">{i + 1}</span>
                <div
                  className="bg-green-600 h-5 rounded transition-all"
                  style={{ width: `${Math.max(count / Math.max(...stats.distribution, 1) * 100, 5)}%` }}
                />
                <span className="text-white text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-6 max-w-md">
          <h3 className="font-bold text-white text-lg mb-3">Come si gioca:</h3>
          <ul className="text-green-200 text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">A</span>
              Lettera corretta nel posto giusto
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white font-bold text-xs">B</span>
              Lettera presente ma nel posto sbagliato
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white font-bold text-xs">C</span>
              Lettera non presente nella parola
            </li>
          </ul>
        </div>
      </div>
    )
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 flex flex-col items-center p-2 md:p-4">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-2 md:mb-4">
        <button
          onClick={() => setGameMode('menu')}
          className="bg-white/90 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-green-800 shadow-lg hover:scale-105 transition-all text-sm md:text-base"
        >
          ← Menu
        </button>

        <h1 className="text-xl md:text-2xl font-black text-white">
          {(gameMode === 'daily' || wasDaily) ? '📅 Sfida' : '🎯 Allenamento'}
        </h1>

        <div className="bg-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-white text-sm md:text-base">
          {guesses.length}/6
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`
          px-6 py-3 rounded-full font-bold mb-2 md:mb-4 shadow-lg text-white text-center
          ${gameMode === 'won' ? 'bg-green-600' : gameMode === 'lost' ? 'bg-red-600' : 'bg-yellow-600'}
        `}>
          {message}
        </div>
      )}

      {/* Game Board */}
      <div className="flex flex-col gap-1.5 md:gap-2 mb-4 md:mb-6">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length
          const guess = guesses[rowIndex]
          const isRevealing = rowIndex === revealRow

          return (
            <div
              key={rowIndex}
              className={`flex gap-1.5 md:gap-2 ${isCurrentRow && shake ? 'animate-shake' : ''}`}
            >
              {Array.from({ length: 5 }).map((_, colIndex) => {
                let letter = ''
                let status: LetterStatus = 'unused'

                if (guess) {
                  letter = guess[colIndex].letter
                  status = guess[colIndex].status
                } else if (isCurrentRow) {
                  letter = currentGuess[colIndex] || ''
                }

                return (
                  <div
                    key={colIndex}
                    className={`
                      w-12 h-12 md:w-14 md:h-14 border-2 rounded-lg
                      flex items-center justify-center
                      font-black text-xl md:text-2xl
                      transition-all duration-300
                      ${guess ? getLetterColor(status) : letter ? 'border-gray-500 bg-white/10 text-white' : 'border-gray-600 bg-white/5'}
                      ${isRevealing ? 'animate-flip' : ''}
                      ${isCurrentRow && letter ? 'scale-105' : ''}
                    `}
                    style={{
                      animationDelay: isRevealing ? `${colIndex * 0.2}s` : '0s'
                    }}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-lg px-1">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 md:gap-1.5 mb-1 md:mb-1.5">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                disabled={gameMode === 'won' || gameMode === 'lost'}
                className={`
                  ${key === 'INVIO' || key === '⌫' ? 'px-2 md:px-4 text-xs md:text-sm' : 'w-8 md:w-10 text-sm md:text-base'}
                  h-12 md:h-14 rounded-lg font-bold border-2
                  transition-all active:scale-95
                  ${getKeyColor(key)}
                  ${(gameMode === 'won' || gameMode === 'lost') ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                `}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Play Again button */}
      {(gameMode === 'won' || gameMode === 'lost') && (
        <button
          onClick={() => wasDaily ? setGameMode('menu') : startGame('practice')}
          className="mt-4 md:mt-6 px-8 py-4 bg-white text-green-800 font-bold text-lg rounded-full shadow-xl hover:scale-105 transition-all"
        >
          {wasDaily ? '← Torna al Menu' : '🔄 Gioca Ancora'}
        </button>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }

        @keyframes flip {
          0% { transform: rotateX(0); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0); }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-flip {
          animation: flip 0.5s ease-in-out forwards;
        }

        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
