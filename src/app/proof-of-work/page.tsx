import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { ProofDashboard } from "@/components/proof-of-work/proof-dashboard";

export const metadata: Metadata = {
  title: `Proof of Work | ${profile.name}`,
  description: "Shipped mobile products, measurable production impact, and open-source contributions by Rakhul Prakash.",
};

export default function ProofOfWorkPage() {
  return <ProofDashboard />;
}
