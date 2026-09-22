"use client";

/* GitHub attachment URLs are dynamic external content and cannot use Next's image optimizer. */
/* eslint-disable @next/next/no-img-element */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function normaliseGitHubImages(markdown: string) {
  return markdown.replace(/\\?<img\b([^>]*)\/?\s*>/gi, (tag, attributes: string) => {
    const source = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2]?.trim();
    const alt = attributes.match(/\balt\s*=\s*(["'])(.*?)\1/i)?.[2]?.trim() || "Attached image";

    if (!source) return tag;

    // GitHub's rich-text editor occasionally serializes an attachment as
    // src="[preview](https://github.com/user-attachments/...)". A browser
    // cannot load that Markdown value as a URL, so retain only its destination.
    const markdownLink = source.match(/^\[[^\]]*\]\((https?:\/\/[^\s)]+)\)$/i);
    const url = markdownLink?.[1] || source;
    if (!/^https?:\/\/[^\s]+$/i.test(url)) return tag;

    return `![${alt.replace(/[\[\]]/g, "\\$&")}](${url})`;
  });
}

export function PullRequestDescription({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h4 className="mt-4 text-[14px] font-semibold text-foreground first:mt-0">{children}</h4>,
        h2: ({ children }) => <h4 className="mt-4 text-[14px] font-semibold text-foreground first:mt-0">{children}</h4>,
        h3: ({ children }) => <h5 className="mt-3 text-[13.5px] font-semibold text-foreground">{children}</h5>,
        p: ({ children }) => <p className="mt-2 text-[13.5px] leading-relaxed text-muted first:mt-0">{children}</p>,
        ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5 text-[13.5px] leading-relaxed text-muted">{children}</ul>,
        ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13.5px] leading-relaxed text-muted">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        code: ({ children }) => <code className="rounded border border-edge bg-background px-1 py-0.5 font-mono text-[12px] text-foreground">{children}</code>,
        img: ({ src, alt }) => {
          if (typeof src !== "string" || !/^https?:\/\//i.test(src)) return null;

          return (
            <img
              src={src}
              alt={alt || ""}
              loading="lazy"
              className="mt-3 max-h-[32rem] w-auto max-w-full rounded-lg border border-edge bg-surface object-contain"
            />
          );
        },
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline decoration-edge-strong underline-offset-4 hover:decoration-foreground"
          >
            {children}
          </a>
        ),
      }}
    >
      {normaliseGitHubImages(markdown)}
    </ReactMarkdown>
  );
}
