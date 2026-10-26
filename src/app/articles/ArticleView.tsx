"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import AdaptiveVideo from "@/components/AdaptiveVideo";
import { API_BASE } from "@/lib/api";
import { jakarta } from "@/lib/fonts";
import { fetchProfileArticle, fetchProfileQuestions, type ProfileArticle } from "@/lib/articleApi";
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
  resolveVideoUrl,
  upsertAnswer,
  type ContentSection,
  type QuestionDetail,
  type QuestionResponse,
  type Step,
} from "@/lib/articles";
import AvatarPanel from "./components/AvatarPanel";
import QuestionCard from "./components/QuestionCard";
import StepTracker from "./components/StepTracker";

interface AiPercentageItem {
  category: string;
  question: string;
  percentage: string | number;
}

interface ArticleViewProps {
  /** Advisor story (?profileid=…); empty for AI articles */
  profileId: string;
  /** AI article topic (?fieldOfStudy=…); ignored when profileId is set */
  fieldOfStudy: string;
  /** Career name passed along by the advisor list (?topic=…) */
  topic: string;
  /** Advisor article and questions loaded on the server; null means the browser loads them */
  initialArticle: ProfileArticle | null;
  initialQuestions: QuestionDetail[] | null;
}

const DEFAULT_TITLE = "Deep dive into Your Career";
const AI_WAIT_SECONDS = 30;

// The page remounts this component (via `key`) whenever the article in the URL changes,
// so every piece of state below belongs to a single article.
export default function ArticleView({ profileId, fieldOfStudy, topic, initialArticle, initialQuestions }: ArticleViewProps) {
  const isAi = !profileId && fieldOfStudy !== "";

  const [articleTitle, setArticleTitle] = useState(
    () => (initialArticle && markdownTitle(initialArticle.markdown)) || DEFAULT_TITLE
  );
  const [sections, setSections] = useState<ContentSection[]>(() =>
    initialArticle ? parseMarkdown(initialArticle.markdown, { isAi: false, profileId }) : []
  );
  const [videofile, setVideofile] = useState(initialArticle?.videofile ?? "");
  const [questions, setQuestions] = useState<QuestionDetail[]>(initialQuestions ?? []);

  const [step, setStep] = useState<Step>({ section: 0, item: 0 });
  const [rating, setRating] = useState(DEFAULT_RATING);
  const answers = useRef<QuestionResponse[]>([]);

  const [lookedUpTopic, setLookedUpTopic] = useState("");
  const [profileImageSrc, setProfileImageSrc] = useState("/choices.jpg");
  const [savedName, setSavedName] = useState("");
  const [dreamIndexScore, setDreamIndexScore] = useState<number | null>(null);
  const [certificateUrl, setCertificateUrl] = useState("");

  const [isAiLoading, setIsAiLoading] = useState(isAi);
  const [countdown, setCountdown] = useState(AI_WAIT_SECONDS);

  const careerName = topic || lookedUpTopic || (isAi ? fieldOfStudy : "");

  // 🔹 Load the article, questions and avatar
  useEffect(() => {
    let cancelled = false;

    if (!sessionStorage.getItem("lp_session_started")) {
      localStorage.removeItem("hasUploaded");
      localStorage.removeItem("hasCalculated");
      sessionStorage.setItem("lp_session_started", "true");
    }

    // Proxied through our own origin: the bucket has no CORS headers, which blocks the
    // crossOrigin <img> and the html2canvas download
    const showAvatar = (avatarPath: string) => {
      if (cancelled) return;
      const path = avatarPath.split("/").map(encodeURIComponent).join("/");
      setProfileImageSrc(`/api/bucket-image/${path}?v=${Date.now()}`);
    };

    const post = (path: string, body: unknown) =>
      fetch(`${API_BASE}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => res.json());

    const loadAiArticle = async () => {
      try {
        // A short description shows while the full article is generated (~30s)
        post("getDescription", { name: fieldOfStudy })
          .then((result) => {
            if (!cancelled && result.success === 1 && result.data) setArticleTitle(result.data);
          })
          .catch((err) => console.error("Article description error:", err));

        const data = await post("testing", { career_name: fieldOfStudy });
        if (cancelled || data.success !== 1) return;

        const markdown: string = data.article.data.replace(/\\n/g, "\n");
        const title = markdownTitle(markdown);
        if (title) setArticleTitle(title);
        setSections(parseMarkdown(markdown, { isAi: true, profileId: "" }));
        setQuestions(
          data.article.percentage.map((item: AiPercentageItem) => ({
            que_category: item.category,
            question: item.question,
            percentage: item.percentage,
          }))
        );
      } catch (err) {
        console.error("AI article error:", err);
      } finally {
        if (!cancelled) setIsAiLoading(false);
      }
    };

    // Normally loaded on the server; this covers a failed server request
    const loadProfileArticle = async () => {
      try {
        const [article, profileQuestions] = await Promise.all([
          initialArticle ? Promise.resolve(initialArticle) : fetchProfileArticle(profileId),
          initialQuestions ? Promise.resolve(initialQuestions) : fetchProfileQuestions(profileId),
        ]);
        if (cancelled) return;
        if (!initialArticle && article) {
          setArticleTitle(markdownTitle(article.markdown) || DEFAULT_TITLE);
          setSections(parseMarkdown(article.markdown, { isAi: false, profileId }));
          setVideofile(article.videofile);
        }
        if (!initialQuestions) setQuestions(profileQuestions);
      } catch (err) {
        console.error("Article load error:", err);
      }
    };

    const generateAvatar = (name: string) => {
      const prompt = `Create a high-quality 3D animated character illustration representing a professional ${name}...`;
      // The API responds only after the image is generated and saved, and returns the updated session row
      post("avatar", { careerName: name, prompt, session_id: profileId })
        .then((data) => {
          const avatarPath = data?.data?.[0]?.avatar;
          if (data.success === 1 && avatarPath) showAvatar(avatarPath);
          else console.error("Avatar generation failed:", data?.message, data?.error);
        })
        .catch((err) => console.error("Avatar API error:", err));
    };

    const loadAvatar = () => {
      if (isAi) {
        post("generateCareerAvatar", { career_name: fieldOfStudy })
          .then((data) => {
            if (data.success && data.avatar) showAvatar(data.avatar);
          })
          .catch((err) => console.error("Career avatar error:", err));
        return;
      }

      post("getAvatar", { id: profileId })
        .then((data) => {
          const row = data?.data?.[0];
          // Direct links don't carry ?topic=; getAvatar returns it for the session
          const name: string = topic || row?.topic?.trim() || "";
          if (!topic && name && !cancelled) setLookedUpTopic(name);

          if (data.success === 1 && row?.avatar) showAvatar(row.avatar);
          else if (name) generateAvatar(name);
        })
        .catch((err) => console.error("Avatar lookup error:", err));
    };

    if (isAi) {
      loadAiArticle();
      loadAvatar();
    } else if (profileId) {
      loadProfileArticle();
      loadAvatar();
    }

    // Prevent the default right-click menu on article pages
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      cancelled = true;
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isAi, profileId, fieldOfStudy, topic, initialArticle, initialQuestions]);

  // 🔹 AI generation countdown
  useEffect(() => {
    if (!isAiLoading) return;
    const interval = setInterval(() => setCountdown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [isAiLoading]);

  const currentQuestion = questionForStep(questions, sections, step);

  const saveCurrentAnswer = () => {
    if (currentQuestion) answers.current = upsertAnswer(answers.current, currentQuestion, rating);
  };

  const goTo = (target: Step) => {
    saveCurrentAnswer();
    setStep(target);
    setRating(findAnswer(answers.current, questionForStep(questions, sections, target)));
  };

  const updateAvatarType = () => {
    const userid = sessionStorage.getItem("lp_userid");
    if (!userid) return;
    const which_avatar =
      localStorage.getItem("hasUploaded") === "true" ? "personal_with_self_assessment" : "generic_with_self_assessment";

    fetch(`${API_BASE}/update_user_event`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid, which_avatar }),
    }).catch((err) => console.error("Tracking error:", err));
  };

  const calculateSelfAssessment = async () => {
    saveCurrentAnswer();
    if (!isLastStep(sections, step)) return;

    try {
      const res = await fetch(`${API_BASE}/DreamIndex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxScore: 10, questions: answers.current }),
      });
      const data = await res.json();
      if (data.success !== 1) return;

      const score = data.data.overall_percentage;
      setDreamIndexScore(score);
      localStorage.setItem("hasCalculated", "true");
      updateAvatarType();

      const params = new URLSearchParams({
        name: savedName || "Career Seeker",
        career: careerName,
        score: `${score}%`,
        image: profileImageSrc.split("?")[0],
        profileid: profileId,
        fieldOfStudy: isAi ? fieldOfStudy : "",
      });
      setCertificateUrl(`/certificate?${params.toString()}`);
    } catch (err) {
      console.error("Calculation Error", err);
    }
  };

  const section = sections[step.section];
  const activeContent = section?.content[step.item];
  const percent = Math.round(progressFraction(sections, step) * 100);
  const isFirstStep = step.section === 0 && step.item === 0;

  const videoUrl = resolveVideoUrl(videofile, profileId);
  const dashUrl = dashManifestUrl(videofile, profileId);
  const youTubeEmbedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="box-border flex flex-1 w-full flex-col bg-[linear-gradient(180deg,#f4f7fb_0%,#f8f9fb_55%,#fbf8f4_100%)]">
      <Navbar />

      <main className={`mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 lg:px-8 ${jakarta.className}`}>
        <div className="grid grid-cols-[340px_1fr] items-start gap-8 max-[1024px]:grid-cols-1">
          <AvatarPanel
            careerName={careerName}
            imageSrc={profileImageSrc}
            dreamIndexScore={dreamIndexScore}
            savedName={savedName}
            onSaveName={setSavedName}
          />

          <section className="box-border rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] sm:p-8">
            {!certificateUrl ? (
              <div>
                {isAiLoading && (
                  <div
                    role="status"
                    className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-100 bg-[#fdf6ec] p-4 text-sm font-medium text-[#8a5a1c]"
                  >
                    <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#C9822B] border-t-transparent" />
                    <span>
                      AI is generating your career insights&hellip; please wait
                      <span className="ml-1 font-bold text-[#C9822B]">({countdown}s)</span>
                    </span>
                  </div>
                )}

                <StepTracker sections={sections} step={step} />

                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span className="text-gray-500">Your progress</span>
                  <span className="text-[#C9822B]">{percent}%</span>
                </div>
                <div
                  className="mb-8 h-2 overflow-hidden rounded-full bg-gray-100"
                  role="progressbar"
                  aria-label="Article progress"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#C9822B] transition-all duration-600"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {activeContent && !activeContent.image && (
                  <h1 className="mb-5 text-2xl font-extrabold leading-snug tracking-[-0.01em] text-gray-900 max-sm:text-[20px]">
                    {articleTitle}
                  </h1>
                )}

                <div className="mx-auto w-full max-w-[760px]">
                  {activeContent?.image && (
                    <div className="relative mb-2">
                      {isAi && (
                        <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white">
                          <span className="rounded-full bg-[#C9822B] px-2 py-0.5 text-[10px] uppercase tracking-wider">
                            {section?.title}
                          </span>
                          <span className="truncate">{activeContent.subtitle}</span>
                        </div>
                      )}
                      <div className={`grid items-center gap-4 ${videoUrl ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                        {/* Career video: adaptive DASH stream from the bucket, or a YouTube embed */}
                        {videoUrl && (
                          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-md">
                            {youTubeEmbedUrl ? (
                              <iframe
                                src={youTubeEmbedUrl}
                                title="Career Video"
                                className="h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <AdaptiveVideo dashUrl={dashUrl} mp4Url={videoUrl} className="h-full w-full object-contain" />
                            )}
                          </div>
                        )}

                        <div className="flex h-full w-full items-center justify-center">
                          <Image
                            src={activeContent.image}
                            width={1280}
                            height={720}
                            sizes="(min-width: 1024px) 760px, 100vw"
                            className={`block w-full rounded-2xl object-contain shadow-md ${videoUrl ? "aspect-video max-h-[400px]" : "h-auto max-h-[500px]"}`}
                            alt={activeContent.subtitle || section?.title || "Step visual"}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeContent && (
                    <article className="mt-6 text-left">
                      {activeContent.subtitle && (
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                          <span className="h-5 w-1 rounded-full bg-[#C9822B]" />
                          {activeContent.subtitle}
                        </h3>
                      )}
                      <p className="whitespace-pre-wrap text-[15px] leading-[1.85] text-gray-600">{activeContent.text}</p>
                    </article>
                  )}

                  {currentQuestion && <QuestionCard question={currentQuestion} value={rating} onChange={setRating} />}
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => goTo(prevStep(sections, step))}
                    className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-900 hover:bg-gray-900 hover:text-white ${isFirstStep ? "invisible" : "visible"}`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  {!isLastStep(sections, step) ? (
                    <button
                      type="button"
                      onClick={() => goTo(nextStep(sections, step))}
                      disabled={!sections.length}
                      className="group inline-flex items-center gap-2 rounded-full bg-[#C9822B] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#b4721f] hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={calculateSelfAssessment}
                      className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9822B] to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_-8px_rgba(201,130,43,0.8)] transition hover:-translate-y-0.5"
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#C9822B]/30" />
                      <Sparkles className="relative h-4 w-4" />
                      <span className="relative">Calculate Self Assessment</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <iframe
                src={certificateUrl}
                className="h-[800px] w-full rounded-2xl border-none bg-white"
                title="Self Assessment Certificate"
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
