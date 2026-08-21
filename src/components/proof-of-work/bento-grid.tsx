import { HTMLAttributes, ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div className="w-full flex justify-center pb-8 pt-12 md:py-12 px-4 sm:px-6 lg:px-8">
      {/* 
        On mobile, 1 column. 
        On desktop (lg), we switch to the 30-40-30 layout.
      */}
      <div
        className={`w-full max-w-[1440px] flex flex-col lg:grid gap-4 lg:gap-6 ${className}`}
        style={{
          gridTemplateColumns: "3fr 4fr 3fr",
          gridAutoRows: "minmax(400px, auto)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function BentoCard({ children, className = "", style, ...props }: BentoCardProps) {
  return (
    <div
      style={style}
      {...props}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-surface border border-edge shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
