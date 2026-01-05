/**
 * Twitter/X Integration Types
 * Tipi per l'integrazione con X/Twitter API v2
 */

/**
 * Credenziali per un account X/Twitter
 */
export interface XAccountCredentials {
  /** Identificativo unico dell'account (es: 'brand_main', 'brand_it', 'personal') */
  accountId: string;
  /** Nome descrittivo dell'account */
  name: string;
  /** API Key (Consumer Key) dal Developer Portal */
  apiKey: string;
  /** API Secret (Consumer Secret) dal Developer Portal */
  apiSecret: string;
  /** Access Token per l'account */
  accessToken: string;
  /** Access Token Secret per l'account */
  accessTokenSecret: string;
  /** Bearer Token (opzionale, per alcune API read-only) */
  bearerToken?: string;
}

/**
 * Configurazione per il manager multi-account
 */
export interface XManagerConfig {
  /** Account di default da usare se non specificato */
  defaultAccountId?: string;
  /** Lista di account configurati */
  accounts: XAccountCredentials[];
}

/**
 * Risultato del posting di un tweet
 */
export interface TweetResult {
  /** ID del tweet su X */
  tweetId: string;
  /** Testo del tweet pubblicato */
  text: string;
  /** URL diretto al tweet */
  url: string;
  /** Account usato per il posting */
  accountId: string;
  /** Data di pubblicazione */
  publishedAt: Date;
  /** ID dei media allegati (se presenti) */
  mediaIds?: string[];
}

/**
 * Risultato del posting di un thread
 */
export interface ThreadResult {
  /** Lista di tweet nel thread */
  tweets: TweetResult[];
  /** Account usato per il posting */
  accountId: string;
  /** URL del primo tweet (head del thread) */
  threadUrl: string;
}

/**
 * Opzioni per il posting di un tweet
 */
export interface PostTweetOptions {
  /** Testo del tweet (max 280 caratteri) */
  text: string;
  /** ID dell'account da usare (usa default se non specificato) */
  accountId?: string;
  /** ID del tweet a cui rispondere */
  replyToId?: string;
  /** ID del tweet da quotare */
  quoteTweetId?: string;
  /** Paths o URLs dei media da allegare */
  media?: MediaAttachment[];
  /** Poll/sondaggio da includere */
  poll?: PollOptions;
}

/**
 * Media da allegare a un tweet
 */
export interface MediaAttachment {
  /** Path locale o URL del file */
  source: string;
  /** Tipo di media */
  type: 'image' | 'gif' | 'video';
  /** Alt text per accessibilita' */
  altText?: string;
}

/**
 * Opzioni per un sondaggio
 */
export interface PollOptions {
  /** Opzioni del sondaggio (2-4 opzioni) */
  options: string[];
  /** Durata in minuti (min 5, max 10080 = 7 giorni) */
  durationMinutes: number;
}

/**
 * Opzioni per schedulare un tweet
 */
export interface ScheduleTweetOptions extends PostTweetOptions {
  /** Data e ora di pubblicazione programmata */
  scheduledAt: Date;
}

/**
 * Tweet schedulato in memoria (per gestione locale)
 */
export interface ScheduledTweet {
  /** ID interno dello scheduled tweet */
  id: string;
  /** Opzioni del tweet */
  options: ScheduleTweetOptions;
  /** Status della schedulazione */
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  /** Timer reference per cancellazione */
  timerId?: NodeJS.Timeout;
  /** Errore se fallito */
  error?: string;
  /** Risultato se pubblicato */
  result?: TweetResult;
}

/**
 * Risultato upload media
 */
export interface MediaUploadResult {
  /** Media ID da usare nel tweet */
  mediaId: string;
  /** Tipo del media */
  type: 'image' | 'gif' | 'video';
  /** Dimensioni in bytes */
  size: number;
}

/**
 * Metriche di un tweet
 */
export interface TweetMetrics {
  /** Numero di like */
  likes: number;
  /** Numero di retweet */
  retweets: number;
  /** Numero di risposte */
  replies: number;
  /** Numero di quote tweet */
  quotes: number;
  /** Numero di impressioni */
  impressions: number;
  /** Numero di click sul profilo */
  profileClicks: number;
  /** Numero di click sui link */
  linkClicks: number;
}
