// Run with `npm test` (Node's built-in test runner; Node strips the TypeScript types).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_RATING,
  dashManifestUrl,
  findAnswer,
  getYouTubeEmbedUrl,
  isLastStep,
  markdownTitle,
  nextStep,
  parseMarkdown,
  prevStep,
  progressFraction,
  questionForStep,
  questionText,
  questionsForSection,
  resolveVideoUrl,
  upsertAnswer,
  type QuestionDetail,
} from "../src/lib/articles.ts";

const BUCKET = "https://storage.googleapis.com/lifepage-video-android";

const ARTICLE = `# The Journey of a Baker

Intro paragraph one.
Intro paragraph two.

## What Is Bakery
### Origins
Some history.

## Education
### Degree
Study culinary arts.
### Training
Work in hotels.

## A Day Of a Baker
Wake up early.`;

test("parseMarkdown splits title, categories and items", () => {
  const sections = parseMarkdown(ARTICLE, { isAi: false, profileId: "S1" });

  assert.deepEqual(sections.map((s) => s.title), [
    "The Journey of a Baker",
    "What Is Bakery",
    "Education",
    "A Day Of a Baker",
  ]);
  assert.equal(sections[0].id, "the-journey-of-a-baker");
  assert.equal(sections[0].content[0].text, "Intro paragraph one.\n\nIntro paragraph two.");
  assert.equal(sections[0].content[0].image, undefined, "intro has no image");
  assert.deepEqual(sections[2].content.map((c) => c.subtitle), ["Degree", "Training"]);
  assert.equal(sections[3].content[0].subtitle, "", "text without ### starts an untitled item");
});

test("parseMarkdown numbers advisor images from -0004 and skips one between categories", () => {
  const sections = parseMarkdown(ARTICLE, { isAi: false, profileId: "S1" });
  const images = sections.flatMap((s) => s.content.map((c) => c.image)).filter(Boolean);

  assert.deepEqual(images, [
    `${BUCKET}/S1/S1-0004.JPG`, // What Is: Origins
    `${BUCKET}/S1/S1-0006.JPG`, // Education: Degree (0005 skipped at the category change)
    `${BUCKET}/S1/S1-0007.JPG`, // Education: Training
    `${BUCKET}/S1/S1-0009.JPG`, // A Day Of
  ]);
});

test("parseMarkdown uses the static image for AI articles", () => {
  const sections = parseMarkdown(ARTICLE, { isAi: true, profileId: "" });
  const images = sections.flatMap((s) => s.content.map((c) => c.image)).filter(Boolean);
  assert.ok(images.length > 0);
  assert.ok(images.every((src) => src === "/ai.jpg"));
});

test("markdownTitle reads the first heading", () => {
  assert.equal(markdownTitle(ARTICLE), "The Journey of a Baker");
  assert.equal(markdownTitle("no heading here"), null);
});

const QUESTIONS: QuestionDetail[] = [
  { que_category: "Education", question: "Culinary Arts", percentage: 10 },
  { que_category: "Education", question: "Hotel Management", percentage: 5 },
  { que_category: "A Day Of", question: "a Baker", percentage: 3 },
  { que_category: "What is Professional Photography", question: "Professional Photography", percentage: 7 },
];

test("questionsForSection matches categories against section titles", () => {
  assert.equal(questionsForSection(QUESTIONS, "Education").length, 2);
  assert.equal(questionsForSection(QUESTIONS, "A Day Of a Baker").length, 1, '"of" is ignored');
  assert.equal(questionsForSection(QUESTIONS, "Skills").length, 0);
});

test('questionsForSection only drops "of" as a whole word (not inside "professional")', () => {
  const related = questionsForSection(QUESTIONS, "What Is Professional Photography");
  assert.deepEqual(related.map((q) => q.question), ["Professional Photography"]);
});

test("questionForStep picks one question per item and reuses the first when items outnumber questions", () => {
  const sections = parseMarkdown(ARTICLE, { isAi: false, profileId: "S1" });
  assert.equal(questionForStep(QUESTIONS, sections, { section: 2, item: 1 })?.question, "Hotel Management");
  assert.equal(questionForStep(QUESTIONS, sections, { section: 3, item: 0 })?.question, "a Baker");
  assert.equal(questionForStep(QUESTIONS, sections, { section: 0, item: 0 }), null);
  assert.equal(questionForStep(QUESTIONS, sections, { section: 9, item: 0 }), null);
});

test("questionText phrases the rating question by category", () => {
  assert.equal(questionText("Education", "Culinary Arts"), "How much did you like to study Culinary Arts?");
  assert.equal(questionText("Skills", "Patience"), "How much did you like to develop Patience?");
  assert.equal(questionText("Challenges", "Long Hours"), "Are you prepared to face Long Hours?");
  assert.equal(questionText("A Day Of", "a Baker"), "How much did you like a day in a Baker?");
  assert.equal(questionText("Positives", "Creativity"), "How much did you like Creativity?");
});

test("progress and step navigation walk every item in order", () => {
  const sections = parseMarkdown(ARTICLE, { isAi: false, profileId: "S1" });
  // 1 intro + 1 + 2 + 1 = 5 items
  let step = { section: 0, item: 0 };
  assert.equal(progressFraction(sections, step), 0);

  const visited = [step];
  while (!isLastStep(sections, step)) {
    step = nextStep(sections, step);
    visited.push(step);
  }
  assert.deepEqual(visited, [
    { section: 0, item: 0 },
    { section: 1, item: 0 },
    { section: 2, item: 0 },
    { section: 2, item: 1 },
    { section: 3, item: 0 },
  ]);
  assert.equal(progressFraction(sections, step), 1);
  assert.deepEqual(nextStep(sections, step), step, "stays on the last item");

  assert.deepEqual(prevStep(sections, { section: 3, item: 0 }), { section: 2, item: 1 });
  assert.deepEqual(prevStep(sections, { section: 0, item: 0 }), { section: 0, item: 0 });
  assert.equal(progressFraction(sections, { section: 2, item: 0 }), 3 / 5);
});

test("answers are stored per question and default to the middle rating", () => {
  const [q1, q2] = QUESTIONS;
  assert.equal(findAnswer([], q1), DEFAULT_RATING);
  assert.equal(findAnswer([], null), DEFAULT_RATING);

  const once = upsertAnswer([], q1, 8);
  assert.deepEqual(once, [{ category: "Education", weight: 10, value: 8 }]);

  const updated = upsertAnswer(upsertAnswer(once, q2, 3), q1, 9);
  assert.equal(updated.length, 2);
  assert.equal(findAnswer(updated, q1), 9);
  assert.equal(findAnswer(updated, q2), 3);
  assert.equal(once[0].value, 8, "does not mutate the previous list");
});

test("video helpers resolve bucket files, DASH manifests and YouTube links", () => {
  assert.equal(resolveVideoUrl("", "S1"), "");
  assert.equal(resolveVideoUrl("S1.mp4", "S1"), `${BUCKET}/S1/S1.mp4`);
  assert.equal(resolveVideoUrl("https://youtu.be/dQw4w9WgXcQ", "S1"), "https://youtu.be/dQw4w9WgXcQ");

  assert.equal(dashManifestUrl("S1.mp4", "S1"), `${BUCKET}/S1/video/stream.mpd`);
  assert.equal(dashManifestUrl("https://youtu.be/dQw4w9WgXcQ", "S1"), "");

  assert.equal(getYouTubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(getYouTubeEmbedUrl(`${BUCKET}/S1/S1.mp4`), null);
});
