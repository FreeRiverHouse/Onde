/**
 * X/Twitter Account Manager
 * Gestisce multipli account X/Twitter per diversi brand/agent
 */

import { createLogger } from '@onde/core';
import { XClient } from './client.js';
import type {
  XAccountCredentials,
  XManagerConfig,
  TweetResult,
  ThreadResult,
  PostTweetOptions,
  ScheduleTweetOptions,
  ScheduledTweet,
  MediaAttachment,
} from './types.js';

const logger = createLogger('x-manager');

/**
 * Manager per gestire multipli account X/Twitter
 *
 * @example
 * ```typescript
 * const manager = new XAccountManager({
 *   defaultAccountId: 'brand_main',
 *   accounts: [
 *     {
 *       accountId: 'brand_main',
 *       name: 'Brand Principale',
 *       apiKey: process.env.X_BRAND_MAIN_API_KEY!,
 *       apiSecret: process.env.X_BRAND_MAIN_API_SECRET!,
 *       accessToken: process.env.X_BRAND_MAIN_ACCESS_TOKEN!,
 *       accessTokenSecret: process.env.X_BRAND_MAIN_ACCESS_SECRET!,
 *     },
 *     {
 *       accountId: 'brand_it',
 *       name: 'Brand Italia',
 *       apiKey: process.env.X_BRAND_IT_API_KEY!,
 *       // ...
 *     },
 *   ],
 * });
 *
 * // Post su account specifico
 * await manager.postTweet('Ciao mondo!', 'brand_it');
 *
 * // Post su account default
 * await manager.postTweet('Hello world!');
 * ```
 */
export class XAccountManager {
  private clients: Map<string, XClient> = new Map();
  private defaultAccountId: string | undefined;
  private scheduledTweets: Map<string, ScheduledTweet> = new Map();

  constructor(config: XManagerConfig) {
    this.defaultAccountId = config.defaultAccountId;

    // Inizializza i client per ogni account
    for (const account of config.accounts) {
      this.addAccount(account);
    }

    // Imposta il default al primo account se non specificato
    if (!this.defaultAccountId && config.accounts.length > 0) {
      this.defaultAccountId = config.accounts[0].accountId;
    }

    logger.info('XAccountManager inizializzato', {
      accountCount: this.clients.size,
      defaultAccount: this.defaultAccountId,
    });
  }

  /**
   * Aggiunge un nuovo account al manager
   */
  addAccount(credentials: XAccountCredentials): void {
    if (this.clients.has(credentials.accountId)) {
      logger.warn('Account gia esistente, verra sovrascritto', { accountId: credentials.accountId });
    }

    const client = new XClient(credentials);
    this.clients.set(credentials.accountId, client);
    logger.info('Account aggiunto', { accountId: credentials.accountId, name: credentials.name });
  }

  /**
   * Rimuove un account dal manager
   */
  removeAccount(accountId: string): boolean {
    const removed = this.clients.delete(accountId);
    if (removed) {
      logger.info('Account rimosso', { accountId });
    }
    return removed;
  }

  /**
   * Ottiene un client per un account specifico
   */
  getClient(accountId?: string): XClient {
    const targetId = accountId || this.defaultAccountId;
    if (!targetId) {
      throw new Error('Nessun account specificato e nessun account default configurato');
    }

    const client = this.clients.get(targetId);
    if (!client) {
      throw new Error(`Account non trovato: ${targetId}`);
    }

    return client;
  }

  /**
   * Lista tutti gli account configurati
   */
  listAccounts(): Array<{ accountId: string; name: string }> {
    return Array.from(this.clients.values()).map(client => ({
      accountId: client.accountId,
      name: client.accountName,
    }));
  }

  /**
   * Verifica le credenziali di tutti gli account
   */
  async verifyAllAccounts(): Promise<Map<string, { valid: boolean; username?: string; error?: string }>> {
    const results = new Map<string, { valid: boolean; username?: string; error?: string }>();

    for (const [accountId, client] of this.clients) {
      try {
        const info = await client.verifyCredentials();
        results.set(accountId, { valid: true, username: info.username });
      } catch (error) {
        results.set(accountId, { valid: false, error: String(error) });
      }
    }

    return results;
  }

  // ============ Funzioni principali per posting ============

  /**
   * Pubblica un tweet su X/Twitter
   *
   * @param text - Testo del tweet (max 280 caratteri)
   * @param accountId - ID dell'account da usare (opzionale, usa default)
   * @returns Risultato del tweet pubblicato
   *
   * @example
   * ```typescript
   * // Su account default
   * const result = await manager.postTweet('Nuovo articolo sul blog!');
   *
   * // Su account specifico
   * const result = await manager.postTweet('Nuovo articolo!', 'brand_it');
   * ```
   */
  async postTweet(text: string, accountId?: string): Promise<TweetResult> {
    const client = this.getClient(accountId);
    logger.info('postTweet chiamato', { accountId: client.accountId, textLength: text.length });

    return client.postTweet({ text });
  }

  /**
   * Pubblica un tweet con opzioni avanzate
   *
   * @param options - Opzioni complete del tweet
   * @returns Risultato del tweet pubblicato
   */
  async postTweetAdvanced(options: PostTweetOptions): Promise<TweetResult> {
    const client = this.getClient(options.accountId);
    logger.info('postTweetAdvanced chiamato', {
      accountId: client.accountId,
      hasMedia: !!options.media?.length,
      hasPoll: !!options.poll,
    });

    return client.postTweet(options);
  }

  /**
   * Pubblica un thread di tweet collegati
   *
   * @param tweets - Array di testi per il thread
   * @param accountId - ID dell'account da usare (opzionale)
   * @returns Risultato del thread pubblicato
   *
   * @example
   * ```typescript
   * const thread = await manager.postThread([
   *   '1/ Ecco una guida completa su come usare le API di X...',
   *   '2/ Prima di tutto, devi creare un Developer Account...',
   *   '3/ Una volta ottenute le credenziali, puoi iniziare...',
   *   '4/ Fine del thread! Spero vi sia stato utile.',
   * ], 'brand_main');
   * ```
   */
  async postThread(tweets: string[], accountId?: string): Promise<ThreadResult> {
    if (tweets.length === 0) {
      throw new Error('Il thread deve contenere almeno un tweet');
    }

    const client = this.getClient(accountId);
    logger.info('postThread chiamato', { accountId: client.accountId, tweetCount: tweets.length });

    const results = await client.postThread(tweets);

    return {
      tweets: results,
      accountId: client.accountId,
      threadUrl: results[0]?.url || '',
    };
  }

  /**
   * Schedula un tweet per pubblicazione futura
   *
   * @param text - Testo del tweet
   * @param scheduledAt - Data e ora di pubblicazione
   * @param accountId - ID dell'account da usare (opzionale)
   * @returns ID dello scheduled tweet per tracking/cancellazione
   *
   * @example
   * ```typescript
   * // Schedula per domani alle 10:00
   * const tomorrow = new Date();
   * tomorrow.setDate(tomorrow.getDate() + 1);
   * tomorrow.setHours(10, 0, 0, 0);
   *
   * const scheduledId = await manager.scheduleTweet(
   *   'Buongiorno! Nuovo contenuto in arrivo.',
   *   tomorrow,
   *   'brand_main'
   * );
   * ```
   */
  async scheduleTweet(text: string, scheduledAt: Date, accountId?: string): Promise<string> {
    const targetAccountId = accountId || this.defaultAccountId;
    if (!targetAccountId) {
      throw new Error('Nessun account specificato');
    }

    // Verifica che l'account esista
    this.getClient(targetAccountId);

    const now = new Date();
    if (scheduledAt <= now) {
      throw new Error('La data di schedulazione deve essere nel futuro');
    }

    const scheduledId = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const delayMs = scheduledAt.getTime() - now.getTime();

    logger.info('Scheduling tweet', {
      scheduledId,
      accountId: targetAccountId,
      scheduledAt: scheduledAt.toISOString(),
      delayMs,
    });

    const scheduledTweet: ScheduledTweet = {
      id: scheduledId,
      options: {
        text,
        accountId: targetAccountId,
        scheduledAt,
      },
      status: 'pending',
    };

    // Imposta il timer
    scheduledTweet.timerId = setTimeout(async () => {
      await this.executeScheduledTweet(scheduledId);
    }, delayMs);

    this.scheduledTweets.set(scheduledId, scheduledTweet);

    return scheduledId;
  }

  /**
   * Schedula un tweet con opzioni avanzate
   */
  async scheduleTweetAdvanced(options: ScheduleTweetOptions): Promise<string> {
    const targetAccountId = options.accountId || this.defaultAccountId;
    if (!targetAccountId) {
      throw new Error('Nessun account specificato');
    }

    this.getClient(targetAccountId);

    const now = new Date();
    if (options.scheduledAt <= now) {
      throw new Error('La data di schedulazione deve essere nel futuro');
    }

    const scheduledId = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const delayMs = options.scheduledAt.getTime() - now.getTime();

    const scheduledTweet: ScheduledTweet = {
      id: scheduledId,
      options: { ...options, accountId: targetAccountId },
      status: 'pending',
    };

    scheduledTweet.timerId = setTimeout(async () => {
      await this.executeScheduledTweet(scheduledId);
    }, delayMs);

    this.scheduledTweets.set(scheduledId, scheduledTweet);

    logger.info('Tweet schedulato con opzioni avanzate', {
      scheduledId,
      accountId: targetAccountId,
      scheduledAt: options.scheduledAt.toISOString(),
    });

    return scheduledId;
  }

  /**
   * Cancella un tweet schedulato
   */
  cancelScheduledTweet(scheduledId: string): boolean {
    const scheduled = this.scheduledTweets.get(scheduledId);
    if (!scheduled) {
      return false;
    }

    if (scheduled.timerId) {
      clearTimeout(scheduled.timerId);
    }

    scheduled.status = 'cancelled';
    this.scheduledTweets.delete(scheduledId);

    logger.info('Tweet schedulato cancellato', { scheduledId });
    return true;
  }

  /**
   * Ottiene lo stato di un tweet schedulato
   */
  getScheduledTweetStatus(scheduledId: string): ScheduledTweet | undefined {
    return this.scheduledTweets.get(scheduledId);
  }

  /**
   * Lista tutti i tweet schedulati
   */
  listScheduledTweets(): ScheduledTweet[] {
    return Array.from(this.scheduledTweets.values());
  }

  /**
   * Pubblica un tweet con media allegato
   */
  async postTweetWithMedia(
    text: string,
    media: MediaAttachment[],
    accountId?: string
  ): Promise<TweetResult> {
    const client = this.getClient(accountId);
    logger.info('postTweetWithMedia chiamato', {
      accountId: client.accountId,
      mediaCount: media.length,
    });

    return client.postTweet({ text, media });
  }

  /**
   * Risponde a un tweet
   */
  async replyToTweet(text: string, replyToId: string, accountId?: string): Promise<TweetResult> {
    const client = this.getClient(accountId);
    logger.info('replyToTweet chiamato', {
      accountId: client.accountId,
      replyToId,
    });

    return client.postTweet({ text, replyToId });
  }

  /**
   * Quota un tweet
   */
  async quoteTweet(text: string, quoteTweetId: string, accountId?: string): Promise<TweetResult> {
    const client = this.getClient(accountId);
    logger.info('quoteTweet chiamato', {
      accountId: client.accountId,
      quoteTweetId,
    });

    return client.postTweet({ text, quoteTweetId });
  }

  /**
   * Elimina un tweet
   */
  async deleteTweet(tweetId: string, accountId?: string): Promise<boolean> {
    const client = this.getClient(accountId);
    return client.deleteTweet(tweetId);
  }

  /**
   * Ottiene le metriche di un tweet
   */
  async getTweetMetrics(tweetId: string, accountId?: string) {
    const client = this.getClient(accountId);
    return client.getTweetMetrics(tweetId);
  }

  // ============ Metodi privati ============

  private async executeScheduledTweet(scheduledId: string): Promise<void> {
    const scheduled = this.scheduledTweets.get(scheduledId);
    if (!scheduled || scheduled.status !== 'pending') {
      return;
    }

    logger.info('Esecuzione tweet schedulato', { scheduledId });

    try {
      const client = this.getClient(scheduled.options.accountId);
      const result = await client.postTweet(scheduled.options);

      scheduled.status = 'published';
      scheduled.result = result;

      logger.info('Tweet schedulato pubblicato', { scheduledId, tweetId: result.tweetId });
    } catch (error) {
      scheduled.status = 'failed';
      scheduled.error = String(error);

      logger.error('Errore pubblicazione tweet schedulato', { scheduledId, error });
    }
  }
}

/**
 * Crea un XAccountManager da variabili d'ambiente
 *
 * Supporta il pattern: X_{ACCOUNT_ID}_{CREDENTIAL}
 * Es: X_BRAND_MAIN_API_KEY, X_BRAND_MAIN_API_SECRET, etc.
 *
 * @param accountIds - Lista di ID account da caricare
 * @param defaultAccountId - ID dell'account default
 */
export function createManagerFromEnv(
  accountIds: string[],
  defaultAccountId?: string
): XAccountManager {
  const accounts: XAccountCredentials[] = [];

  for (const accountId of accountIds) {
    const prefix = `X_${accountId.toUpperCase().replace(/-/g, '_')}`;

    const apiKey = process.env[`${prefix}_API_KEY`];
    const apiSecret = process.env[`${prefix}_API_SECRET`];
    const accessToken = process.env[`${prefix}_ACCESS_TOKEN`];
    const accessTokenSecret = process.env[`${prefix}_ACCESS_SECRET`];
    const bearerToken = process.env[`${prefix}_BEARER_TOKEN`];

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      logger.warn(`Credenziali incomplete per account: ${accountId}, saltato`);
      continue;
    }

    accounts.push({
      accountId,
      name: process.env[`${prefix}_NAME`] || accountId,
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret,
      bearerToken,
    });
  }

  if (accounts.length === 0) {
    throw new Error('Nessun account X/Twitter configurato correttamente');
  }

  return new XAccountManager({
    accounts,
    defaultAccountId: defaultAccountId || accounts[0].accountId,
  });
}

/**
 * Crea un XAccountManager con un singolo account dalle variabili standard
 */
export function createSingleAccountManager(): XAccountManager {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    throw new Error('Credenziali Twitter/X mancanti nelle variabili d\'ambiente');
  }

  return new XAccountManager({
    defaultAccountId: 'default',
    accounts: [
      {
        accountId: 'default',
        name: 'Default Account',
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret,
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
      },
    ],
  });
}
