"use client";

import { useState } from "react";
import { Compass, Download, Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface AvatarPanelProps {
  careerName: string;
  imageSrc: string;
  dreamIndexScore: number | null;
  savedName: string;
  onSaveName: (name: string) => void;
}

// The element html2canvas captures for "Download Avatar"
const CAPTURE_ID = "avatar-download-target";
const IMAGE_ID = "profileImage";

function downloadAvatar() {
  const img = document.getElementById(IMAGE_ID) as HTMLImageElement | null;
  if (img && !img.complete) {
    toast.info("Image still loading. Please wait...");
    return;
  }

  import("html2canvas-pro").then(({ default: html2canvasPro }) => {
    const element = document.getElementById(CAPTURE_ID);
    if (!element) return;

    html2canvasPro(element, { scale: 5, backgroundColor: null, useCORS: true, allowTaint: false })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = "self-assessment.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((err) => console.error("Download error:", err));
  });
}

export default function AvatarPanel({ careerName, imageSrc, dreamIndexScore, savedName, onSaveName }: AvatarPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const displayName = savedName || "Career Seeker";

  const save = () => {
    onSaveName(draft.trim());
    setIsEditing(false);
  };

  return (
    <aside className="flex w-full flex-col items-center gap-5 rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] lg:sticky lg:top-24">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-[#fdf6ec] px-3 py-1 text-xs font-medium text-[#B87523]">
          <Compass className="h-3.5 w-3.5" />
          Career Deep Dive
        </span>
        <h2 className="mt-3 text-xl font-extrabold tracking-[-0.01em] text-gray-900">
          Career in <span className="text-[#C9822B]">{careerName || "..."}</span>
        </h2>
      </div>

      <div className="rounded-full bg-gradient-to-br from-[#C9822B] via-amber-300 to-[#C9822B] p-1 shadow-[0_12px_30px_-10px_rgba(201,130,43,0.6)]">
        <div
          id={CAPTURE_ID}
          className="relative h-[220px] w-[220px] overflow-hidden rounded-full border-4 border-white"
          style={{ backgroundColor: "#e5e7eb" }}
        >
          {/* Plain <img>: html2canvas captures this element for the avatar download */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id={IMAGE_ID}
            src={imageSrc}
            crossOrigin="anonymous"
            className="h-full w-full object-cover text-transparent transition-all duration-600"
            alt={`Avatar for ${careerName || "this career"}`}
          />

          <div
            className="absolute bottom-0 left-1/2 z-10 flex h-[54px] w-[213px] -translate-x-1/2 flex-col items-center justify-between py-1.5 text-white"
            style={{ backgroundColor: "rgba(17,24,39,0.88)" }}
          >
            <span className="text-[10px] font-semibold text-[#E8A54B]">www.lifepage.in/ai</span>
            <div className="h-[1px] w-[136px]" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
            <span className="mb-1 text-[12px] font-semibold">
              {dreamIndexScore !== null ? `${displayName} ${dreamIndexScore}%` : displayName}
            </span>
          </div>
        </div>
      </div>

      {dreamIndexScore !== null && (
        <div className="w-full rounded-2xl bg-gradient-to-br from-[#111827] to-[#3b2a17] p-4 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-300">Your Dream Index</p>
          <p className="mt-1 text-3xl font-extrabold">{dreamIndexScore}%</p>
        </div>
      )}

      <div className="flex w-full flex-col gap-2.5">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => {
              setDraft(savedName);
              setIsEditing(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#C9822B] hover:text-[#C9822B]"
          >
            {savedName ? <Pencil className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {savedName ? "Edit Name" : "Add Your Name"}
          </button>
        ) : (
          <div className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-4 pr-1 focus-within:border-[#C9822B] focus-within:ring-4 focus-within:ring-amber-100">
            <input
              type="text"
              placeholder="Enter your name"
              aria-label="Your name"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
              autoFocus
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-gray-900 outline-none"
            />
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-[#C9822B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b4721f]"
            >
              Save
            </button>
          </div>
        )}

        {dreamIndexScore !== null && (
          <button
            type="button"
            onClick={downloadAvatar}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#C9822B]"
          >
            <Download className="h-4 w-4" />
            Download Avatar
          </button>
        )}
      </div>
    </aside>
  );
}
