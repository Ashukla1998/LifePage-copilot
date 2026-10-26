import type { Metadata } from "next";
import CompareCareers from "./CompareView";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const career = (await searchParams).career;
  const name = (Array.isArray(career) ? career[0] : career)?.trim();
  if (!name) return {};
  return {
    title: `Compare ${name} with Other Careers`,
    description: `See how ${name} compares with similar careers: education, skills, positives and challenges.`,
  };
}

export default function ComparePage() {
  return <CompareCareers />;
}
