export const WORDS_PER_MINUTE = 200;

export function countWords(content: string): number {
  const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML/MDX tags
  return cleanContent.trim().split(/\s+/).filter(Boolean).length;
}

export function getReadingTimeMinutes(content: string): number {
  return Math.ceil(countWords(content) / WORDS_PER_MINUTE);
}

export function getReadingTime(content: string): string {
  return `${getReadingTimeMinutes(content)} min read`;
}
