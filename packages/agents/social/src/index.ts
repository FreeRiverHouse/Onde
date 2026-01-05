/**
 * @onde/agent-social
 * AI Social Agent - X/Twitter posting and engagement
 */

import { createLogger, type SocialPost, type PostMetrics, type Campaign } from '@onde/core';
import {
  XAccountManager,
  createSingleAccountManager,
  createManagerFromEnv,
  type XAccountCredentials,
  type TweetResult,
  type ThreadResult,
  type PostTweetOptions,
  type ScheduleTweetOptions,
  type MediaAttachment,
} from './twitter/index.js';

const logger = createLogger('agent-social');

// ============ Re-export Twitter module ============
export * from './twitter/index.js';

// ============ Agent Types ============

export interface TweetDraft {
  content: string;
  mediaUrls?: string[];
  replyToId?: string;
  quoteTweetId?: string;
  scheduledAt?: Date;
}

export interface ThreadDraft {
  tweets: TweetDraft[];
  topic: string;
}

export interface EngagementStrategy {
  postingFrequency: number; // posts per day
  optimalTimes: string[];
  hashtags: string[];
  mentionStrategy: string;
  replyGuidelines: string[];
}

export interface AudienceAnalysis {
  demographics: {
    interests: string[];
    locations: string[];
    activeHours: number[];
  };
  engagement: {
    avgLikes: number;
    avgRetweets: number;
    avgReplies: number;
    topPerformingTopics: string[];
  };
  growth: {
    followersGained: number;
    followersLost: number;
    netGrowth: number;
  };
}

export interface SocialAgentConfig {
  /** OpenAI API key per generazione contenuti */
  apiKey: string;
  /** Modello AI da usare (default: gpt-4) */
  model?: string;
  /** Configurazione Twitter singolo account (legacy) */
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessSecret: string;
  };
  /** Manager X/Twitter pre-configurato */
  xManager?: XAccountManager;
  /** Lista di account X da configurare automaticamente */
  xAccounts?: XAccountCredentials[];
  /** Account X di default */
  defaultXAccount?: string;
}

/**
 * Social Agent - Gestisce posting e engagement sui social media
 *
 * @example
 * ```typescript
 * // Configurazione semplice (singolo account)
 * const agent = new SocialAgent({
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   twitter: {
 *     apiKey: process.env.TWITTER_API_KEY!,
 *     apiSecret: process.env.TWITTER_API_SECRET!,
 *     accessToken: process.env.TWITTER_ACCESS_TOKEN!,
 *     accessSecret: process.env.TWITTER_ACCESS_SECRET!,
 *   },
 * });
 *
 * // Configurazione multi-account
 * const agent = new SocialAgent({
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   xAccounts: [
 *     {
 *       accountId: 'brand_main',
 *       name: 'Brand Principale',
 *       apiKey: process.env.X_BRAND_MAIN_API_KEY!,
 *       apiSecret: process.env.X_BRAND_MAIN_API_SECRET!,
 *       accessToken: process.env.X_BRAND_MAIN_ACCESS_TOKEN!,
 *       accessTokenSecret: process.env.X_BRAND_MAIN_ACCESS_SECRET!,
 *     },
 *   ],
 *   defaultXAccount: 'brand_main',
 * });
 *
 * // Pubblica tweet
 * await agent.postTweet('Ciao mondo!', 'brand_main');
 * ```
 */
export class SocialAgent {
  private apiKey: string;
  private model: string;
  private xManager: XAccountManager | null = null;

  constructor(config: SocialAgentConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4';

    // Inizializza X Manager
    if (config.xManager) {
      this.xManager = config.xManager;
    } else if (config.xAccounts && config.xAccounts.length > 0) {
      this.xManager = new XAccountManager({
        accounts: config.xAccounts,
        defaultAccountId: config.defaultXAccount,
      });
    } else if (config.twitter) {
      // Legacy: singolo account Twitter
      this.xManager = new XAccountManager({
        defaultAccountId: 'default',
        accounts: [
          {
            accountId: 'default',
            name: 'Default',
            apiKey: config.twitter.apiKey,
            apiSecret: config.twitter.apiSecret,
            accessToken: config.twitter.accessToken,
            accessTokenSecret: config.twitter.accessSecret,
          },
        ],
      });
    }

    logger.info('SocialAgent initialized', {
      xConfigured: !!this.xManager,
      accountCount: this.xManager?.listAccounts().length ?? 0,
    });
  }

  /**
   * Ottiene il manager X/Twitter
   */
  getXManager(): XAccountManager {
    if (!this.xManager) {
      throw new Error('X/Twitter non configurato');
    }
    return this.xManager;
  }

  /**
   * Verifica se X/Twitter e' configurato
   */
  isXConfigured(): boolean {
    return this.xManager !== null;
  }

  // ============ Funzioni X/Twitter ============

  /**
   * Pubblica un tweet
   *
   * @param text - Testo del tweet (max 280 caratteri)
   * @param accountId - ID dell'account da usare (opzionale)
   */
  async postTweet(text: string, accountId?: string): Promise<TweetResult> {
    return this.getXManager().postTweet(text, accountId);
  }

  /**
   * Pubblica un thread di tweet
   *
   * @param tweets - Array di testi per il thread
   * @param accountId - ID dell'account da usare (opzionale)
   */
  async postThread(tweets: string[], accountId?: string): Promise<ThreadResult> {
    return this.getXManager().postThread(tweets, accountId);
  }

  /**
   * Schedula un tweet per pubblicazione futura
   *
   * @param text - Testo del tweet
   * @param date - Data di pubblicazione
   * @param accountId - ID dell'account da usare (opzionale)
   * @returns ID dello scheduled tweet
   */
  async scheduleTweet(text: string, date: Date, accountId?: string): Promise<string> {
    return this.getXManager().scheduleTweet(text, date, accountId);
  }

  /**
   * Pubblica un tweet con media
   *
   * @param text - Testo del tweet
   * @param media - Media da allegare
   * @param accountId - ID dell'account da usare (opzionale)
   */
  async postTweetWithMedia(
    text: string,
    media: MediaAttachment[],
    accountId?: string
  ): Promise<TweetResult> {
    return this.getXManager().postTweetWithMedia(text, media, accountId);
  }

  /**
   * Risponde a un tweet
   */
  async replyToTweet(text: string, replyToId: string, accountId?: string): Promise<TweetResult> {
    return this.getXManager().replyToTweet(text, replyToId, accountId);
  }

  /**
   * Cancella uno scheduled tweet
   */
  cancelScheduledTweet(scheduledId: string): boolean {
    return this.getXManager().cancelScheduledTweet(scheduledId);
  }

  /**
   * Lista scheduled tweets
   */
  listScheduledTweets() {
    return this.getXManager().listScheduledTweets();
  }

  // ============ AI Content Generation ============

  /**
   * Genera contenuto tweet con AI
   */
  async generateTweet(params: {
    topic: string;
    tone?: string;
    includeHashtags?: boolean;
    maxLength?: number;
    campaign?: Campaign;
  }): Promise<TweetDraft> {
    logger.info('Generating tweet', { topic: params.topic });

    // TODO: Implementare con OpenAI
    // Per ora placeholder
    const hashtags = params.includeHashtags ? ' #AI #Marketing' : '';
    const content = `[AI Generated] ${params.topic}${hashtags}`;

    return {
      content: content.slice(0, params.maxLength || 280),
    };
  }

  /**
   * Genera un thread su un topic
   */
  async generateThread(params: {
    topic: string;
    length: number;
    tone?: string;
    campaign?: Campaign;
  }): Promise<ThreadDraft> {
    logger.info('Generating thread', { topic: params.topic, length: params.length });

    // TODO: Implementare con OpenAI
    const tweets: TweetDraft[] = [];
    for (let i = 0; i < params.length; i++) {
      tweets.push({
        content: `${i + 1}/${params.length} [AI Generated] ${params.topic}`,
      });
    }

    return {
      tweets,
      topic: params.topic,
    };
  }

  /**
   * Genera strategia di engagement
   */
  async generateEngagementStrategy(campaign: Campaign): Promise<EngagementStrategy> {
    logger.info('Generating engagement strategy', { campaignId: campaign.id });

    // TODO: Implementare con analisi AI
    return {
      postingFrequency: 3,
      optimalTimes: ['09:00', '12:00', '18:00'],
      hashtags: [],
      mentionStrategy: 'Engage with relevant influencers',
      replyGuidelines: ['Be helpful', 'Stay on brand', 'Respond within 1 hour'],
    };
  }

  /**
   * Analizza audience
   */
  async analyzeAudience(): Promise<AudienceAnalysis> {
    logger.info('Analyzing audience');

    // TODO: Implementare con Twitter Analytics API
    return {
      demographics: {
        interests: [],
        locations: [],
        activeHours: [],
      },
      engagement: {
        avgLikes: 0,
        avgRetweets: 0,
        avgReplies: 0,
        topPerformingTopics: [],
      },
      growth: {
        followersGained: 0,
        followersLost: 0,
        netGrowth: 0,
      },
    };
  }

  /**
   * Genera risposta a un tweet
   */
  async generateReply(params: {
    originalTweet: string;
    context?: string;
    tone?: string;
  }): Promise<TweetDraft> {
    logger.info('Generating reply');

    // TODO: Implementare con OpenAI
    return {
      content: `[AI Reply] Thanks for your message!`,
    };
  }

  // ============ Legacy method for backward compatibility ============

  /**
   * @deprecated Use postTweet instead
   */
  async postTweetLegacy(draft: TweetDraft): Promise<SocialPost> {
    if (!this.xManager) {
      throw new Error('Twitter not configured');
    }

    logger.warn('Using deprecated postTweetLegacy method');

    const result = await this.xManager.postTweet(draft.content);

    const post: SocialPost = {
      id: result.tweetId,
      platform: 'twitter',
      content: draft.content,
      mediaUrls: draft.mediaUrls,
      scheduledAt: draft.scheduledAt,
      status: 'published',
      publishedAt: new Date(),
    };

    return post;
  }

  /**
   * @deprecated Use scheduleTweet instead
   */
  async schedulePosts(
    drafts: TweetDraft[],
    strategy: EngagementStrategy
  ): Promise<SocialPost[]> {
    logger.warn('Using deprecated schedulePosts method');
    // Placeholder per compatibilita'
    return [];
  }
}

export default SocialAgent;
