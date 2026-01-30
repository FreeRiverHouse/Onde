/**
 * Reading time calculation utilities
 * Average adult reading speed: 200-250 WPM
 * We use 200 WPM for a comfortable estimate
 */

const WORDS_PER_MINUTE = 200;

/**
 * Calculate estimated reading time in minutes from word count
 */
export function calculateReadingMinutes(wordCount: number): number {
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

/**
 * Calculate remaining reading time based on progress
 */
export function calculateRemainingMinutes(totalMinutes: number, progressPercent: number): number {
  return Math.ceil(totalMinutes * (1 - progressPercent / 100));
}

/**
 * Format reading time as a human-readable string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  return hours === 1 
    ? `1 hr ${remainingMins} min`
    : `${hours} hrs ${remainingMins} min`;
}

/**
 * Get a compact reading time format (for cards)
 */
export function formatReadingTimeCompact(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}m`;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  if (!text) return 0;
  // Split by whitespace, filter out empty strings
  return text.split(/\s+/).filter(word => word.length > 0).length;
}
