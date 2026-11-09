"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  GraduationCap,
  RefreshCw,
  Swords,
  ThumbsUp,
  TriangleAlert,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Navbar from "./Navbar";
import { jakarta } from "@/lib/fonts";

export interface DuelQuestion {
  question: string;
  que_category: "Skills" | "Education" | "Positives" | "Challenges" | string;
  percentage: number;
}

export interface DuelSession {
  sessionid: string;
  topic: string;
  division?: string;
  subdivision?: string;
  thumbfile?: string;
  avatar?: string;
  fieldOfStudy?: string;
}

export interface CareerData {
  session: DuelSession;
  questions: DuelQuestion[];
}

const CATEGORIES: { key: string; icon: LucideIcon; color: string }[] = [
  { key: "Education", icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
  { key: "Skills", icon: Wrench, color: "text-violet-600 bg-violet-50" },
  { key: "Positives", icon: ThumbsUp, color: "text-emerald-600 bg-emerald-50" },
  { key: "Challenges", icon: TriangleAlert, color: "text-rose-500 bg-rose-50" },
];

interface CareerDuelViewProps {
  badgeLabel: string;
  headerExtra?: React.ReactNode;
  careerCount?: string;
  leftCareer: CareerData | null;
  rightCareer: CareerData | null;
  selectedSide: "left" | "right";
  leftClickCount: number;
  rightClickCount: number;
  onSelectLeft: () => void;
  onSelectRight: () => void;
  onOpenCareer: (topic: string) => void;
  onNone: () => void;
}

// Shared layout for Career Duels and Compare: two career cards, a VS divider and "None of the Above"
export default function CareerDuelView({
  badgeLabel,
  headerExtra,
  careerCount,
  leftCareer,
  rightCareer,
  selectedSide,
  leftClickCount,
  rightClickCount,
  onSelectLeft,
  onSelectRight,
  onOpenCareer,
  onNone,
}: CareerDuelViewProps) {
  // The card columns act as buttons (they contain the Learn More button, so they can't be <button>s)
  const onCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, select: () => void) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select();
    }
  };

  // 🔹 PROGRESS HUD
  const renderLearnMore = (count: number, career: CareerData | null, isVisible: boolean) => {
    if (!isVisible || !career || count === 0) {
      return (
        <div className="flex h-12 items-center justify-center text-xs font-medium text-gray-400 transition group-hover/col:text-[#C9822B]">
          Tap to choose this career
        </div>
      );
    }

    if (count >= 5) {
      return (
        <div className="flex h-12 items-center justify-center">
          <button
            className="group/btn inline-flex items-center gap-2 rounded-full bg-[#C9822B] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#b4721f] hover:shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCareer(career.session.topic);
            }}
          >
            <Trophy className="h-4 w-4" />
            Learn More
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex h-12 flex-col justify-center px-1">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-800">Unlocking Learn More</span>
          <span className="font-semibold text-[#C9822B]">{count * 20}%</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <span
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                step <= count ? 'bg-[#C9822B]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderCardContent = (career: CareerData | null, isSelected: boolean) => {
    if (!career) {
      return (
        <div className="flex h-[400px] animate-pulse flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-44 bg-gray-200" />
          <div className="grid flex-1 grid-cols-2 gap-2 p-3">
            {CATEGORIES.map(({ key }) => (
              <div key={key} className="rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      );
    }

    const { session, questions } = career;

    const img = session.thumbfile
      ? `https://storage.googleapis.com/lifepage-video-android/${session.sessionid}/${session.thumbfile}`
      : 'https://www.lifepage.in/support/NoCareer.png';

    return (
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white transition duration-300 ${
          isSelected
            ? 'border-[#C9822B] shadow-[0_16px_40px_-14px_rgba(201,130,43,0.45)] ring-2 ring-[#C9822B]/30'
            : 'border-gray-100 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] group-hover/col:-translate-y-1 group-hover/col:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.25)]'
        }`}
      >
        {/* Image + Title */}
        <div className="relative h-40 w-full overflow-hidden sm:h-44">
          <Image
            src={img}
            alt={session.topic}
            fill
            sizes="(min-width: 768px) 440px, 100vw"
            className="object-cover transition-transform duration-500 group-hover/col:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* Selection Badge */}
          <span
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ${
              isSelected
                ? 'scale-100 border-white bg-[#C9822B] text-white opacity-100'
                : 'scale-90 border-white/80 bg-white/20 text-transparent opacity-80 backdrop-blur group-hover/col:opacity-100'
            }`}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>

          <div className="absolute inset-x-0 bottom-0 p-4 text-left">
            {session.division && (
              <span className="mb-1.5 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                {session.division}
              </span>
            )}
            <h3 className="truncate text-lg font-bold text-white sm:text-xl" title={session.topic}>
              {session.topic}
            </h3>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-2 p-3">
          {CATEGORIES.map(({ key, icon: Icon, color }) => {
            const items = questions.filter((q) => q.que_category === key).slice(0, 3);
            return (
              <div key={key} className="min-w-0 rounded-xl bg-gray-50/80 p-2.5 text-left">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-gray-900">{key}</span>
                </div>
                <ul className="space-y-0.5">
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <li key={idx} className="truncate text-[11px] leading-snug text-gray-600" title={item.question}>
                        • {item.question}
                      </li>
                    ))
                  ) : (
                    <li className="text-[11px] text-gray-400">No data yet</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 w-full flex-col bg-[linear-gradient(180deg,#f4f7fb_0%,#f8f9fb_55%,#fbf8f4_100%)]">
      {/* 🔹 Fixed / Sticky Top Navbar */}
      <Navbar careerCount={careerCount} />

      <main className={`w-full flex-1 px-4 py-8 sm:py-10 ${jakarta.className}`}>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
          {/* Heading */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-[#fdf6ec] px-4 py-1.5 text-xs font-medium text-[#B87523] shadow-sm sm:text-sm">
            <Swords className="h-4 w-4" />
            {badgeLabel}
          </div>
          <h1 className="text-center text-2xl font-extrabold tracking-[-0.015em] text-[#111827] sm:text-4xl">
            Which career do you <span className="text-[#C9822B]">prefer</span>?
          </h1>
          <p className="mt-3 max-w-xl text-center text-sm text-gray-500 sm:text-base">
            Pick the one that excites you more. Each choice brings a closer
            match &mdash; pick the same career 5 times to unlock Learn More.
          </p>
          {headerExtra}

          {/* Duel */}
          <div className="mt-8 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            {/* LEFT COLUMN */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selectedSide === 'left'}
              aria-label={leftCareer ? `Choose ${leftCareer.session.topic}` : 'Loading career'}
              className="group/col mx-auto flex w-full max-w-[440px] cursor-pointer flex-col gap-2 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#C9822B]/40"
              onClick={onSelectLeft}
              onKeyDown={(e) => onCardKeyDown(e, onSelectLeft)}
            >
              {renderCardContent(leftCareer, selectedSide === 'left')}
              {renderLearnMore(leftClickCount, leftCareer, selectedSide === 'left')}
            </div>

            {/* VS DIVISION */}
            <div className="flex items-center justify-center md:h-[380px] md:flex-col">
              <span className="hidden w-px flex-1 bg-gradient-to-b from-transparent to-gray-300 md:block" />
              <span className="my-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-lg font-extrabold italic text-[#C9822B] shadow-[0_8px_24px_-8px_rgba(201,130,43,0.5)] ring-4 ring-[#fdf6ec]">
                VS
              </span>
              <span className="hidden w-px flex-1 bg-gradient-to-b from-gray-300 to-transparent md:block" />
            </div>

            {/* RIGHT COLUMN */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selectedSide === 'right'}
              aria-label={rightCareer ? `Choose ${rightCareer.session.topic}` : 'Loading career'}
              className="group/col mx-auto flex w-full max-w-[440px] cursor-pointer flex-col gap-2 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#C9822B]/40"
              onClick={onSelectRight}
              onKeyDown={(e) => onCardKeyDown(e, onSelectRight)}
            >
              {renderCardContent(rightCareer, selectedSide === 'right')}
              {renderLearnMore(rightClickCount, rightCareer, selectedSide === 'right')}
            </div>
          </div>

          {/* None of the Above Button */}
          <div className="mt-6 flex flex-col items-center gap-2 pb-6">
            <button
              className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-md active:scale-95"
              onClick={onNone}
            >
              <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
              None of the Above
            </button>
            <span className="text-xs text-gray-400">Show me two different careers</span>
          </div>
        </div>
      </main>
    </div>
  );
}
