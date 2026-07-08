export function getReadingTimeMinutes(content: string): number {
  const wordsPerMinute = 200;
  const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML/MDX tags
  const words = cleanContent.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getReadingTime(content: string): string {
  return `${getReadingTimeMinutes(content)} min read`;
}
