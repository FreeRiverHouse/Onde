import { z } from 'zod';

/**
 * Environment configuration schema
 */
export const envSchema = z.object({
  // General
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // AI Providers
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Twitter/X API
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_API_SECRET: z.string().optional(),
  TWITTER_ACCESS_TOKEN: z.string().optional(),
  TWITTER_ACCESS_SECRET: z.string().optional(),
  TWITTER_BEARER_TOKEN: z.string().optional(),

  // Database
  DATABASE_URL: z.string().optional(),

  // Storage
  STORAGE_BUCKET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Load and validate environment configuration
 */
export const loadConfig = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment configuration:');
    console.error(result.error.format());
    throw new Error('Configuration validation failed');
  }

  return result.data;
};

/**
 * Onde platform configuration
 */
export interface OndeConfig {
  publishing: {
    supportedFormats: string[];
    maxFileSize: number;
  };
  pr: {
    defaultChannels: string[];
    postingSchedule: {
      timezone: string;
      optimalHours: number[];
    };
  };
  agents: {
    maxConcurrentTasks: number;
    taskTimeout: number;
  };
}

export const defaultConfig: OndeConfig = {
  publishing: {
    supportedFormats: ['epub', 'pdf', 'mp3', 'wav', 'flac'],
    maxFileSize: 500 * 1024 * 1024, // 500MB
  },
  pr: {
    defaultChannels: ['twitter'],
    postingSchedule: {
      timezone: 'Europe/Rome',
      optimalHours: [9, 12, 18, 21],
    },
  },
  agents: {
    maxConcurrentTasks: 5,
    taskTimeout: 300000, // 5 minutes
  },
};
