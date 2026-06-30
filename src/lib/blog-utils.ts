export function getCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}
