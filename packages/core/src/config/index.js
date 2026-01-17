"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.loadConfig = exports.envSchema = void 0;
const zod_1 = require("zod");
/**
 * Environment configuration schema
 */
exports.envSchema = zod_1.z.object({
    // General
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    // AI Providers
    OPENAI_API_KEY: zod_1.z.string().optional(),
    ANTHROPIC_API_KEY: zod_1.z.string().optional(),
    // Twitter/X API
    TWITTER_API_KEY: zod_1.z.string().optional(),
    TWITTER_API_SECRET: zod_1.z.string().optional(),
    TWITTER_ACCESS_TOKEN: zod_1.z.string().optional(),
    TWITTER_ACCESS_SECRET: zod_1.z.string().optional(),
    TWITTER_BEARER_TOKEN: zod_1.z.string().optional(),
    // Database
    DATABASE_URL: zod_1.z.string().optional(),
    // Storage
    STORAGE_BUCKET: zod_1.z.string().optional(),
});
/**
 * Load and validate environment configuration
 */
const loadConfig = () => {
    const result = exports.envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('Invalid environment configuration:');
        console.error(result.error.format());
        throw new Error('Configuration validation failed');
    }
    return result.data;
};
exports.loadConfig = loadConfig;
exports.defaultConfig = {
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
//# sourceMappingURL=index.js.map