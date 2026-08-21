import { GitHubContributionGraph } from "@/components/home/github-graph";

interface GitHubActivityCardProps {
  className?: string;
}

export function GitHubActivityCard({ className }: GitHubActivityCardProps) {
  return (
    <div 
      className={`flex flex-col justify-end [&>div]:mt-0 [&>div]:h-full [&>div>div]:h-full ${className || ""}`}
    >
      <GitHubContributionGraph />
    </div>
  );
}
