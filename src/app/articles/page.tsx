import type { Metadata } from "next";
import { cache } from "react";
import { fetchProfileArticle, fetchProfileQuestions } from "@/lib/articleApi";
import { markdownTitle, parseMarkdown } from "@/lib/articles";
import ArticleView from "./ArticleView";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

// Shared by generateMetadata and the page so each request hits the API once
const loadArticle = cache(async (profileId: string) => {
  try {
    return await fetchProfileArticle(profileId);
  } catch (err) {
    console.error("Server article load failed:", err);
    return null;
  }
});

const loadQuestions = cache(async (profileId: string) => {
  try {
    return await fetchProfileQuestions(profileId);
  } catch (err) {
    console.error("Server questions load failed:", err);
    return null;
  }
});

const summarize = (text: string, max = 160) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const profileId = first(params.profileid);
  const fieldOfStudy = first(params.fieldOfStudy);
  const topic = first(params.topic);

  if (profileId) {
    const article = await loadArticle(profileId);
    if (!article) return {};
    const title = markdownTitle(article.markdown) ?? `${topic || "Career"} story`;
    const intro = parseMarkdown(article.markdown, { isAi: false, profileId })[0]?.content[0]?.text ?? "";
    const description = intro ? summarize(intro.replace(/\s+/g, " ")) : undefined;
    return { title, description, openGraph: { title, description, type: "article" } };
  }

  if (fieldOfStudy) {
    const title = `${fieldOfStudy} – Career Guide`;
    const description = `Education, skills, positives, challenges and a day in the life of a career in ${fieldOfStudy}.`;
    return { title, description, openGraph: { title, description } };
  }

  return {};
}

export default async function ArticlesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const profileId = first(params.profileid);
  const fieldOfStudy = profileId ? "" : first(params.fieldOfStudy);
  const topic = first(params.topic);

  // Advisor stories render on the server; AI articles are generated in the browser (~30s)
  const [initialArticle, initialQuestions] = profileId
    ? await Promise.all([loadArticle(profileId), loadQuestions(profileId)])
    : [null, null];

  return (
    <ArticleView
      key={profileId || fieldOfStudy || "none"}
      profileId={profileId}
      fieldOfStudy={fieldOfStudy}
      topic={topic}
      initialArticle={initialArticle}
      initialQuestions={initialQuestions}
    />
  );
}
