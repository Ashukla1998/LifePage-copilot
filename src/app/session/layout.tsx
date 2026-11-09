import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sessions",
  description: "LifePage sessions.",
};

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
