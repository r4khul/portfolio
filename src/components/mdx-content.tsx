import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
// @ts-ignore -- highlight.js is a transitive dep of rehype-highlight
import dart from "highlight.js/lib/languages/dart";
import type { ComponentProps } from "react";
import { TweetEmbed } from "@/components/mdx/tweet-embed";
import { CommitCard } from "@/components/mdx/commit-card";
import { ExtLink } from "@/components/mdx/ext-link";
import { ImageZoom } from "@/components/mdx/image-zoom";

const components = {
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mt-12 mb-4 border-t border-edge pt-8 font-serif text-[24px] tracking-tight first:mt-0 first:border-t-0 first:pt-0"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-8 mb-3 text-[15px] font-semibold tracking-tight" {...props} />
  ),
  img: (props: ComponentProps<"img">) => (
    <ImageZoom src={typeof props.src === "string" ? props.src : ""} alt={props.alt} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-4 text-[14.5px] leading-relaxed text-muted" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-4 space-y-1.5 pl-1" {...props} />
  ),
  li: (props: ComponentProps<"li">) => (
    <li
      className="relative pl-4 text-[14px] leading-relaxed text-muted before:absolute before:top-[9px] before:left-0 before:size-1 before:rounded-full before:bg-faint"
      {...props}
    />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  hr: () => null,
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-foreground underline decoration-edge-strong underline-offset-4 transition-colors hover:decoration-foreground"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-edge bg-surface px-5 py-4 font-mono text-[13px] leading-relaxed text-foreground"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => {
    if (props.className?.includes("language-")) {
      return <code className="block" {...props} />;
    }
    return (
      <code
        className="rounded border border-edge bg-surface px-1.5 py-0.5 font-mono text-[12.5px]"
        {...props}
      />
    );
  },
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-edge">
      <table className="w-full border-collapse text-left text-[13px]" {...props} />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      className="border-b border-edge bg-surface px-3 py-2 font-mono text-[11px] font-medium tracking-wide text-faint uppercase"
      {...props}
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td
      className="border-b border-edge px-3 py-2.5 align-top leading-relaxed text-muted"
      {...props}
    />
  ),
  TweetEmbed,
  CommitCard,
  ExtLink,
  ImageZoom,
};

export function MdxContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug, [rehypeHighlight, { languages: { dart } }]] } }}
    />
  );
}
