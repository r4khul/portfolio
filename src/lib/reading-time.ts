export function getReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML/MDX tags
  const words = cleanContent.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
