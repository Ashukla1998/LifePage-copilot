import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Self Assessment Certificate",
  description: "Your LifePage career self-assessment result.",
};

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
