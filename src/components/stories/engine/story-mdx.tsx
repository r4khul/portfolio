import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ComponentProps } from "react";
import {
  Dialogue,
  Thought,
  Letter,
  Pause,
  WideImage,
  CinematicImage,
  Chapter,
} from "./story-components";
import { StoryReveal } from "./story-reveal";
import { StoryEffect } from "./story-effect";

// Every prose block is wrapped in a scroll-gated StoryReveal.
// Custom components handle their own reveal internally via StoryReveal.
const components = {
  h2: (props: ComponentProps<"h2">) => (
    <StoryReveal>
      <h2 {...props} />
    </StoryReveal>
  ),
  h3: (props: ComponentProps<"h3">) => (
    <StoryReveal>
      <h3 className="font-serif text-[1.5rem] mt-10 mb-4 text-story-text" {...props} />
    </StoryReveal>
  ),
  p: (props: ComponentProps<"p">) => (
    <StoryReveal>
      <p {...props} />
    </StoryReveal>
  ),
  ul: (props: ComponentProps<"ul">) => (
    <StoryReveal>
      <ul className="my-6 space-y-2 pl-4 list-disc text-story-muted" {...props} />
    </StoryReveal>
  ),
  li: (props: ComponentProps<"li">) => (
    <li className="pl-2" {...props} />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-story-text" {...props} />
  ),
  em: (props: ComponentProps<"em">) => (
    <em className="italic text-story-text/90" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <StoryReveal>
      <blockquote className="border-l-2 border-story-accent pl-6 my-8 italic text-story-muted" {...props} />
    </StoryReveal>
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-story-text underline decoration-story-border underline-offset-4 transition-colors hover:decoration-story-text"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  hr: () => <Pause />,

  // Custom Story Primitives
  Dialogue,
  Thought,
  Letter,
  Pause,
  WideImage,
  CinematicImage,
  Chapter,
  StoryEffect,
};

export function StoryMdxContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
    />
  );
}
