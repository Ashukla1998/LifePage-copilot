import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Deep Dive",
  description: "Explore a career step by step and calculate your Dream Index.",
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
