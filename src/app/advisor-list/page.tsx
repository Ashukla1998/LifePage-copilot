import type { Metadata } from "next";
import AdvisorList from "./AdvisorListView";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const career = (await searchParams).career;
  const name = (Array.isArray(career) ? career[0] : career)?.trim();
  if (!name) return {};
  return {
    title: `${name} Advisors`,
    description: `Hear real stories from ${name} professionals, or ask the AI career advisor about ${name}.`,
  };
}

export default function AdvisorListPage() {
  return <AdvisorList />;
}
