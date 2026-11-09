import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Duels",
  description: "Pick between two careers, round after round, to discover which path suits you.",
};

export default function CareerDuelsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
