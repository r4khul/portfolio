import { getProject, type Project } from "@/lib/projects";
import { profile, experience } from "@/data/profile";
import { ossSpotlights } from "@/data/proof-of-work-oss";

export const proofProjects = {
  unfilter: getProject("unfilter")!,
  mrcas: getProject("mrcas-cafe")!,
  thrifty: getProject("thrifty")!,
} satisfies Record<string, Project>;

export const proofMetrics = [
  { value: "200+", label: "active Unfilter users" },
  { value: "95%", label: "framework detection accuracy" },
  { value: "60 FPS+", label: "consistent rendering" },
  { value: "50%+", label: "faster release cycles" },
  { value: "45+", label: "production bugs resolved" },
  { value: "69", label: "automated tests in Thrifty" },
] as const;

export const productionHighlights = experience[0].highlights;
export { ossSpotlights };
export const proofProfile = profile;
