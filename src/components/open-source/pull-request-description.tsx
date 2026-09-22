"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      {markdown}
    </ReactMarkdown>
  );
}
