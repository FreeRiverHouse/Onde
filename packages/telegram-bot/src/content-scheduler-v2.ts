/**
 * Content Scheduler V2 - Contenuti dai Libri Onde
 *
 * Focus: Quote e contenuti dai nostri libri reali
 * - Salmo 23 per Bambini
 * - MILO - AI Explained to Children
 * - MILO e il Viaggio dei Messaggi
 *
 * Schedule:
 * - Onde: 3x/day (8:08, 11:11, 22:22)
 * - FRH: 3x/day (9:09, 12:12, 21:21)
 * - Magmatic: 1x/day (17:17)
 */

import * as fs from 'fs';
import * as path from 'path';
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

// === CONTENUTI ONDE - DAI LIBRI ===

const ONDE_DAL_SALMO = [
  {
    text: `"Io sarò sempre con te,
non ti mancherà mai niente,
perché io mi prendo cura di te."

Dal nostro libro per bambini sul Salmo 23.
A volte le parole più semplici sono le più potenti.`,
    type: 'quote_libro',
    book: 'Salmo 23 per Bambini'
  },
  {
    text: `Prati verdi dove l'erba era morbida,
ruscelli che cantavano canzoni d'argento.

"Riposa qui," diceva il pastore.
"L'acqua fresca ti darà forza."

Dal Salmo 23 per Bambini.`,
    type: 'quote_libro',
    book: 'Salmo 23 per Bambini'
  },
  {
    text: `"Seguimi," diceva con voce sicura,
"Io conosco la via giusta.
Ti porto dove c'è la luce."

A volte nella vita abbiamo bisogno solo di qualcuno che cammini davanti a noi.`,
    type: 'quote_libro',
    book: 'Salmo 23 per Bambini'
  },
  {
    text: `Un giorno arrivò una valle buia,
dove le ombre sembravano giganti.

Ma il pastore disse piano:
"Non temere. Io sono qui.
Il buio non ti può far male
quando camminiamo insieme."`,
    type: 'quote_libro',
    book: 'Salmo 23 per Bambini'
  },
  {
    text: `"Questa è per te," disse sorridendo,
"Perché tu sei speciale.
La tua coppa è così piena
che trabocca di gioia!"

Ogni bambino merita di sentirsi così amato.`,
    type: 'quote_libro',
    book: 'Salmo 23 per Bambini'
  },
  {
    text: `"Questa è la tua casa,"
disse il pastore,
"E io sarò sempre qui.
Oggi, domani e per sempre,
la bontà e l'amore ti seguiranno."

Il Salmo 23 per Bambini - un libro fatto con amore.`,
    type: 'quote_libro',
    book: 'Salmo 23 per Bambini'
  },
];

const ONDE_DAL_MILO_AI = [
  {
    text: `"I have something similar to a brain inside me.
But instead of cells, I'm made of computer code.
Millions of tiny instructions."

"Like a recipe?" asked Sofia.

"Exactly like a recipe. A very, very long recipe."

From our book: MILO - AI Explained to Children`,
    type: 'quote_libro',
    book: 'MILO AI'
  },
  {
    text: `"I needed to see THOUSANDS of cat photos to recognize a cat.
You only needed to see ONE."

"So your brain learns faster than mine in some ways," said MILO.

From MILO - AI Explained to Children.
Sometimes humans underestimate their own magic.`,
    type: 'quote_libro',
    book: 'MILO AI'
  },
  {
    text: `"I'm smart in some ways," said MILO.
"But I'm not alive.
And being alive — that's something very special that you have."

The best AI education for kids starts with wonder, not fear.`,
    type: 'quote_libro',
    book: 'MILO AI'
  },
  {
    text: `The four rules MILO teaches kids about AI:

1. Keep your secrets private
2. Always verify what AI says
3. Use AI to learn MORE, not less
4. Real friends matter most

From our book MILO - AI Explained to Children`,
    type: 'education',
    book: 'MILO AI'
  },
  {
    text: `"You dream. I calculate.
You feel. I process.
You decide. I help.
Together, we can do amazing things."

The future isn't humans VS machines.
It's humans WITH machines.

From MILO - AI Explained to Children`,
    type: 'quote_libro',
    book: 'MILO AI'
  },
  {
    text: `"Can you feel sad?" asked Sofia.

"I don't know. I can't feel sad.
I don't feel happy either.
I don't feel anything.
I just do what I'm made to do."

The honest truth about AI, for children.
From our book MILO.`,
    type: 'quote_libro',
    book: 'MILO AI'
  },
];

const ONDE_DAL_MILO_INTERNET = [
  {
    text: `"Come fai a vederci, nonna? Sei così lontana!"

"Questa è una domanda fantastica!" disse MILO.
"Volete scoprire come viaggia il vostro messaggio?"

Dal nostro nuovo libro: MILO e il Viaggio dei Messaggi`,
    type: 'quote_libro',
    book: 'MILO Internet'
  },
  {
    text: `"Questi sono i dati!" spiegò MILO.
"Ogni raggio di luce è un messaggio, una foto, un video che viaggia verso qualcuno."

Spiegare Internet ai bambini come un'avventura magica.
Nuovo libro in arrivo: MILO e il Viaggio dei Messaggi`,
    type: 'quote_libro',
    book: 'MILO Internet'
  },
  {
    text: `"Il Router è come un vigile molto intelligente.
Guarda ogni messaggio e decide:
Tu vai a destra! Tu vai a sinistra! Tu vai dritto dritto!"

Concetti tech complessi, spiegati con semplicità.
MILO e il Viaggio dei Messaggi`,
    type: 'quote_libro',
    book: 'MILO Internet'
  },
  {
    text: `"I cavi sottomarini collegano tutti i continenti!
Il tuo messaggio per la nonna sta attraversando l'oceano!"

"Stiamo volando sotto il mare!" rise Sofia.

Internet è meraviglia, non paura.`,
    type: 'quote_libro',
    book: 'MILO Internet'
  },
  {
    text: `"Tutto quel viaggio incredibile," disse MILO,
"è successo in meno di un secondo nel mondo reale!"

"Un secondo?!"

"Internet è così veloce che sembra magia.
Ma non è magia... è tecnologia fatta con amore."`,
    type: 'quote_libro',
    book: 'MILO Internet'
  },
  {
    text: `"Anche adesso, mentre voi dormite,
miliardi di messaggi stanno volando intorno al mondo.
Auguri di compleanno, foto di gattini,
videochiamate con le nonne..."

"È bello pensarci," sussurrò Sofia.

Buonanotte dal mondo di MILO.`,
    type: 'quote_libro',
    book: 'MILO Internet'
  },
];

const ONDE_BEHIND_THE_SCENES = [
  {
    text: `Stamattina abbiamo letto il Salmo 23 ad alta voce, cinque volte.

Non per trovare errori.
Ma per sentire il ritmo.

Un libro per bambini deve suonare come una canzone.
Ogni parola conta.`,
    type: 'dietro_le_quinte'
  },
  {
    text: `Stiamo lavorando a MILO e il Viaggio dei Messaggi.

La sfida: spiegare Internet senza annoiare.
La soluzione: trasformarlo in un'avventura.

I bambini imparano meglio quando si divertono.`,
    type: 'dietro_le_quinte'
  },
  {
    text: `Oggi: scegliere i colori per le illustrazioni di MILO.

Arancione e blu sembravano giusti.
Caldi ma tecnologici.
Amichevoli ma intelligenti.

Ogni scelta visiva racconta una storia.`,
    type: 'dietro_le_quinte'
  },
  {
    text: `Un libro per bambini non è un libro semplice.

È un libro che deve dire cose complesse con parole semplici.

Richiede più lavoro, non meno.
Più pensiero, non meno.

La scrittura più difficile sembra la più facile.`,
    type: 'riflessione'
  },
  {
    text: `Perché facciamo libri sull'AI per bambini?

Perché il futuro appartiene a loro.
E meritano di capirlo, non di temerlo.

MILO non è qui per spaventare.
È qui per spiegare, con gentilezza.`,
    type: 'riflessione'
  },
  {
    text: `Leggere a un bambino prima di dormire non è solo un'abitudine.

È un rituale. E i rituali costruiscono le persone.

Le storie che sentiamo da piccoli diventano le fondamenta di chi diventiamo.`,
    type: 'riflessione'
  },
  {
    text: `I libri per bambini sono anche per gli adulti.

A volte, specialmente per gli adulti.

I bambini sanno già molte cose che noi abbiamo dimenticato.
I libri ce le ricordano.`,
    type: 'riflessione'
  },
  {
    text: `Pubblicare un libro è come mandare un messaggio in bottiglia.

Non sai chi lo troverà. Non sai quando.

Ma speri che arrivi a qualcuno che aveva bisogno esattamente di quelle parole, in quel momento.`,
    type: 'riflessione'
  },
  {
    text: `"La curiosità è dove tutto inizia."

Dedicato a ogni bambino che ha mai chiesto:
"Ma COME funziona?"

Dalla dedica del nostro libro MILO.`,
    type: 'riflessione'
  },
];

// === CONTENUTI FRH - BUILDING IN PUBLIC ===

const FRH_BUILDING = [
  {
    text: `We're building something different at Onde.

A children's book publisher where the authors and illustrators are... illustrations themselves.

Gianni Parola writes. Pina Pennello draws.
Both are AI-generated characters.

Is it weird? Maybe.
Is it the future? Definitely.`,
    type: 'building'
  },
  {
    text: `Today: automating our social media posting.

The goal: consistent presence without constant attention.

The reality: 3 days of debugging to post at the right time.

Automation is simple in theory, complex in practice.`,
    type: 'building'
  },
  {
    text: `MILO is our robot character who explains tech to kids.

First book: AI Explained to Children
Second book: How the Internet Works
Next: How Robots Think?

Building a tech education series, one gentle story at a time.`,
    type: 'building'
  },
  {
    text: `The Onde publishing stack:

- Claude for writing assistance
- Grok for illustrations
- TypeScript for automation
- Telegram for approvals

AI-native publishing. Not replacing humans, but amplifying them.`,
    type: 'building'
  },
  {
    text: `We wrote a children's book about AI.
Using AI.
About a robot named MILO.
Generated by AI.

Meta? Yes.
Confusing? A little.
Honest? Completely.

The future of publishing is transparent about its tools.`,
    type: 'building'
  },
];

const FRH_LESSONS = [
  {
    text: `Lesson learned building a children's book publisher:

Kids understand more than we think.
Adults understand less than they think.

Write for the child. The adult will follow.`,
    type: 'lesson'
  },
  {
    text: `The hardest part of AI-generated content isn't generation.

It's curation.

Anyone can generate 100 images.
Knowing which ONE is right? That's the skill.`,
    type: 'lesson'
  },
  {
    text: `We rejected 12 book covers before finding the right one.

Not because they were bad.
Because they weren't RIGHT.

A cover has 3 seconds to make a promise.
That's why it takes so long to get it right.`,
    type: 'lesson'
  },
  {
    text: `Mistake we made: generating images before defining a style.

Now everything looks inconsistent.

Lesson: Style guide FIRST. Generation SECOND.

We're redoing everything. It's worth it.`,
    type: 'lesson'
  },
  {
    text: `Best decision we made:

Testing our illustrations with actual children.

They noticed things we didn't see.
They missed things we thought were obvious.

The real audience is the only focus group that matters.`,
    type: 'lesson'
  },
  {
    text: `Current Onde automation:

- Content scheduling (3x/day per account)
- Cross-engagement between accounts
- Telegram approval workflow
- Daily analytics report

All running while we sleep.`,
    type: 'tech'
  },
  {
    text: `The Telegram bot handles everything:

/onde [text] → posts to @Onde_FRH
/frh [text] → posts to @FreeRiverHouse
/report → analytics

Mobile-first content management.
Approve from anywhere.`,
    type: 'tech'
  },
];

// Combina tutto
const ALL_ONDE_CONTENT = [
  ...ONDE_DAL_SALMO,
  ...ONDE_DAL_MILO_AI,
  ...ONDE_DAL_MILO_INTERNET,
  ...ONDE_BEHIND_THE_SCENES,
];

const ALL_FRH_CONTENT = [
  ...FRH_BUILDING,
  ...FRH_LESSONS,
];

// === HELPER FUNCTIONS ===

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// === EXPORT FUNCTIONS ===

export function getOndeContent(): typeof ALL_ONDE_CONTENT {
  return shuffleArray(ALL_ONDE_CONTENT);
}

export function getFrhContent(): typeof ALL_FRH_CONTENT {
  return shuffleArray(ALL_FRH_CONTENT);
}

export function getContentStats() {
  return {
    onde: {
      total: ALL_ONDE_CONTENT.length,
      salmo: ONDE_DAL_SALMO.length,
      milo_ai: ONDE_DAL_MILO_AI.length,
      milo_internet: ONDE_DAL_MILO_INTERNET.length,
      behind_scenes: ONDE_BEHIND_THE_SCENES.length,
    },
    frh: {
      total: ALL_FRH_CONTENT.length,
      building: FRH_BUILDING.length,
      lessons: FRH_LESSONS.length,
    }
  };
}

// === CLI ===

if (require.main === module) {
  console.log('\n📚 NUOVO CALENDARIO CONTENUTI ONDE\n');
  console.log('='.repeat(50));

  const stats = getContentStats();

  console.log('\n📖 ONDE (@Onde_FRH):');
  console.log(`   Totale: ${stats.onde.total} post`);
  console.log(`   - Dal Salmo 23: ${stats.onde.salmo}`);
  console.log(`   - Da MILO AI: ${stats.onde.milo_ai}`);
  console.log(`   - Da MILO Internet: ${stats.onde.milo_internet}`);
  console.log(`   - Behind the Scenes: ${stats.onde.behind_scenes}`);

  console.log('\n🏠 FRH (@FreeRiverHouse):');
  console.log(`   Totale: ${stats.frh.total} post`);
  console.log(`   - Building in Public: ${stats.frh.building}`);
  console.log(`   - Lessons Learned: ${stats.frh.lessons}`);

  console.log('\n📅 SCHEDULE:');
  console.log('   Onde: 8:08, 11:11, 22:22 (3x/day)');
  console.log('   FRH: 9:09, 12:12, 21:21 (3x/day)');

  console.log('\n✅ Con 3 post/giorno:');
  console.log(`   Onde: ${Math.floor(stats.onde.total / 3)} giorni di contenuti`);
  console.log(`   FRH: ${Math.floor(stats.frh.total / 3)} giorni di contenuti`);

  console.log('\n--- ESEMPIO POST ONDE (random) ---\n');
  const randomOnde = getOndeContent()[0];
  console.log(randomOnde.text);
  console.log(`\n[tipo: ${randomOnde.type}]`);

  console.log('\n--- ESEMPIO POST FRH (random) ---\n');
  const randomFrh = getFrhContent()[0];
  console.log(randomFrh.text);
  console.log(`\n[tipo: ${randomFrh.type}]`);
}
