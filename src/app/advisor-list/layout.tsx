import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose an Advisor",
  description: "Hear real stories from professionals or ask the AI career advisor.",
};

export default function AdvisorListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
