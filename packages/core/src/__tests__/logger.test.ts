import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, logger } from '../utils/logger.js';

describe('Logger', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createLogger', () => {
    it('should create a logger with a service name', () => {
      const customLogger = createLogger('test-service');
      expect(customLogger).toBeDefined();
      expect(customLogger.defaultMeta).toEqual({ service: 'test-service' });
    });

    it('should use LOG_LEVEL from environment', () => {
      process.env.LOG_LEVEL = 'debug';
      const customLogger = createLogger('debug-service');
      expect(customLogger.level).toBe('debug');
    });

    it('should default to info level when LOG_LEVEL not set', () => {
      delete process.env.LOG_LEVEL;
      const customLogger = createLogger('default-service');
      expect(customLogger.level).toBe('info');
    });

    it('should have console transport', () => {
      const customLogger = createLogger('transport-test');
      expect(customLogger.transports).toHaveLength(1);
    });
  });

  describe('default logger', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
    });

    it('should have onde as service name', () => {
      expect(logger.defaultMeta).toEqual({ service: 'onde' });
    });

    it('should have info, warn, error, debug methods', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });
});
