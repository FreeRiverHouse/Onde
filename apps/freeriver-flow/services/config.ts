import Constants from 'expo-constants';

/**
 * Configuration service for FreeRiver Flow
 * Loads and validates environment variables
 */

interface Config {
  // Required API keys
  anthropicApiKey: string;
  openaiApiKey: string;

  // Optional API keys
  elevenLabsApiKey: string | null;
  elevenLabsVoiceId: string | null;

  // Feature flags
  useElevenLabs: boolean;
}

/**
 * Get environment variable from Expo constants or process.env
 */
function getEnvVar(key: string): string | undefined {
  // Try Expo constants first (for EAS builds)
  const expoExtra = Constants.expoConfig?.extra;
  if (expoExtra && key in expoExtra) {
    return expoExtra[key];
  }

  // Fallback to process.env (for development with dotenv)
  return process.env[key];
}

/**
 * Get required environment variable or throw error
 */
function getRequiredEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Please check your .env file or EAS build configuration.`
    );
  }
  return value;
}

/**
 * Get optional environment variable
 */
function getOptionalEnvVar(key: string): string | null {
  return getEnvVar(key) || null;
}

/**
 * Validate API key format
 */
function validateApiKey(key: string, value: string, prefix?: string): void {
  if (prefix && !value.startsWith(prefix)) {
    console.warn(
      `Warning: ${key} does not start with expected prefix "${prefix}". ` +
        `Please verify the API key is correct.`
    );
  }
}

/**
 * Load and validate configuration
 */
function loadConfig(): Config {
  // Load required keys
  const anthropicApiKey = getRequiredEnvVar('ANTHROPIC_API_KEY');
  const openaiApiKey = getRequiredEnvVar('OPENAI_API_KEY');

  // Validate key formats
  validateApiKey('ANTHROPIC_API_KEY', anthropicApiKey, 'sk-ant-');
  validateApiKey('OPENAI_API_KEY', openaiApiKey, 'sk-');

  // Load optional keys
  const elevenLabsApiKey = getOptionalEnvVar('ELEVENLABS_API_KEY');
  const elevenLabsVoiceId = getOptionalEnvVar('ELEVENLABS_VOICE_ID');

  return {
    anthropicApiKey,
    openaiApiKey,
    elevenLabsApiKey,
    elevenLabsVoiceId,
    useElevenLabs: !!elevenLabsApiKey,
  };
}

// Singleton config instance
let configInstance: Config | null = null;

/**
 * Get application configuration
 * Lazily loads and caches the configuration
 */
export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Check if ElevenLabs TTS is available
 */
export function isElevenLabsAvailable(): boolean {
  return getConfig().useElevenLabs;
}

/**
 * Reset config (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}

export default getConfig;
