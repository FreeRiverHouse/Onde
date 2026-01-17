import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { envSchema, loadConfig, defaultConfig } from '../config/index.js';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('envSchema', () => {
    it('should validate valid environment configuration', () => {
      const validEnv = {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        OPENAI_API_KEY: 'sk-test-key',
      };

      const result = envSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('production');
        expect(result.data.LOG_LEVEL).toBe('info');
      }
    });

    it('should use default values when not provided', () => {
      const result = envSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('development');
        expect(result.data.LOG_LEVEL).toBe('info');
      }
    });

    it('should reject invalid NODE_ENV values', () => {
      const invalidEnv = {
        NODE_ENV: 'invalid-env',
      };

      const result = envSchema.safeParse(invalidEnv);
      expect(result.success).toBe(false);
    });

    it('should reject invalid LOG_LEVEL values', () => {
      const invalidEnv = {
        LOG_LEVEL: 'trace', // Not a valid level
      };

      const result = envSchema.safeParse(invalidEnv);
      expect(result.success).toBe(false);
    });

    it('should allow optional API keys to be undefined', () => {
      const result = envSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.OPENAI_API_KEY).toBeUndefined();
        expect(result.data.ANTHROPIC_API_KEY).toBeUndefined();
        expect(result.data.TWITTER_API_KEY).toBeUndefined();
      }
    });
  });

  describe('loadConfig', () => {
    it('should load valid configuration from environment', () => {
      process.env.NODE_ENV = 'test';
      process.env.LOG_LEVEL = 'debug';

      const config = loadConfig();
      expect(config.NODE_ENV).toBe('test');
      expect(config.LOG_LEVEL).toBe('debug');
    });

    it('should throw on invalid configuration', () => {
      process.env.NODE_ENV = 'invalid';

      expect(() => loadConfig()).toThrow('Configuration validation failed');
    });
  });

  describe('defaultConfig', () => {
    it('should have correct publishing settings', () => {
      expect(defaultConfig.publishing.supportedFormats).toContain('epub');
      expect(defaultConfig.publishing.supportedFormats).toContain('pdf');
      expect(defaultConfig.publishing.maxFileSize).toBe(500 * 1024 * 1024);
    });

    it('should have correct PR settings', () => {
      expect(defaultConfig.pr.defaultChannels).toContain('twitter');
      expect(defaultConfig.pr.postingSchedule.timezone).toBe('Europe/Rome');
      expect(defaultConfig.pr.postingSchedule.optimalHours).toHaveLength(4);
    });

    it('should have correct agent settings', () => {
      expect(defaultConfig.agents.maxConcurrentTasks).toBe(5);
      expect(defaultConfig.agents.taskTimeout).toBe(300000);
    });
  });
});
