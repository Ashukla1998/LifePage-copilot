import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Careers",
  description: "Compare careers side by side: education, skills, positives and challenges.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
