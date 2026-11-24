/**
 * Serialize structured data for a `<script type="application/ld+json">`.
 *
 * JSON.stringify leaves `<` as is, so a value containing `</script>` would
 * close the tag and let the rest run as HTML. Escaping `<` keeps the JSON
 * identical for parsers while making it inert inside the script element.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
