import { API_BASE } from "@/lib/api";
import type { QuestionDetail } from "@/lib/articles";

// Advisor-article requests, used by the server page (first render, metadata) and as a client fallback

export interface ProfileArticle {
  markdown: string;
  videofile: string;
}

async function postJson(path: string, body: unknown, init?: RequestInit) {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) throw new Error(`${path} failed with ${res.status}`);
  return res.json();
}

export async function fetchProfileArticle(profileId: string, init?: RequestInit): Promise<ProfileArticle | null> {
  const data = await postJson("checksession", { id: profileId }, init);
  const row = data?.success === 1 ? data.data?.[0] : null;
  return row?.content ? { markdown: row.content, videofile: row.videofile || "" } : null;
}

export async function fetchProfileQuestions(profileId: string, init?: RequestInit): Promise<QuestionDetail[]> {
  const data = await postJson("questiondetails", { id: profileId }, init);
  return data?.success === 1 ? data.data?.[0]?.array_to_json ?? [] : [];
}
