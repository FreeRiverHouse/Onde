/**
 * Twitter/X Client
 * Client wrapper per twitter-api-v2 con gestione semplificata
 */

import { TwitterApi, type TweetV2PostTweetResult } from 'twitter-api-v2';
import { createLogger } from '@onde/core';
import * as fs from 'fs';
import * as path from 'path';
import type {
  XAccountCredentials,
  TweetResult,
  PostTweetOptions,
  MediaAttachment,
  MediaUploadResult,
  TweetMetrics,
} from './types.js';

const logger = createLogger('x-client');

/**
 * Client per interagire con un singolo account X/Twitter
 */
export class XClient {
  private client: TwitterApi;
  private credentials: XAccountCredentials;

  constructor(credentials: XAccountCredentials) {
    this.credentials = credentials;

    // Client con OAuth 1.0a per operazioni read/write
    this.client = new TwitterApi({
      appKey: credentials.apiKey,
      appSecret: credentials.apiSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentials.accessTokenSecret,
    });

    logger.info(`XClient inizializzato per account: ${credentials.accountId}`);
  }

  /**
   * Ottiene l'ID dell'account
   */
  get accountId(): string {
    return this.credentials.accountId;
  }

  /**
   * Ottiene il nome dell'account
   */
  get accountName(): string {
    return this.credentials.name;
  }

  /**
   * Verifica le credenziali dell'account
   */
  async verifyCredentials(): Promise<{ id: string; username: string; name: string }> {
    try {
      const me = await this.client.v2.me();
      logger.info(`Credenziali verificate per @${me.data.username}`);
      return {
        id: me.data.id,
        username: me.data.username,
        name: me.data.name,
      };
    } catch (error) {
      logger.error('Errore verifica credenziali', { error });
      throw new Error(`Impossibile verificare credenziali per ${this.credentials.accountId}: ${error}`);
    }
  }

  /**
   * Pubblica un tweet
   */
  async postTweet(options: Omit<PostTweetOptions, 'accountId'>): Promise<TweetResult> {
    logger.info('Pubblicazione tweet', { textLength: options.text.length });

    try {
      // Prepara i parametri del tweet
      const tweetParams: Parameters<typeof this.client.v2.tweet>[0] = {
        text: options.text,
      };

      let uploadedMediaIds: string[] | undefined;

      // Gestione reply
      if (options.replyToId) {
        tweetParams.reply = {
          in_reply_to_tweet_id: options.replyToId,
        };
      }

      // Gestione quote tweet
      if (options.quoteTweetId) {
        tweetParams.quote_tweet_id = options.quoteTweetId;
      }

      // Gestione media
      if (options.media && options.media.length > 0) {
        uploadedMediaIds = await this.uploadMedia(options.media);
        // Cast per compatibilita' con il tipo richiesto dall'API
        const mediaIdsTuple = uploadedMediaIds.slice(0, 4) as [string] | [string, string] | [string, string, string] | [string, string, string, string];
        tweetParams.media = {
          media_ids: mediaIdsTuple,
        };
      }

      // Gestione poll
      if (options.poll && options.poll.options.length >= 2 && options.poll.options.length <= 4) {
        const pollOptions = options.poll.options.slice(0, 4) as [string, string] | [string, string, string] | [string, string, string, string];
        tweetParams.poll = {
          options: pollOptions,
          duration_minutes: options.poll.durationMinutes,
        };
      }

      // Pubblica il tweet
      const result: TweetV2PostTweetResult = await this.client.v2.tweet(tweetParams);

      const tweetResult: TweetResult = {
        tweetId: result.data.id,
        text: result.data.text,
        url: `https://x.com/i/web/status/${result.data.id}`,
        accountId: this.credentials.accountId,
        publishedAt: new Date(),
        mediaIds: uploadedMediaIds,
      };

      logger.info('Tweet pubblicato con successo', { tweetId: tweetResult.tweetId });
      return tweetResult;
    } catch (error) {
      logger.error('Errore pubblicazione tweet', { error });
      throw error;
    }
  }

  /**
   * Pubblica un thread (serie di tweet collegati)
   */
  async postThread(tweets: string[]): Promise<TweetResult[]> {
    if (tweets.length === 0) {
      throw new Error('Il thread deve contenere almeno un tweet');
    }

    logger.info('Pubblicazione thread', { tweetCount: tweets.length });

    const results: TweetResult[] = [];
    let previousTweetId: string | undefined;

    for (let i = 0; i < tweets.length; i++) {
      const tweetText = tweets[i];

      const result = await this.postTweet({
        text: tweetText,
        replyToId: previousTweetId,
      });

      results.push(result);
      previousTweetId = result.tweetId;

      // Piccola pausa tra i tweet per evitare rate limiting
      if (i < tweets.length - 1) {
        await this.delay(1000);
      }
    }

    logger.info('Thread pubblicato con successo', {
      tweetCount: results.length,
      threadUrl: results[0]?.url,
    });

    return results;
  }

  /**
   * Carica media su Twitter
   */
  async uploadMedia(media: MediaAttachment[]): Promise<string[]> {
    const mediaIds: string[] = [];

    for (const item of media) {
      const result = await this.uploadSingleMedia(item);
      mediaIds.push(result.mediaId);
    }

    return mediaIds;
  }

  /**
   * Carica un singolo file media
   */
  async uploadSingleMedia(media: MediaAttachment): Promise<MediaUploadResult> {
    logger.info('Upload media', { source: media.source, type: media.type });

    try {
      let mediaId: string;
      let size: number;

      // Determina se e' un file locale o un URL
      if (media.source.startsWith('http://') || media.source.startsWith('https://')) {
        // Upload da URL
        const response = await fetch(media.source);
        const buffer = Buffer.from(await response.arrayBuffer());
        size = buffer.length;

        mediaId = await this.client.v1.uploadMedia(buffer, {
          mimeType: this.getMimeType(media.type),
        });
      } else {
        // Upload da file locale
        const filePath = path.resolve(media.source);
        const stats = fs.statSync(filePath);
        size = stats.size;

        mediaId = await this.client.v1.uploadMedia(filePath);
      }

      // Imposta alt text se fornito
      if (media.altText) {
        await this.client.v1.createMediaMetadata(mediaId, {
          alt_text: { text: media.altText },
        });
      }

      logger.info('Media caricato con successo', { mediaId, size });

      return {
        mediaId,
        type: media.type,
        size,
      };
    } catch (error) {
      logger.error('Errore upload media', { error, source: media.source });
      throw error;
    }
  }

  /**
   * Ottiene le metriche di un tweet
   */
  async getTweetMetrics(tweetId: string): Promise<TweetMetrics> {
    logger.info('Recupero metriche tweet', { tweetId });

    try {
      const tweet = await this.client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'non_public_metrics', 'organic_metrics'],
      });

      const metrics = tweet.data.public_metrics;

      return {
        likes: metrics?.like_count ?? 0,
        retweets: metrics?.retweet_count ?? 0,
        replies: metrics?.reply_count ?? 0,
        quotes: metrics?.quote_count ?? 0,
        impressions: (tweet.data as unknown as { non_public_metrics?: { impression_count?: number } }).non_public_metrics?.impression_count ?? 0,
        profileClicks: (tweet.data as unknown as { non_public_metrics?: { user_profile_clicks?: number } }).non_public_metrics?.user_profile_clicks ?? 0,
        linkClicks: (tweet.data as unknown as { non_public_metrics?: { url_link_clicks?: number } }).non_public_metrics?.url_link_clicks ?? 0,
      };
    } catch (error) {
      logger.error('Errore recupero metriche', { error, tweetId });
      throw error;
    }
  }

  /**
   * Elimina un tweet
   */
  async deleteTweet(tweetId: string): Promise<boolean> {
    logger.info('Eliminazione tweet', { tweetId });

    try {
      const result = await this.client.v2.deleteTweet(tweetId);
      logger.info('Tweet eliminato', { tweetId, deleted: result.data.deleted });
      return result.data.deleted;
    } catch (error) {
      logger.error('Errore eliminazione tweet', { error, tweetId });
      throw error;
    }
  }

  /**
   * Ottiene il rate limit status
   */
  async getRateLimitStatus(): Promise<{
    remaining: number;
    limit: number;
    resetAt: Date;
  }> {
    // I rate limits sono inclusi nelle risposte delle API
    // Questo e' un metodo placeholder - nella pratica si legge dagli header
    return {
      remaining: 300,
      limit: 300,
      resetAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  // Helper: determina il MIME type dal tipo di media
  private getMimeType(type: 'image' | 'gif' | 'video'): string {
    switch (type) {
      case 'image':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'video':
        return 'video/mp4';
      default:
        return 'application/octet-stream';
    }
  }

  // Helper: delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
