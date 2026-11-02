import { Fragment, isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Turns a plain drawing (function components returning SVG elements, no
 * hooks) into a standalone SVG document, for renderers that cannot run the
 * page's styles, like the share-image renderer. React's camelCase drawing
 * props become SVG attributes, the page-background variable becomes a real
 * colour, and class names and inline styles are dropped.
 */
const ATTRIBUTES: Record<string, string> = {
  strokeWidth: "stroke-width",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeDasharray: "stroke-dasharray",
  strokeOpacity: "stroke-opacity",
  strokeMiterlimit: "stroke-miterlimit",
  fillOpacity: "fill-opacity",
  fillRule: "fill-rule",
  clipRule: "clip-rule",
  vectorEffect: "vector-effect",
  textAnchor: "text-anchor",
  fontSize: "font-size",
  fontWeight: "font-weight",
  fontFamily: "font-family",
  stopColor: "stop-color",
  stopOpacity: "stop-opacity",
  dominantBaseline: "dominant-baseline",
};
const SKIPPED = new Set(["children", "className", "style", "key", "ref", "focusable"]);

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function render(node: ReactNode, paper: string): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return escape(String(node));
  if (Array.isArray(node)) return node.map((child) => render(child, paper)).join("");
  if (!isValidElement(node)) return "";
  const { type, props } = node as ReactElement<Record<string, unknown>>;
  if (type === Fragment) return render(props.children as ReactNode, paper);
  if (typeof type === "function") return render((type as (input: unknown) => ReactNode)(props), paper);
  if (typeof type !== "string") return "";
  let attributes = "";
  for (const [name, value] of Object.entries(props)) {
    if (SKIPPED.has(name) || name.startsWith("data-") || value === undefined || value === null || value === false) continue;
    const text = String(value).replace(/var\(--background\)/g, paper);
    attributes += ` ${ATTRIBUTES[name] ?? name}="${escape(text)}"`;
  }
  return `<${type}${attributes}>${render(props.children as ReactNode, paper)}</${type}>`;
}

export function toSvg(drawing: ReactNode, { width, height, ink, paper, viewBox }: { width: number; height: number; ink: string; paper: string; viewBox?: string }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox ?? `0 0 ${width} ${height}`}" color="${ink}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${render(drawing, paper)}</svg>`;
}
