// Pure helpers for the career article / self-assessment flow (src/app/articles).
// Kept free of React and imports so they can be unit tested with `node --test`.

const BUCKET_BASE = "https://storage.googleapis.com/lifepage-video-android";

export interface QuestionDetail {
  sessionid?: string;
  que_category: string;
  question: string;
  percentage: string | number;
}

export interface ContentItem {
  subtitle: string;
  text: string;
  image?: string;
}

export interface ContentSection {
  id: string;
  title: string;
  content: ContentItem[];
}

export interface QuestionResponse {
  category: string;
  weight: number;
  value: number;
}

export interface Step {
  section: number;
  item: number;
}

export const DEFAULT_RATING = 5;

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Splits an article into sections:
 *   "# Title"   -> intro section (no images)
 *   "## Name"   -> category section; its items get step images from here on
 *   "### Sub"   -> new item inside the current section
 *   other lines -> paragraphs of the current item
 * Advisor articles use the session's numbered bucket images (starting at -0004, skipping one
 * between categories); AI articles use a static image.
 */
export function parseMarkdown(markdown: string, opts: { isAi: boolean; profileId: string }): ContentSection[] {
  const sections: ContentSection[] = [];
  let section: ContentSection | null = null;
  let item: ContentItem | null = null;
  let imageCounter = 4;
  let imageEnabled = false;

  const imageUrl = () =>
    `${BUCKET_BASE}/${opts.profileId}/${opts.profileId}-${String(imageCounter).padStart(4, "0")}.JPG`;

  const pushItem = () => {
    if (!item || !section) return;
    if (imageEnabled) {
      if (opts.isAi) {
        item.image = "/ai.jpg";
      } else {
        item.image = imageUrl();
        imageCounter += 1;
      }
    }
    section.content.push(item);
    item = null;
  };

  const finishSection = () => {
    pushItem();
    if (imageEnabled) imageCounter += 1;
  };

  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("# ") && !sections.length) {
      const title = line.slice(2);
      section = { id: slugify(title), title, content: [] };
      sections.push(section);
      continue;
    }

    if (line.startsWith("## ")) {
      if (section) finishSection();
      const title = line.slice(3).trim();
      imageEnabled = true;
      section = { id: slugify(title), title, content: [] };
      sections.push(section);
      continue;
    }

    if (line.startsWith("### ")) {
      pushItem();
      item = { subtitle: line.slice(4).trim(), text: "" };
      continue;
    }

    if (section) {
      item ??= { subtitle: "", text: "" };
      item.text += (item.text ? "\n\n" : "") + line;
    }
  }

  finishSection();
  return sections;
}

/** First "# Heading" of a markdown document, if any. */
export function markdownTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s*(.+)/m);
  return match ? match[1].trim() : null;
}

/** Normalises an API category ("A Day Of") for matching against section titles. */
const cleanCategory = (category: string) => category.toLowerCase().replace(/\bof\b/g, "").trim();

/** Questions whose category appears in the section title (e.g. "Skills" in "Skills Required"). */
export function questionsForSection(questions: QuestionDetail[], sectionTitle: string): QuestionDetail[] {
  const title = sectionTitle.trim().toLowerCase();
  return questions.filter((q) => title.includes(cleanCategory(q.que_category)));
}

/** The question asked at a step: one per item, reusing the first when a section has more items than questions. */
export function questionForStep(
  questions: QuestionDetail[],
  sections: ContentSection[],
  step: Step
): QuestionDetail | null {
  const section = sections[step.section];
  if (!section) return null;
  const related = questionsForSection(questions, section.title);
  if (!related.length) return null;
  return related[step.item < related.length ? step.item : 0];
}

export function questionText(category: string, question: string): string {
  const cat = category.toLowerCase();
  if (cat === `what is ${question.toLowerCase()}`) return `How much did you like ${question}?`;
  if (cat === "education") return `How much did you like to study ${question}?`;
  if (cat === "skills") return `How much did you like to develop ${question}?`;
  if (cat === "challenges") return `Are you prepared to face ${question}?`;
  if (cat === "a day of") return `How much did you like a day in ${question}?`;
  return `How much did you like ${question}?`;
}

/** Share of items completed, counting the current one (0 on the very first item). */
export function progressFraction(sections: ContentSection[], step: Step): number {
  if (!sections[step.section]) return 0;
  if (step.section === 0 && step.item === 0) return 0;
  const total = sections.reduce((sum, s) => sum + s.content.length, 0);
  if (!total) return 0;
  const before = sections.slice(0, step.section).reduce((sum, s) => sum + s.content.length, 0);
  return (before + step.item + 1) / total;
}

export function isLastStep(sections: ContentSection[], step: Step): boolean {
  const section = sections[step.section];
  return !!section && step.section === sections.length - 1 && step.item === section.content.length - 1;
}

export function nextStep(sections: ContentSection[], step: Step): Step {
  const section = sections[step.section];
  if (!section) return step;
  if (step.item < section.content.length - 1) return { section: step.section, item: step.item + 1 };
  if (step.section < sections.length - 1) return { section: step.section + 1, item: 0 };
  return step;
}

export function prevStep(sections: ContentSection[], step: Step): Step {
  if (step.item > 0) return { section: step.section, item: step.item - 1 };
  if (step.section > 0) {
    const prev = sections[step.section - 1];
    return { section: step.section - 1, item: prev ? Math.max(prev.content.length - 1, 0) : 0 };
  }
  return step;
}

// Answers are identified by category + weight, which is what the DreamIndex API receives
const sameQuestion = (r: QuestionResponse, q: QuestionDetail) =>
  r.category === q.que_category && r.weight === Number(q.percentage);

export function findAnswer(responses: QuestionResponse[], question: QuestionDetail | null): number {
  if (!question) return DEFAULT_RATING;
  return responses.find((r) => sameQuestion(r, question))?.value ?? DEFAULT_RATING;
}

/** Returns a new list with the answer for `question` set to `value`. */
export function upsertAnswer(
  responses: QuestionResponse[],
  question: QuestionDetail,
  value: number
): QuestionResponse[] {
  const exists = responses.some((r) => sameQuestion(r, question));
  if (exists) return responses.map((r) => (sameQuestion(r, question) ? { ...r, value } : r));
  return [...responses, { category: question.que_category, weight: Number(question.percentage), value }];
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

const isFullUrl = (value: string) => /^https?:\/\//i.test(value);

/**
 * checksession returns a bare file name (e.g. "20181219-0001.mp4") that lives in the session's
 * bucket folder; full URLs (YouTube or otherwise) are used as they are.
 */
export function resolveVideoUrl(videofile: string, sessionid: string): string {
  if (!videofile) return "";
  if (isFullUrl(videofile)) return videofile;
  return `${BUCKET_BASE}/${sessionid}/${encodeURIComponent(videofile)}`;
}

/** Bucket videos also have a DASH rendition set at {sessionid}/video/stream.mpd. */
export function dashManifestUrl(videofile: string, sessionid: string): string {
  return videofile && !isFullUrl(videofile) ? `${BUCKET_BASE}/${sessionid}/video/stream.mpd` : "";
}
