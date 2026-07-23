"use client";

import React, { useState } from "react";

const TRENDING_CAREERS = [
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
];

interface TrendingMarqueeProps {
  onSelectCareer: (career: string) => void;
  onResetCareer: () => void;
}

export default function TrendingMarquee({
  onSelectCareer,
  onResetCareer,
}: TrendingMarqueeProps) {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, career: string) => {
    // Remove default button focus outline/styles
    e.currentTarget.blur();

    if (selectedCareer === career) {
      // Second click: Reset, unpause, and restore original colors
      setSelectedCareer(null);
      onResetCareer();
    } else {
      // First click: Select, pause, and highlight in yellow
      setSelectedCareer(career);
      onSelectCareer(career);
    }
  };

  const isPaused = selectedCareer !== null;

  return (
    <section className="w-full max-w-4xl mt-6 sm:mt-8 text-center shrink-0">
      <h3 className="mb-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
        🔥 Trending Careers
      </h3>

      {/* Marquee Outer Container */}
      <div className="relative flex w-full overflow-x-hidden group py-1">
        {/* Edge Gradients */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-gray-50 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-gray-50 to-transparent" />

        {/* Continuous Scrolling Track */}
        <div
          className="flex shrink-0 animate-marquee gap-2.5 group-hover:[animation-play-state:paused]"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {TRENDING_CAREERS.concat(TRENDING_CAREERS).map((career, index) => {
            const isSelected = selectedCareer === career;

            return (
              <button
                key={`${career}-${index}`}
                type="button"
                onClick={(e) => handleClick(e, career)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap outline-none ${
                  isSelected
                    ? "border-black bg-[#ffc000] text-black font-bold scale-105 shadow-md"
                    : "border-gray-300 bg-white text-gray-700 hover:scale-105 hover:border-black hover:bg-[#ffc000] hover:text-black hover:shadow-md"
                }`}
              >
                {career}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </section>
  );
}