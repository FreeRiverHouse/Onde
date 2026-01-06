import * as dotenv from 'dotenv';
import * as path from 'path';
import { TwitterApi } from 'twitter-api-v2';

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const XAI_API_KEY = process.env.XAI_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// FreeRiverHouse client
const frhClient = new TwitterApi({
  appKey: process.env.X_FREERIVERHOUSE_API_KEY!,
  appSecret: process.env.X_FREERIVERHOUSE_API_SECRET!,
  accessToken: process.env.X_FREERIVERHOUSE_ACCESS_TOKEN!,
  accessSecret: process.env.X_FREERIVERHOUSE_ACCESS_SECRET!,
});

// Onde client
const ondeClient = new TwitterApi({
  appKey: process.env.X_ONDE_API_KEY!,
  appSecret: process.env.X_ONDE_API_SECRET!,
  accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
  accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
});

interface AccountStats {
  name: string;
  handle: string;
  followers: number;
  following: number;
  tweets: number;
  recentTweets: {
    text: string;
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
    created: string;
  }[];
}

async function getAccountStats(client: TwitterApi, name: string): Promise<AccountStats> {
  try {
    const me = await client.v2.me({
      'user.fields': ['public_metrics', 'description', 'created_at'],
    });

    const metrics = me.data.public_metrics;

    // Get recent tweets
    const tweets = await client.v2.userTimeline(me.data.id, {
      max_results: 10,
      'tweet.fields': ['public_metrics', 'created_at'],
    });

    const recentTweets = tweets.data.data?.map(t => ({
      text: t.text.substring(0, 100) + (t.text.length > 100 ? '...' : ''),
      likes: t.public_metrics?.like_count || 0,
      retweets: t.public_metrics?.retweet_count || 0,
      replies: t.public_metrics?.reply_count || 0,
      impressions: t.public_metrics?.impression_count || 0,
      created: t.created_at || '',
    })) || [];

    return {
      name,
      handle: `@${me.data.username}`,
      followers: metrics?.followers_count || 0,
      following: metrics?.following_count || 0,
      tweets: metrics?.tweet_count || 0,
      recentTweets,
    };
  } catch (error: any) {
    console.error(`Error fetching ${name}:`, error.message);
    return {
      name,
      handle: 'unknown',
      followers: 0,
      following: 0,
      tweets: 0,
      recentTweets: [],
    };
  }
}

async function callGrok(prompt: string): Promise<string> {
  if (!XAI_API_KEY) {
    return 'Grok API non disponibile';
  }

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        {
          role: 'system',
          content: `Sei un esperto PR strategist per progetti tech/creativi.
Fornisci analisi pratiche e actionable. Rispondi in italiano, in modo conciso e diretto.`
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok error: ${error}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content || '';
}

async function generateReport() {
  console.log('📊 Generazione Report PR Onde...\n');

  // Fetch stats for both accounts
  console.log('Recupero statistiche...');
  const [frhStats, ondeStats] = await Promise.all([
    getAccountStats(frhClient, 'FreeRiverHouse'),
    getAccountStats(ondeClient, 'Onde'),
  ]);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    REPORT PR ONDE');
  console.log('                    ' + new Date().toLocaleDateString('it-IT'));
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Account Overview
  console.log('📱 PANORAMICA ACCOUNT\n');

  console.log(`@FreeRiverHouse (Account personale/aziendale)`);
  console.log(`   Followers: ${frhStats.followers}`);
  console.log(`   Following: ${frhStats.following}`);
  console.log(`   Tweet totali: ${frhStats.tweets}`);
  console.log('');

  console.log(`@Onde_FRH (Casa editrice)`);
  console.log(`   Followers: ${ondeStats.followers}`);
  console.log(`   Following: ${ondeStats.following}`);
  console.log(`   Tweet totali: ${ondeStats.tweets}`);
  console.log('');

  // Recent Activity
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📝 ATTIVITÀ RECENTE\n');

  console.log('@FreeRiverHouse - Ultimi post:');
  for (const tweet of frhStats.recentTweets.slice(0, 5)) {
    console.log(`   "${tweet.text}"`);
    console.log(`   ❤️ ${tweet.likes} | 🔄 ${tweet.retweets} | 💬 ${tweet.replies} | 👁️ ${tweet.impressions}`);
    console.log('');
  }

  console.log('@Onde_FRH - Ultimi post:');
  for (const tweet of ondeStats.recentTweets.slice(0, 5)) {
    console.log(`   "${tweet.text}"`);
    console.log(`   ❤️ ${tweet.likes} | 🔄 ${tweet.retweets} | 💬 ${tweet.replies} | 👁️ ${tweet.impressions}`);
    console.log('');
  }

  // Calculate engagement
  const totalImpressions = [...frhStats.recentTweets, ...ondeStats.recentTweets]
    .reduce((sum, t) => sum + t.impressions, 0);
  const totalEngagement = [...frhStats.recentTweets, ...ondeStats.recentTweets]
    .reduce((sum, t) => sum + t.likes + t.retweets + t.replies, 0);
  const engagementRate = totalImpressions > 0
    ? ((totalEngagement / totalImpressions) * 100).toFixed(2)
    : '0';

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📈 METRICHE AGGREGATE\n');
  console.log(`   Impressions totali (ultimi 10 post): ${totalImpressions.toLocaleString()}`);
  console.log(`   Engagement totale: ${totalEngagement}`);
  console.log(`   Engagement Rate: ${engagementRate}%`);
  console.log('');

  // Ask Grok for strategic analysis
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🤖 ANALISI STRATEGICA (powered by Grok)\n');

  const strategicPrompt = `Analizza questi dati e fornisci un piano PR strategico:

ACCOUNT:
1. @FreeRiverHouse - ${frhStats.followers} followers, ${frhStats.tweets} tweet totali
   Focus: personale/aziendale, building in public, tech + creatività

2. @Onde_FRH - ${ondeStats.followers} followers, ${ondeStats.tweets} tweet totali
   Focus: casa editrice digitale, tech + spiritualità + arte

ENGAGEMENT RECENTE:
- Impressions: ${totalImpressions}
- Engagement rate: ${engagementRate}%

PROGETTI IN CORSO:
- App Unity per bambini (KidsChefStudio, KidsMusicStudio, PizzaGelatoRush)
- Gioco VR (BusinessIsBusiness) per Meta Quest
- Trading bot (PolyRoborto)
- Sistema di publishing digitale (Onde)

RICHIESTA:
1. NICCHIE DA TARGETARE: Quali 3 nicchie specifiche dovremmo seguire e commentare?
2. STRATEGIA CONTENUTI: Che tipo di post funzionano meglio nel nostro spazio?
3. GROWTH HACKS: 3 azioni concrete per crescere organicamente
4. COMPETITOR ANALYSIS: Chi dovremmo studiare nel nostro spazio?
5. PIANO SETTIMANALE: Quanti post a settimana e che tipo?

Sii specifico e pratico.`;

  try {
    const analysis = await callGrok(strategicPrompt);
    console.log(analysis);
  } catch (error: any) {
    console.log(`Errore nell'analisi: ${error.message}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📌 PROSSIMI PASSI IMMEDIATI');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('1. Usa /ai sul bot Telegram per generare post sui progressi');
  console.log('2. Commenta 3-5 post rilevanti al giorno nelle nicchie target');
  console.log('3. Condividi screenshot del lavoro in corso (building in public)');
  console.log('4. Il report giornaliero arriverà alle 17:40 su Telegram');
  console.log('');
  console.log('Bot Telegram: @OndePR_bot');
  console.log('Comandi: /frh [post], /onde [post], /ai [contenuto], /report');
  console.log('');
}

generateReport().catch(console.error);
