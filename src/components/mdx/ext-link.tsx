type Props = {
  href: string;
  children: React.ReactNode;
};

export function ExtLink({ href, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-0.5 font-mono text-[12.5px] text-accent underline underline-offset-2 decoration-accent/40 transition-colors hover:decoration-accent"
    >
      {children}
      <svg
        viewBox="0 0 10 10"
        aria-hidden="true"
        className="mb-0.5 size-2.5 shrink-0 translate-y-px"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1.5 8.5 8.5 1.5M4.5 1.5h4v4" />
      </svg>
    </a>
  );
}
