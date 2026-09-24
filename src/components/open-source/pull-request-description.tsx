"use client";

/* PR descriptions can include images from hosts outside Next's image allowlist. */
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ImageDimensions = { width: number; height: number };

function PullRequestImage({ src, alt, dimensions }: { src: string; alt?: string; dimensions?: ImageDimensions }) {
  const [failed, setFailed] = useState(false);
  const description = !alt || /^dyn-[a-f\d]+$/i.test(alt) ? "Pull request screenshot" : alt;
  const isGitHubAttachment = /^https:\/\/github\.com\/user-attachments\/assets\/[\w-]+$/i.test(src);
  const className = "mt-3 max-h-[32rem] h-auto max-w-full rounded-lg border border-edge bg-surface object-contain";

  if (failed) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex rounded-lg border border-edge bg-background px-3 py-2 text-[12px] text-foreground underline decoration-edge-strong underline-offset-4 hover:border-edge-strong"
      >
        View attached image ↗
      </a>
    );
  }

  if (isGitHubAttachment) {
    // Next serves the image from this site and follows GitHub's S3 redirect.
    // The browser can then load it without widening the image CSP.
    return (
      <Image
        src={src}
        alt={description}
        width={dimensions?.width ?? 800}
        height={dimensions?.height ?? 450}
        loading="lazy"
        onError={() => setFailed(true)}
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={description}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function normaliseGitHubImages(markdown: string) {
  const dimensions = new Map<string, ImageDimensions>();
  const content = markdown.replace(/\\?<img\b([^>]*)\/?\s*>/gi, (tag, attributes: string) => {
    const source = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2]?.trim();
    const alt = attributes.match(/\balt\s*=\s*(["'])(.*?)\1/i)?.[2]?.trim() || "Attached image";

    if (!source) return tag;

    // GitHub's rich-text editor occasionally serializes an attachment as
    // src="[preview](https://github.com/user-attachments/...)". A browser
    // cannot load that Markdown value as a URL, so retain only its destination.
    const markdownLink = source.match(/^\[[^\]]*\]\((https?:\/\/[^\s)]+)\)$/i);
    const url = markdownLink?.[1] || source;
    if (!/^https?:\/\/[^\s]+$/i.test(url)) return tag;

    const width = Number(attributes.match(/\bwidth\s*=\s*(["'])(\d+)\1/i)?.[2]);
    const height = Number(attributes.match(/\bheight\s*=\s*(["'])(\d+)\1/i)?.[2]);
    if (width > 0 && height > 0) dimensions.set(url, { width, height });

    return `![${alt.replace(/[\[\]]/g, "\\$&")}](${url})`;
  });

  return { content, dimensions };
}

export function PullRequestDescription({ markdown }: { markdown: string }) {
  const { content, dimensions } = normaliseGitHubImages(markdown);

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
          return <PullRequestImage key={src} src={src} alt={alt} dimensions={dimensions.get(src)} />;
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
      {content}
    </ReactMarkdown>
  );
}
