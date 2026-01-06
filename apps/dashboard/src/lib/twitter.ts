'use server';

import { TwitterApi } from 'twitter-api-v2';

export interface TweetResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

export async function postTweet(content: string): Promise<TweetResult> {
  // Validate content
  if (!content || content.trim().length === 0) {
    return { success: false, error: 'Il contenuto del tweet non può essere vuoto' };
  }

  if (content.length > 280) {
    return { success: false, error: 'Il tweet supera i 280 caratteri' };
  }

  // Check for credentials
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return {
      success: false,
      error: 'Credenziali Twitter non configurate. Controlla le variabili ambiente.'
    };
  }

  try {
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });

    const result = await client.v2.tweet(content);

    return {
      success: true,
      tweetId: result.data.id,
      tweetUrl: `https://x.com/FreeRiverHouse/status/${result.data.id}`,
    };
  } catch (error: any) {
    console.error('Twitter API Error:', error);

    // Handle specific Twitter API errors
    if (error.code === 403) {
      return { success: false, error: 'Accesso negato. Verifica i permessi dell\'app Twitter.' };
    }
    if (error.code === 429) {
      return { success: false, error: 'Troppi tweet. Riprova tra qualche minuto.' };
    }
    if (error.code === 187) {
      return { success: false, error: 'Tweet duplicato. Hai già postato questo contenuto.' };
    }

    return {
      success: false,
      error: error.message || 'Errore durante la pubblicazione del tweet'
    };
  }
}

export async function verifyTwitterCredentials(): Promise<{ valid: boolean; username?: string; error?: string }> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return { valid: false, error: 'Credenziali non configurate' };
  }

  try {
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });

    const me = await client.v2.me();
    return { valid: true, username: me.data.username };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}
