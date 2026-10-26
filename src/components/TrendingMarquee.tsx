"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Brain,
  Briefcase,
  Building2,
  Calculator,
  Camera,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  Code,
  Cog,
  Flame,
  GraduationCap,
  HardHat,
  Megaphone,
  Palette,
  Scale,
  Shield,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export interface TrendingCareer {
  topic: string;
  thumbfile?: string;
}

const TRENDING_CAREERS: TrendingCareer[] = [
  "Data Analyst",
  "AI Engineer",
  "UX Designer",
  "Website Designer",
  "Digital Marketer",
  "Cybersecurity Specialist",
  "Product Manager",
  "Cloud Architect",
  "Software Developer",
  "Full Stack Engineer",
].map((topic) => ({ topic }));

// Thumbnails live in a folder named after the session id, i.e. the first 13 chars
// of the file name ("20170218-00011.JPG" -> "20170218-0001/20170218-00011.JPG")
const thumbUrl = (thumbfile: string) =>
  `https://storage.googleapis.com/lifepage-video-android/${thumbfile.slice(0, 13)}/${thumbfile}`;

// First matching keyword decides the tile icon
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/data|analy|scien|statist/i, ChartLine],
  [/software|developer|program|web|full stack|ai |cloud|tech/i, Code],
  [/doctor|nurs|medic|pharma|dent|surgeon|health/i, Stethoscope],
  [/civil|construct/i, HardHat],
  [/mechanic|electric|engineer/i, Cog],
  [/design|artist|animat|fashion/i, Palette],
  [/teach|professor|educat|tutor/i, GraduationCap],
  [/market|sales|advertis|pr /i, Megaphone],
  [/account|financ|bank|audit|tax/i, Calculator],
  [/content|photo|film|video|journal|media/i, Camera],
  [/psycho|counsel|neuro/i, Brain],
  [/architect|interior|real estate/i, Building2],
  [/law|legal|judge|advocate/i, Scale],
  [/secur|defen|army|police/i, Shield],
];

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-slate-700 to-slate-900",
  "from-sky-200 to-slate-300",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-indigo-500",
  "from-emerald-400 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-gray-200 to-gray-400",
  "from-zinc-500 to-zinc-700",
  "from-rose-400 to-pink-600",
];

const iconFor = (career: string) =>
  ICON_RULES.find(([re]) => re.test(career))?.[1] ?? Briefcase;

interface TrendingMarqueeProps {
  onSelectCareer: (career: string) => void;
  onResetCareer: () => void;
  topic?: string;
  items?: TrendingCareer[];
}

export default function TrendingMarquee({
  onSelectCareer,
  onResetCareer,
  topic,
  items,
}: TrendingMarqueeProps) {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [brokenThumbs, setBrokenThumbs] = useState<Set<string>>(new Set());
  const trackRef = useRef<HTMLDivElement>(null);
  const isPaused = isHovered || selectedCareer !== null;

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    career: string
  ) => {
    e.currentTarget.blur();

    if (selectedCareer === career) {
      setSelectedCareer(null);
      onResetCareer();
    } else {
      setSelectedCareer(career);
      onSelectCareer(career);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const list = items && items.length > 0 ? items : TRENDING_CAREERS;
  // Rendered twice so the auto-scroll can loop seamlessly
  const duplicatedList = [...list, ...list];

  // Continuous auto-scroll; pauses on hover/touch or while a career is selected
  useEffect(() => {
    const el = trackRef.current;
    if (!el || isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pos = el.scrollLeft;
    let frame: number;

    const step = () => {
      const firstCopy = el.children[0] as HTMLElement | undefined;
      const secondCopy = el.children[list.length] as HTMLElement | undefined;
      const loopWidth =
        firstCopy && secondCopy ? secondCopy.offsetLeft - firstCopy.offsetLeft : 0;

      pos += 0.5;
      if (loopWidth > 0 && pos >= loopWidth) pos -= loopWidth;
      el.scrollLeft = pos;
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isPaused, list.length]);

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="mx-auto w-full max-w-7xl rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:px-6 sm:py-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
              {topic || "Trending Careers"}
            </h3>
            <p className="text-xs text-gray-500 sm:text-sm">
              Explore popular career options this month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#C9822B] hover:text-[#C9822B]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#C9822B] hover:text-[#C9822B]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        ref={trackRef}
        className="flex gap-[18px] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {duplicatedList.map(({ topic: career, thumbfile }, index) => {
          const Icon = iconFor(career);
          const isSelected = selectedCareer === career;
          const showThumb = thumbfile && !brokenThumbs.has(thumbfile);

          return (
            <button
              key={`${career}-${index}`}
              type="button"
              onClick={(e) => handleClick(e, career)}
              className="group w-[104px] shrink-0 text-left outline-none sm:w-[112px]"
            >
              <span
                className={`relative flex h-[60px] w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${
                  GRADIENTS[index % GRADIENTS.length]
                } ${isSelected ? "ring-2 ring-[#C9822B] ring-offset-2" : ""}`}
              >
                {showThumb ? (
                  <Image
                    src={thumbUrl(thumbfile)}
                    alt={career}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() =>
                      setBrokenThumbs((prev) => new Set(prev).add(thumbfile))
                    }
                  />
                ) : (
                  <Icon className="h-6 w-6 text-white drop-shadow" />
                )}
              </span>
              <span
                className={`mt-2 block truncate text-xs ${
                  isSelected ? "font-semibold text-[#C9822B]" : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                {career}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
