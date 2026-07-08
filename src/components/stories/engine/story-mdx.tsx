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

// Story elements inherit mostly from CSS, we just add the fade-in to some
const components = {
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="story-fade-in" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="font-serif text-[1.5rem] mt-10 mb-4 text-story-text story-fade-in" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="story-fade-in" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-6 space-y-2 pl-4 list-disc text-story-muted story-fade-in" {...props} />
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
    <blockquote className="border-l-2 border-story-accent pl-6 my-8 italic text-story-muted story-fade-in" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-story-text underline decoration-story-border underline-offset-4 transition-colors hover:decoration-story-text"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  hr: () => <Pause />, // Replace standard HRs with the ornamental pause
  
  // Custom Story Primitives
  Dialogue,
  Thought,
  Letter,
  Pause,
  WideImage,
  CinematicImage,
  Chapter,
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
