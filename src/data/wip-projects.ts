export type WipProject = {
  title: string;
  slug: string;
  repoUrl: string;
  description: string;
  type: string;
  year: string;
  cover?: string;
  stack: string[];
};

export const wipProjects: WipProject[] = [
  {
    title: "OneCompress",
    slug: "onecompress",
    repoUrl: "https://github.com/escapebranch/onecompress",
    description:
      "High-performance, local-first media compression app built with Flutter and Rust. Pairs a fluid Material 3 UI with a multi-threaded Rust core on-device.",
    type: "Open Source · Core Engine",
    year: "2026",
    cover: "/images/projects/onecompress-banner.png",
    stack: ["Flutter", "Rust", "Dart FFI", "Material 3", "Multi-threading"],
  },
];
