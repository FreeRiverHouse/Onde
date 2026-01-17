import { z } from 'zod';
/**
 * Environment configuration schema
 */
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
    TWITTER_API_KEY: z.ZodOptional<z.ZodString>;
    TWITTER_API_SECRET: z.ZodOptional<z.ZodString>;
    TWITTER_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
    TWITTER_ACCESS_SECRET: z.ZodOptional<z.ZodString>;
    TWITTER_BEARER_TOKEN: z.ZodOptional<z.ZodString>;
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    STORAGE_BUCKET: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    OPENAI_API_KEY?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    TWITTER_API_KEY?: string | undefined;
    TWITTER_API_SECRET?: string | undefined;
    TWITTER_ACCESS_TOKEN?: string | undefined;
    TWITTER_ACCESS_SECRET?: string | undefined;
    TWITTER_BEARER_TOKEN?: string | undefined;
    DATABASE_URL?: string | undefined;
    STORAGE_BUCKET?: string | undefined;
}, {
    NODE_ENV?: "development" | "production" | "test" | undefined;
    LOG_LEVEL?: "error" | "warn" | "info" | "debug" | undefined;
    OPENAI_API_KEY?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    TWITTER_API_KEY?: string | undefined;
    TWITTER_API_SECRET?: string | undefined;
    TWITTER_ACCESS_TOKEN?: string | undefined;
    TWITTER_ACCESS_SECRET?: string | undefined;
    TWITTER_BEARER_TOKEN?: string | undefined;
    DATABASE_URL?: string | undefined;
    STORAGE_BUCKET?: string | undefined;
}>;
export type EnvConfig = z.infer<typeof envSchema>;
/**
 * Load and validate environment configuration
 */
export declare const loadConfig: () => EnvConfig;
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
export declare const defaultConfig: OndeConfig;
//# sourceMappingURL=index.d.ts.map