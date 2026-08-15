export const profile = {
  name: "Rakhul Prakash S B",
  handle: "r4khul",
  role: "Mobile Engineer · Flutter",
  location: "Chennai, India",
  timezone: "Asia/Kolkata",
  email: "rakhul2005@gmail.com",
  url: "https://rakhul.me",
  cal: "https://cal.com/r4khul/",
  resume: "/r4khul_resume.pdf",
  about: [
    "I'm Rakhul, a CS engineer who likes **building things that people actually use**.",
    "My focus is **mobile development with Flutter**, from architecture and performance to edge cases and deployment. I've worked on startup products, open-source projects, and real client apps, where **reliability matters more than demos**.",
    "I'm at my best when I can **take ownership**, learn fast, and turn messy problems into **solid, shippable software**.",
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
    period: "Feb 2026 - May 2026",
    location: "Chennai, India · IITM Incubated",
    status: "active",
    summary:
      "Owned development of 2 fintech apps, performance, scalable architecture, and measurable impact across payments, onboarding, and release pipelines.",
    highlights: [
      "Integrated **10+ data-intensive API endpoints** with caching & virtualization strategies, reducing latency",
      "Built CI/CD pipelines with Fastlane & GitHub Actions, **cutting release cycles by 50%+**",
      "Migrated payments from PayU to PhonePe Checkout SDK; shipped secure flows for gold/silver, mutual funds & SIPs",
      "Revamped onboarding & KYC with third-party verification APIs, **improving completion rates by 25%**",
      "**Reduced app size by 20MB** and achieved **consistent 60FPS+ rendering**",
      "**Resolved 45+ bugs**, shipped **10+ features**, and revamped legacy UI",
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
    items: ["VS Code", "Antigravity", "Windsurf", "Cursor", "Claude Code", "OpenCode", "Gemini CLI"],
  },
];

export type OssPr = {
  title: string;
  fullTitle: string;
  url: string;
  status?: "merged" | "review";
  description: string;
};

export type OssContribution = {
  slug: string;
  repo: string;
  repoUrl: string;
  stats: {
    users?: string;
    stars?: string;
    contributions?: string;
  };
  context: string;
  prs: OssPr[];
};

export const openSource: OssContribution[] = [
  {
    slug: "ente",
    repo: "ente-io/ente",
    repoUrl: "https://github.com/ente-io/ente",
    stats: { users: "400k+", stars: "27k+", contributions: "40+" },
    context: "Fully open-source, end-to-end encrypted photo backup & locker",
    prs: [
      {
        title: "PR #11427",
        fullTitle: "[mobile][photos] Add persistent video mute control",
        url: "https://github.com/ente-io/ente/pull/11427",
        status: "merged",
        description:
          "Adds persistent video mute toggle across app restarts and preloaded videos via event bus for both native and MediaKit video player engines.",
      },
      {
        title: "PR #11770",
        fullTitle: "Add deep linking for unconfigured home screen widgets",
        url: "https://github.com/ente-io/ente/pull/11770",
        status: "merged",
        description:
          "Adds deep linking support for unconfigured home screen widgets to navigate directly to widget setup instead of opening the main screen.",
      },
      {
        title: "PR #11848",
        fullTitle: "[mobile][photos] adjust SVG icon sizing in video editor bottom bar",
        url: "https://github.com/ente-io/ente/pull/11848",
        status: "merged",
        description:
          "Adjusts SVG icon sizing in the video editor bottom bar by removing internal margins to fix tiny and faint appearance.",
      },
      {
        title: "PR #12044",
        fullTitle: "[mobile][photos] Fix hero animation glitch when exiting the full-screen viewer",
        url: "https://github.com/ente-io/ente/pull/12044",
        status: "merged",
        description:
          "Fixes hero animation glitch when exiting the full-screen photo viewer for a smooth visual transition back to the grid.",
      },
      {
        title: "PR #12047",
        fullTitle: "[mobile][photos] native handling for network disconnections in payment webview",
        url: "https://github.com/ente-io/ente/pull/12047",
        status: "merged",
        description:
          "Adds native error handling and offline state indication for network disconnections during payment webview transactions.",
      },
      {
        title: "PR #12057",
        fullTitle: "[mobile][locker] show cached item count in drawer when offline",
        url: "https://github.com/ente-io/ente/pull/12057",
        status: "merged",
        description:
          "Displays cached item count in the navigation drawer when offline, giving users clear visibility into stored files without a network connection.",
      },
      {
        title: "PR #12097",
        fullTitle: "[mobile][photos] fix tune slider active track at neutral position in image editor",
        url: "https://github.com/ente-io/ente/pull/12097",
        status: "merged",
        description:
          "Fixes tune slider active track rendering at neutral position in the image editor to eliminate visual offset glitches.",
      },
      {
        title: "PR #12138",
        fullTitle: "[mobile][photos] fix ui clipping in BillingQuestionsWidget & improve FAQ parsing safety",
        url: "https://github.com/ente/ente/pull/12138",
        status: "merged",
        description:
          "Fixes UI clipping behavior and improves parsing safety for the billing FAQ modal sheet to prevent visual overflow and safely handle malformed data.",
      },
      {
        title: "PR #12165",
        fullTitle: "[mobile][photos] optimize timeline gallery lookups for large galleries",
        url: "https://github.com/ente/ente/pull/12165",
        status: "merged",
        description:
          "Replaces linear search with binary search for section lookups to resolve layout calculation bottlenecks in large galleries.",
      },
      {
        title: "PR #12199",
        fullTitle: "[mobile][photos] change selection menu action ordering and use platform-specific share icon",
        url: "https://github.com/ente/ente/pull/12199",
        status: "merged",
        description:
          "Updates the sequence of actions in the bottom selection bar to match a user-friendly flow and displays native share icons for iOS and Android.",
      },
      {
        title: "PR #12204",
        fullTitle: "[mobile][photos] disable page swiping while albums are selected",
        url: "https://github.com/ente/ente/pull/12204",
        status: "review",
        description:
          "Disables horizontal page swiping in the home tab bar while albums are selected in the Albums tab, matching the existing gallery swipe-to-select behavior.",
      },
    ],
  },
  {
    slug: "traccar-client",
    repo: "traccar/traccar-client",
    repoUrl: "https://github.com/traccar/traccar-client",
    stats: { users: "200k+", stars: "700+", contributions: "10+" },
    context: "Maintained by an MTS @ OpenAI & the founder of Traccar",
    prs: [
      {
        title: "PR #143",
        fullTitle: "Add QR scanner torch control using MobileScannerController",
        url: "https://github.com/traccar/traccar-client/pull/143",
        status: "merged",
        description:
          "Adds a flashlight toggle button to the QR scanner screen with proper MobileScannerController lifecycle management, making it easy to scan device codes in low-light environments.",
      },
      {
        title: "PR #144",
        fullTitle: "Improve permission denied error handling by providing direct access to app settings",
        url: "https://github.com/traccar/traccar-client/pull/144",
        status: "merged",
        description:
          "Integrates system app settings navigation using app_settings and improves user feedback when camera permission is denied on the QR scanner screen.",
      },
      {
        title: "PR #146",
        fullTitle: "Extend permission denied handling functionality to location toggle tracking in main screen",
        url: "https://github.com/traccar/traccar-client/pull/146",
        status: "merged",
        description:
          "Enhances location permission handling on the primary tracking screen by adding a direct action button to open OS app settings when location access is denied.",
      },
    ],
  },
  {
    slug: "lichess-mobile",
    repo: "lichess-org/mobile",
    repoUrl: "https://github.com/lichess-org/mobile",
    stats: { users: "2M+", stars: "2.5k+", contributions: "15+" },
    context: "Official Lichess mobile app written in Flutter",
    prs: [
      {
        title: "PR #3447",
        fullTitle: "Add Broadcast Widget For Android OS",
        url: "https://github.com/lichess-org/mobile/pull/3447",
        status: "merged",
        description:
          "Implements a native, theme-aware home screen widget (BroadcastWidgetProvider) for Android to stream live Lichess broadcasts with asynchronous JSON fetching and background updates.",
      },
      {
        title: "PR #3478",
        fullTitle: "Use sentence case for messages and chat",
        url: "https://github.com/lichess-org/mobile/pull/3478",
        status: "merged",
        description:
          "Configures text inputs in game chat and direct messaging screens to automatically use sentence-case capitalization for improved typing UX on mobile devices.",
      },
      {
        title: "PR #3503",
        fullTitle: "Add blindfold mode to offline computer and over-the-board games",
        url: "https://github.com/lichess-org/mobile/pull/3503",
        status: "review",
        description:
          "Adds blindfold mode toggle and unified settings overlay to offline computer games and over-the-board chess matches.",
      },
    ],
  },
  {
    slug: "zest",
    repo: "darkmoonight/Zest",
    repoUrl: "https://github.com/darkmoonight/Zest",
    stats: { users: "8k+", stars: "400+", contributions: "12+" },
    context: "Maintained by an SDE @ Innopolis",
    prs: [
      {
        title: "PR #125",
        fullTitle: "fix(lang-settings): resolve issue in language dialog",
        url: "https://github.com/darkmoonight/Zest/pull/125",
        status: "merged",
        description:
          "Fixes a bug where the language dialog failed to open by changing GetX locale comparison from object equality to matching languageCode strings with fallbacks.",
      },
      {
        title: "PR #127",
        fullTitle: "fix: resolve duplicate todo problem due to race condition between watcher stream and manual updates",
        url: "https://github.com/darkmoonight/Zest/pull/127",
        status: "merged",
        description:
          "Eliminates duplicate task creation caused by a race condition between real-time database watcher streams and manual update dispatches.",
      },
      {
        title: "PR #128",
        fullTitle: "feat: add badges of github downloads and playstore downloads to the readme",
        url: "https://github.com/darkmoonight/Zest/pull/128",
        status: "merged",
        description:
          "Adds dynamic SVG release download counter badges from GitHub releases and Google Play Store to the project README.",
      },
      {
        title: "PR #129",
        fullTitle: "fix: setState Assertion Error in Calendar View",
        url: "https://github.com/darkmoonight/Zest/pull/129",
        status: "merged",
        description:
          "Fixes Flutter assertion error thrown when an async callback was passed directly to setState inside calendar chip selection.",
      },
    ],
  },
  {
    slug: "flow",
    repo: "flow-mn/flow",
    repoUrl: "https://github.com/flow-mn/flow",
    stats: { users: "4k+", stars: "450+", contributions: "5+" },
    context: "Open-source personal finance app",
    prs: [
      {
        title: "PR #672",
        fullTitle: "feat: SelectCategorySheet now fetches categories from a provider and includes create button",
        url: "https://github.com/flow-mn/flow/pull/672",
        status: "merged",
        description:
          "Refactors SelectCategorySheet to fetch items via a provider and adds inline category creation directly inside the transaction flow.",
      },
    ],
  },
];

export function getOssContribution(slug: string): OssContribution | undefined {
  return openSource.find(
    (c) => c.slug === slug || c.repo.replace("/", "-").toLowerCase() === slug.toLowerCase()
  );
}

export function getOssContributions(): OssContribution[] {
  return openSource;
}

export const education = {
  school: "Rajalakshmi Engineering College, Chennai",
  schoolUrl: "https://www.rajalakshmi.org/",
  degree: "B.E. Computer Science and Engineering",
  university: "Anna University",
  period: "Nov 2022 - May 2026",
  cgpa: "8.28",
} as const;

export type Social = { label: string; handle: string; url: string };

export const socials: Social[] = [
  { label: "GitHub", handle: "r4khul", url: "https://github.com/r4khul" },
  { label: "X / Twitter", handle: "@r4khul", url: "https://x.com/r4khul" },
  { label: "LinkedIn", handle: "in/rakhul", url: "https://www.linkedin.com/in/rakhul/" },
  { label: "LeetCode", handle: "r4khul", url: "https://leetcode.com/r4khul" },
];
