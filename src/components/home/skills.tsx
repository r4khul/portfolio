import { memo, type CSSProperties } from "react";
import {
  ArrowLeftRight,
  Bird,
  Blocks,
  CodeXml,
  Gem,
  Globe,
  Hexagon,
  MousePointer2,
  Network,
  Route,
  Snowflake,
  Sparkles,
  Terminal,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import { FaJava } from "react-icons/fa6";
import {
  SiAndroidstudio,
  SiC,
  SiClaude,
  SiCplusplus,
  SiDart,
  SiExpress,
  SiFastlane,
  SiFirebase,
  SiFlutter,
  SiGit,
  SiGithub,
  SiGooglecloud,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiOpenai,
  SiPostman,
  SiPython,
  SiReact,
  SiSqlite,
  SiSupabase,
} from "react-icons/si";
import { skills } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

type SkillVisual = {
  icon: IconType | LucideIcon;
  color: string;
  darkColor?: string;
};

// Use brand marks where available and matching vector symbols for Flutter packages.
const skillVisuals: Record<string, SkillVisual> = {
  Dart: { icon: SiDart, color: "#0175C2", darkColor: "#54C5F8" },
  JavaScript: { icon: SiJavascript, color: "#A38600", darkColor: "#F7DF1E" },
  C: { icon: SiC, color: "#5C6BC0", darkColor: "#A8B9CC" },
  "C++": { icon: SiCplusplus, color: "#00599C", darkColor: "#659AD2" },
  Java: { icon: FaJava, color: "#E76F00", darkColor: "#F89820" },
  Python: { icon: SiPython, color: "#3776AB", darkColor: "#FFD343" },
  Flutter: { icon: SiFlutter, color: "#02569B", darkColor: "#54C5F8" },
  BLoC: { icon: Blocks, color: "#1686C7", darkColor: "#55C7F0" },
  Riverpod: { icon: Waves, color: "#2563EB", darkColor: "#60A5FA" },
  Provider: { icon: Network, color: "#7C3AED", darkColor: "#A78BFA" },
  Dio: { icon: Globe, color: "#2563EB", darkColor: "#60A5FA" },
  Retrofit: { icon: ArrowLeftRight, color: "#16803D", darkColor: "#4ADE80" },
  Freezed: { icon: Snowflake, color: "#0891B2", darkColor: "#67E8F9" },
  GoRouter: { icon: Route, color: "#047857", darkColor: "#34D399" },
  HiveDB: { icon: Hexagon, color: "#B7791F", darkColor: "#FBBF24" },
  Sqlite3: { icon: SiSqlite, color: "#0F80CC", darkColor: "#71C8F1" },
  Drift: { icon: Waves, color: "#0D9488", darkColor: "#5EEAD4" },
  IsarDB: { icon: Gem, color: "#6D28D9", darkColor: "#C4B5FD" },
  Shorebird: { icon: Bird, color: "#D94D36", darkColor: "#FB806B" },
  Fastlane: { icon: SiFastlane, color: "#138A35", darkColor: "#57D667" },
  "React.js": { icon: SiReact, color: "#087EA4", darkColor: "#61DAFB" },
  "Node.js": { icon: SiNodedotjs, color: "#43853D", darkColor: "#83CD29" },
  "Express.js": { icon: SiExpress, color: "#6D28D9", darkColor: "#C4B5FD" },
  Firebase: { icon: SiFirebase, color: "#DD6800", darkColor: "#FFCA28" },
  Supabase: { icon: SiSupabase, color: "#16875D", darkColor: "#3FCF8E" },
  MongoDB: { icon: SiMongodb, color: "#27873C", darkColor: "#47A248" },
  "Google Cloud": { icon: SiGooglecloud, color: "#4285F4", darkColor: "#8AB4F8" },
  Git: { icon: SiGit, color: "#F05032", darkColor: "#F77B63" },
  GitHub: { icon: SiGithub, color: "#6E40C9", darkColor: "#B994FF" },
  "Android Studio": { icon: SiAndroidstudio, color: "#16803D", darkColor: "#3DDC84" },
  Postman: { icon: SiPostman, color: "#D94A22", darkColor: "#FF6C37" },
  Antigravity: { icon: Sparkles, color: "#4285F4", darkColor: "#8AB4F8" },
  Cursor: { icon: MousePointer2, color: "#6D28D9", darkColor: "#C4B5FD" },
  "Claude Code": { icon: SiClaude, color: "#C15F3C", darkColor: "#DFA084" },
  OpenCode: { icon: Terminal, color: "#0D9488", darkColor: "#5EEAD4" },
  Codex: { icon: SiOpenai, color: "#10A37F", darkColor: "#5BD5AF" },
};

type SkillStyle = CSSProperties & {
  "--skill-color": string;
  "--skill-color-dark": string;
};

export const SkillsSection = memo(() => {
  return (
    <Section id="skills" index="03" title="Skills">
      <div className="space-y-5">
        {skills.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.04}>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              <h3 className="w-44 shrink-0 pt-0.5 font-mono text-[11px] tracking-widest text-faint uppercase">
                {group.label}
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => {
                  const visual = skillVisuals[item];
                  const Icon = visual?.icon ?? CodeXml;
                  const style: SkillStyle = {
                    "--skill-color": visual?.color ?? "var(--accent)",
                    "--skill-color-dark": visual?.darkColor ?? visual?.color ?? "var(--accent)",
                  };
                  return (
                    <li
                      key={item}
                      style={style}
                      className="group/skill inline-flex items-center gap-1.5 rounded-md border border-edge bg-surface px-2 py-1 font-mono text-[12px] text-muted transition-colors hover:border-edge-strong hover:text-foreground"
                    >
                      <Icon
                        aria-hidden="true"
                        focusable="false"
                        className="size-3.5 shrink-0 transition-colors duration-200 group-hover/skill:text-[var(--skill-color)] dark:group-hover/skill:text-[var(--skill-color-dark)]"
                      />
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
});

SkillsSection.displayName = 'SkillsSection';
