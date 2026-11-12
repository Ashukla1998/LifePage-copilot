"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Camera,
  ArrowRight,
  Award,
  BookOpen,
  ChevronDown,
  Clock,
  CloudUpload,
  Film,
  GraduationCap,
  Info,
  Link2,
  Plus,
  Sparkles,
  Trash2,
  TriangleAlert,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { getYouTubeEmbedUrl } from "@/lib/articles";

interface Subheading {
  id: string;
  title: string;
  body: string;
}

interface CategoryContent {
  scope: string;
  subheadings: Subheading[];
}

type CategoryKey = "intro" | "education" | "challenges" | "positives" | "dayInLife";

const CATEGORIES: { key: CategoryKey; title: string; description: string; icon: LucideIcon }[] = [
  {
    key: "intro",
    title: "Introducing the Career",
    description: "The scope, core purpose, and mandate of the role.",
    icon: BookOpen,
  },
  {
    key: "education",
    title: "Education & Qualification",
    description: "Foundational qualifications, exam tracks, and recommended courses.",
    icon: GraduationCap,
  },
  {
    key: "challenges",
    title: "Challenges & Realities",
    description: "The pressures, trade-offs, and difficulties of the job.",
    icon: TriangleAlert,
  },
  {
    key: "positives",
    title: "Positives & Rewards",
    description: "The impact, growth, and rewards that make it worthwhile.",
    icon: Award,
  },
  {
    key: "dayInLife",
    title: "A Day in the Life",
    description: "From the first task of the morning to the end of the day.",
    icon: Clock,
  },
];

interface ExperienceDraft {
  careerTitle: string;
  domain: string;
  authorName: string;
  designation: string;
  yearsExp: string;
  summary: string;
  categories: Record<CategoryKey, CategoryContent>;
  videoUrl: string;
}

const SUMMARY_MAX = 400;
const VIDEO_MAX_BYTES = 250 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROFILE_PIC_BASE = "https://storage.googleapis.com/lifepage-plan/amscareerprofile";
const DRAFT_KEY = "lp_share_experience_draft";

let idCounter = 0;
const newId = () => `sub-${Date.now().toString(36)}-${idCounter++}`;

// Every category starts with one empty subheading to fill in
const EMPTY_CATEGORIES = Object.fromEntries(
  CATEGORIES.map(({ key }) => [key, { scope: "", subheadings: [{ id: `${key}-1`, title: "", body: "" }] }])
) as Record<CategoryKey, CategoryContent>;

const EMPTY_DRAFT: ExperienceDraft = {
  careerTitle: "",
  domain: "",
  authorName: "",
  designation: "",
  yearsExp: "",
  summary: "",
  categories: EMPTY_CATEGORIES,
  videoUrl: "",
};

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 text-sm outline-none transition hover:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700";
const cardClass = "rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] sm:p-7";

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

const readSavedDraft = () => localStorage.getItem(DRAFT_KEY);

// Empty saved fields shouldn't hide the profile prefill
function parseDraft(saved: string | null): Partial<ExperienceDraft> {
  if (!saved) return {};
  try {
    const parsed = JSON.parse(saved) as Partial<ExperienceDraft>;
    const draft = Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => value !== "")
    ) as Partial<ExperienceDraft>;
    // Drafts saved by the older form have no categories
    if (draft.categories) draft.categories = { ...EMPTY_CATEGORIES, ...draft.categories };
    return draft;
  } catch {
    return {};
  }
}

const formatSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

function Avatar({ src, name, className }: { src: string; name: string; className: string }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-500 bg-amber-50 font-bold text-amber-700 ${className}`}
    >
      {src ? (
        // Blob URLs from the file picker can't go through the image optimizer
        <Image src={src} alt={name || "Profile photo"} fill unoptimized sizes="96px" className="object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

function SectionHeading({ step, title, subtitle, badge }: { step: string; title: string; subtitle: string; badge?: string }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          <p className="text-xs text-[#64748B]">{subtitle}</p>
        </div>
      </div>
      {badge && (
        <span className="shrink-0 rounded-full bg-amber-100/70 px-3 py-1 text-[11px] font-semibold text-amber-700">{badge}</span>
      )}
    </div>
  );
}

export default function ShareExperienceForm() {
  const { user } = useAuth();
  const savedDraft = useSyncExternalStore(subscribeToStorage, readSavedDraft, () => null);
  const [edits, setEdits] = useState<Partial<ExperienceDraft>>({});
  const [openCategories, setOpenCategories] = useState<CategoryKey[]>(["intro"]);
  const [consent, setConsent] = useState(false);
  const [videoTab, setVideoTab] = useState<"upload" | "link">("link");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [hideProfilePhoto, setHideProfilePhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // An uploaded photo wins; otherwise fall back to the logged-in member's profile picture
  const profilePhoto = user?.profilepic && !hideProfilePhoto ? `${PROFILE_PIC_BASE}/${user.profilepic}` : "";
  const photoSrc = photo?.url ?? profilePhoto;

  const selectPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      toast.error("That photo is larger than 5MB.");
      return;
    }
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto({ file, url: URL.createObjectURL(file) });
  };

  const removePhoto = () => {
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto(null);
    setHideProfilePhoto(true);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  // What the user typed wins, then a saved draft, then their logged-in profile
  const draft = useMemo(() => parseDraft(savedDraft), [savedDraft]);
  const form: ExperienceDraft = {
    ...EMPTY_DRAFT,
    authorName: user?.name ?? "",
    designation: user?.designation ?? "",
    ...draft,
    ...edits,
  };

  const update = <K extends keyof ExperienceDraft>(key: K, value: ExperienceDraft[K]) =>
    setEdits((prev) => ({ ...prev, [key]: value }));

  const updateCategory = (key: CategoryKey, change: (content: CategoryContent) => CategoryContent) =>
    update("categories", { ...form.categories, [key]: change(form.categories[key]) });

  const updateSubheading = (key: CategoryKey, id: string, field: "title" | "body", value: string) =>
    updateCategory(key, (content) => ({
      ...content,
      subheadings: content.subheadings.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub)),
    }));

  const addSubheading = (key: CategoryKey) =>
    updateCategory(key, (content) => ({
      ...content,
      subheadings: [...content.subheadings, { id: newId(), title: "", body: "" }],
    }));

  const removeSubheading = (key: CategoryKey, id: string) =>
    updateCategory(key, (content) => ({
      ...content,
      subheadings: content.subheadings.filter((sub) => sub.id !== id),
    }));

  const toggleCategory = (key: CategoryKey) =>
    setOpenCategories((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const selectVideo = (file: File | undefined) => {
    if (!file) return;
    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error("Please choose an MP4, MOV or WEBM video.");
      return;
    }
    if (file.size > VIDEO_MAX_BYTES) {
      toast.error("That video is larger than 250MB.");
      return;
    }
    setVideoFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    selectVideo(e.dataTransfer.files?.[0]);
  };

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    toast.success("Draft saved on this device.");
  };

  // There is no publish API yet, so keep the article as a draft instead of pretending it was shared
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    toast.info("Publishing is coming soon. Your article has been saved as a draft on this device.");
  };

  const youtubeEmbed = form.videoUrl ? getYouTubeEmbedUrl(form.videoUrl) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Hero */}
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/90 bg-[#FEF3C7]/70 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-sm">
          <Sparkles className="h-4 w-4 text-amber-600" />
          Structured Career Intelligence
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Share Your Experience:{" "}
          <span className="bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
            {form.careerTitle.trim() || "Your Career"}
          </span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">
          Break down your profession into 5 foundational categories. Add subheadings to explain qualifications,
          daily routines, challenges, and real rewards for students.
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <Avatar src={photoSrc} name={form.authorName} className="h-12 w-12 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{form.authorName.trim() || "Your Name"}</p>
            <p className="truncate text-xs text-stone-500">{form.designation.trim() || "Your designation"}</p>
            {form.yearsExp.trim() && (
              <span className="mt-0.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {form.yearsExp}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 01: Contributor & career */}
      <section className={cardClass}>
        <SectionHeading
          step="01"
          title="Contributor & Career Target"
          subtitle="Establish your credentials and target profession."
          badge="Author Profile"
        />

        <div className="space-y-5">
          <div>
            <p className={labelClass}>Profile Image</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                aria-label="Upload profile image"
                className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
              >
                <Avatar src={photoSrc} name={form.authorName} className="h-20 w-20 text-lg" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0F172A] text-white shadow transition group-hover:scale-110">
                  <Camera className="h-3.5 w-3.5" />
                </span>
              </button>
              <div className="space-y-2">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept={PHOTO_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => selectPhoto(e.target.files?.[0])}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                  >
                    {photoSrc ? "Change Photo" : "Upload Photo"}
                  </button>
                  {photoSrc && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-100"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">JPG, PNG or WEBP, max 5MB. A clear, front-facing photo works best.</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="careerTitle" className={labelClass}>
              Target Career Title <span className="text-amber-600">*</span>
            </label>
            <input
              id="careerTitle"
              type="text"
              required
              value={form.careerTitle}
              onChange={(e) => update("careerTitle", e.target.value)}
              placeholder="e.g. Indian Administrative Service (IAS)"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="domain" className={labelClass}>
              Career Domain / Sector
            </label>
            <input
              id="domain"
              type="text"
              value={form.domain}
              onChange={(e) => update("domain", e.target.value)}
              placeholder="e.g. Civil Services & Public Governance"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="authorName" className={labelClass}>
                Contributor Name <span className="text-amber-600">*</span>
              </label>
              <input
                id="authorName"
                type="text"
                required
                value={form.authorName}
                onChange={(e) => update("authorName", e.target.value)}
                placeholder="e.g. Priya Sharma"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="yearsExp" className={labelClass}>
                Years of Experience
              </label>
              <input
                id="yearsExp"
                type="text"
                value={form.yearsExp}
                onChange={(e) => update("yearsExp", e.target.value)}
                placeholder="e.g. 12+ Years in Administration"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="designation" className={labelClass}>
              Designation / Cadre
            </label>
            <input
              id="designation"
              type="text"
              value={form.designation}
              onChange={(e) => update("designation", e.target.value)}
              placeholder="e.g. Former Additional Secretary & IAS Cadre Officer"
              className={inputClass}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="summary" className={`${labelClass} mb-0`}>
                Executive Summary & Perspective <span className="text-amber-600">*</span>
              </label>
              <span className="text-[11px] text-stone-400">
                {form.summary.length}/{SUMMARY_MAX} chars
              </span>
            </div>
            <textarea
              id="summary"
              rows={4}
              required
              maxLength={SUMMARY_MAX}
              value={form.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="What does this career truly mean to you, in a few sentences?"
              className={`${inputClass} leading-relaxed`}
            />
          </div>
        </div>
      </section>

      {/* 02: Category deep-dive */}
      <section>
        <div className="mb-4 flex items-start justify-between gap-3 px-1">
          <div>
            <h2 className="text-xl font-extrabold">Career Category Deep-Dive</h2>
            <p className="text-xs text-[#64748B]">5 structured categories with customized subheadings & advice</p>
          </div>
          <span className="shrink-0 rounded-full bg-amber-100/70 px-3 py-1 text-[11px] font-semibold text-amber-700">
            5 Core Pillars
          </span>
        </div>

        <div className="space-y-4">
          {CATEGORIES.map(({ key, title, description, icon: Icon }, index) => {
            const content = form.categories[key];
            const isOpen = openCategories.includes(key);
            const count = content.subheadings.length;

            return (
              <div key={key} className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)]">
                <button
                  type="button"
                  onClick={() => toggleCategory(key)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-stone-50/60 sm:p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">
                      {index + 1}. {title}
                    </span>
                    <span className="block truncate text-xs text-[#64748B]">{content.scope.trim() || description}</span>
                  </span>
                  <span className="hidden shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600 sm:inline">
                    {count} {count === 1 ? "subheading" : "subheadings"}
                  </span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="space-y-5 border-t border-stone-100 p-5 sm:p-6">
                    <div>
                      <label htmlFor={`${key}-scope`} className={labelClass}>
                        Category Scope Summary
                      </label>
                      <input
                        id={`${key}-scope`}
                        type="text"
                        value={content.scope}
                        onChange={(e) => updateCategory(key, (c) => ({ ...c, scope: e.target.value }))}
                        placeholder={description}
                        className={inputClass}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Subheadings & Detailed Insights</p>
                      <span className="text-[11px] text-stone-400">Add as many subheadings as needed</span>
                    </div>

                    {content.subheadings.map((sub, subIndex) => (
                      <div key={sub.id} className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50/40 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-bold text-stone-600 shadow-sm">
                              {subIndex + 1}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Subheading Title</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSubheading(key, sub.id)}
                            aria-label={`Remove subheading ${subIndex + 1}`}
                            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          aria-label={`Subheading ${subIndex + 1} title`}
                          value={sub.title}
                          onChange={(e) => updateSubheading(key, sub.id, "title", e.target.value)}
                          placeholder="e.g. Public Mandate & Constitutional Scope"
                          className={`${inputClass} bg-white`}
                        />
                        <div>
                          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                            Insights & Experience Breakdown
                          </p>
                          <textarea
                            rows={4}
                            aria-label={`Subheading ${subIndex + 1} insights`}
                            value={sub.body}
                            onChange={(e) => updateSubheading(key, sub.id, "body", e.target.value)}
                            placeholder="Share what you've learned about this from your own experience..."
                            className={`${inputClass} bg-white leading-relaxed`}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addSubheading(key)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Subheading to {title}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 03: Video */}
      <section className={cardClass}>
        <SectionHeading step="02" title="Video Experience" subtitle="Paste a link or upload a short video about your career." />

        <div className="space-y-5">
          <div className="flex rounded-xl bg-stone-100 p-1">
            {(
              [
                { id: "link", label: "Paste Video Link", Icon: Link2 },
                { id: "upload", label: "Upload Video File", Icon: CloudUpload },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setVideoTab(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                  videoTab === id ? "bg-white text-[#0F172A] shadow-sm" : "text-stone-500 hover:text-[#0F172A]"
                }`}
              >
                <Icon className={`h-4 w-4 ${videoTab === id ? "text-amber-600" : ""}`} />
                {label}
              </button>
            ))}
          </div>

          {videoTab === "link" ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="videoUrl" className={labelClass}>
                  YouTube, Vimeo, or Google Drive URL
                </label>
                <div className="relative">
                  <input
                    id="videoUrl"
                    type="url"
                    value={form.videoUrl}
                    onChange={(e) => update("videoUrl", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`${inputClass} py-3 pr-10`}
                  />
                  <Link2 className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-400" />
                </div>
                <p className="mt-1.5 text-[11px] text-stone-500">
                  Ensure privacy is set to Public or Unlisted so the community can watch.
                </p>
              </div>

              {youtubeEmbed && (
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-sm">
                  <iframe
                    src={youtubeEmbed}
                    title="Video preview"
                    className="h-full w-full"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
                  isDragging ? "border-amber-500 bg-amber-100/70" : "border-amber-300/80 bg-amber-50/30 hover:bg-amber-50/60"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={VIDEO_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => selectVideo(e.target.files?.[0])}
                />
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-600 shadow-sm transition-transform group-hover:scale-110">
                  <Video className="h-7 w-7" />
                </div>
                <p className="text-sm font-bold text-stone-800">
                  Drag and drop your career video here, or{" "}
                  <span className="text-amber-600 underline decoration-amber-400">browse file</span>
                </p>
                <p className="mt-1 text-xs text-stone-500">MP4, MOV, or WEBM (Max 250MB • Recommended 2-4 mins)</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium text-stone-600">
                  <Info className="h-3.5 w-3.5 text-amber-500" />
                  Tip: Casual, honest desk videos work best with learners
                </div>
              </div>

              {videoFile && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5 font-bold text-stone-700">
                    <Film className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span className="truncate">{videoFile.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 font-semibold text-stone-500">
                    {formatSize(videoFile.size)}
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      aria-label="Remove video"
                      className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 accent-amber-600"
              />
              <span className="text-xs leading-normal text-stone-700">
                <span className="font-bold text-stone-900">LifePage Community Spotlight Agreement: </span>
                I consent to sharing this article and video with LifePage members, mentors, and career seekers. I
                certify that this content respects any non-disclosure obligations.
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F172A] px-6 py-4 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-slate-800 hover:shadow-xl sm:flex-1"
        >
          <Sparkles className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-125" />
          Save & Generate LifePage Experience Article
          <ArrowRight className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-1" />
        </button>
        <button
          type="button"
          onClick={saveDraft}
          className="w-full rounded-2xl border border-stone-300 bg-white px-6 py-4 text-sm font-bold text-stone-700 transition hover:bg-stone-100 sm:w-auto"
        >
          Save as Draft
        </button>
      </div>
    </form>
  );
}
