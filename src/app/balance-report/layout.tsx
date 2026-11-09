import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Balance Report",
  description: "Your LifePage balance statement.",
};

export default function BalanceReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
