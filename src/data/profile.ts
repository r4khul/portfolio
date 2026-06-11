export const profile = {
  name: "Rakhul Prakash S B",
  handle: "r4khul",
  role: "Mobile Engineer · Flutter",
  location: "Chennai, India",
  timezone: "Asia/Kolkata",
  email: "rakhul2005@gmail.com",
  url: "https://r4khul.dev",
  cal: "https://cal.com/r4khul/",
  resume: "/r4khul_resume.pdf",
  about: [
    "I'm Rakhul, a CS engineer who likes building things that people actually use.",
    "My focus is mobile development with Flutter — from architecture and performance to edge cases and deployment. I've worked on startup products, open-source projects, and real client apps, where reliability matters more than demos.",
    "I'm at my best when I can take ownership, learn fast, and turn messy problems into solid, shippable software.",
  ],
} as const;

export type Experience = {
  company: string;
  companyUrl: string;
  logo: string;
  title: string;
  period: string;
  location: string;
  status: "active" | "done";
  summary: string;
  highlights: string[];
};

export const experience: Experience[] = [
  {
    company: "Finfresh Wealth Creation",
    companyUrl: "https://www.linkedin.com/company/finfreshwealth/",
    logo: "/images/office/finfresh.png",
    title: "Flutter Developer Intern",
    period: "Feb 2026 — May 2026",
    location: "Chennai, India · IITM Incubated",
    status: "active",
    summary:
      "Owned development of 2 fintech apps — performance, scalable architecture, and measurable impact across payments, onboarding, and release pipelines.",
    highlights: [
      "Integrated 10+ data-intensive API endpoints with caching & virtualization strategies, reducing latency",
      "Built CI/CD pipelines with Fastlane & GitHub Actions, cutting release cycles by 50%+",
      "Migrated payments from PayU to PhonePe Checkout SDK; shipped secure flows for gold/silver, mutual funds & SIPs",
      "Revamped onboarding & KYC with third-party verification APIs, improving completion rates by 15–20%",
      "Reduced app size by 20MB and achieved consistent 60FPS+ rendering",
      "Resolved 45+ bugs, shipped 10+ features, and revamped legacy UI",
    ],
  },
];

export type SkillGroup = { label: string; items: string[] };

export const skills: SkillGroup[] = [
  { label: "Languages", items: ["Dart", "JavaScript", "C", "C++", "Java", "Python"] },
  {
    label: "Mobile & Flutter",
    items: [
      "Flutter",
      "BLoC",
      "Riverpod",
      "Provider",
      "Dio",
      "Retrofit",
      "Freezed",
      "GoRouter",
      "HiveDB",
      "Sqlite3",
      "Drift",
      "IsarDB",
      "Shorebird",
      "Fastlane",
    ],
  },
  { label: "Web & Backend", items: ["React.js", "Node.js", "Express.js"] },
  { label: "Databases & Cloud", items: ["Firebase", "Supabase", "MongoDB", "Google Cloud"] },
  { label: "Tools & Workflow", items: ["Git", "GitHub", "Android Studio", "Postman"] },
  {
    label: "Editors & AI Tools",
    items: ["VS Code", "Antigravity", "Cursor", "Claude Code", "OpenCode", "Gemini CLI"],
  },
];

export type OssContribution = {
  repo: string;
  repoUrl: string;
  users: string;
  context: string;
  prs: { title: string; url: string; status?: "merged" | "review" }[];
};

export const openSource: OssContribution[] = [
  {
    repo: "traccar/traccar-client",
    repoUrl: "https://github.com/traccar/traccar-client",
    users: "200k+ users",
    context: "Maintained by an MTS @ OpenAI & the founder of Traccar",
    prs: [
      { title: "PR #143", url: "https://github.com/traccar/traccar-client/pull/143" },
      { title: "PR #144", url: "https://github.com/traccar/traccar-client/pull/144" },
      { title: "PR #146", url: "https://github.com/traccar/traccar-client/pull/146" },
    ],
  },
  {
    repo: "darkmoonight/Zest",
    repoUrl: "https://github.com/darkmoonight/Zest",
    users: "8k+ users",
    context: "Maintained by an SDE @ Innopolis",
    prs: [
      { title: "PR #125", url: "https://github.com/darkmoonight/Zest/pull/125" },
      { title: "PR #127", url: "https://github.com/darkmoonight/Zest/pull/127" },
      { title: "PR #128", url: "https://github.com/darkmoonight/Zest/pull/128" },
      { title: "PR #129", url: "https://github.com/darkmoonight/Zest/pull/129" },
    ],
  },
  {
    repo: "flow-mn/flow",
    repoUrl: "https://github.com/flow-mn/flow",
    users: "4k+ users",
    context: "Open-source personal finance app",
    prs: [{ title: "PR #672", url: "https://github.com/flow-mn/flow/pull/672" }],
  },
  {
    repo: "ente-io/ente",
    repoUrl: "https://github.com/ente-io/ente",
    users: "27k+ stars",
    context: "Fully open-source, end-to-end encrypted photo backup & locker",
    prs: [
      {
        title: "PR #10807",
        url: "https://github.com/ente-io/ente/pull/10807",
        status: "review",
      },
    ],
  },
];

export const education = {
  school: "Rajalakshmi Engineering College, Chennai",
  schoolUrl: "https://www.rajalakshmi.org/",
  degree: "B.E. Computer Science and Engineering",
  university: "Anna University",
  period: "Nov 2022 — May 2026",
  cgpa: "8.28",
} as const;

export type Social = { label: string; handle: string; url: string };

export const socials: Social[] = [
  { label: "GitHub", handle: "r4khul", url: "https://github.com/r4khul" },
  { label: "X / Twitter", handle: "@r4khul", url: "https://x.com/r4khul" },
  { label: "LinkedIn", handle: "in/rakhul", url: "https://www.linkedin.com/in/rakhul/" },
  { label: "LeetCode", handle: "r4khul", url: "https://leetcode.com/r4khul" },
];
