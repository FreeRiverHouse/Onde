/**
 * Twitter/X Integration Module
 * Esporta tutti i componenti per l'integrazione con X/Twitter
 */

// Types
export type {
  XAccountCredentials,
  XManagerConfig,
  TweetResult,
  ThreadResult,
  PostTweetOptions,
  ScheduleTweetOptions,
  ScheduledTweet,
  MediaAttachment,
  MediaUploadResult,
  PollOptions,
  TweetMetrics,
} from './types.js';

// Client
export { XClient } from './client.js';

// Manager
export {
  XAccountManager,
  createManagerFromEnv,
  createSingleAccountManager,
} from './manager.js';
