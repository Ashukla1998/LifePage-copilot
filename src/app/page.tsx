"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronRight, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import HomeFormBox from "../components/HomeFormBox";
import TrendingMarquee, { type TrendingCareer } from "../components/TrendingMarquee";
import { API_BASE } from "@/lib/api";
import { jakarta } from "@/lib/fonts";

// Fades the side images into the page background on every edge except the outer one
const sideMask = (outer: "left" | "right") => {
  const mask = `linear-gradient(to bottom, transparent 0%, black 12%, black 84%, transparent 100%), linear-gradient(to ${outer}, transparent 0%, black 22%)`;
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  } as React.CSSProperties;
};

export default function Home() {
  const [careerInput, setCareerInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState<string>("");
  const [careers, setCareers] = useState<TrendingCareer[]>([]);

  useEffect(() => {
    const fetchCareerCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/navbar`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();

        if (json.success === 1) {
          setCount(json.count);
          // API can return the same topic more than once
          const unique = new Map<string, TrendingCareer>();
          json.data.forEach((item: TrendingCareer) => {
            const topic = item.topic.trim();
            if (!unique.has(topic)) unique.set(topic, { topic, thumbfile: item.thumbfile });
          });
          setCareers(Array.from(unique.values()));
        }
      } catch (error) {
        console.error("Error fetching career data:", error);
      }
    };

    fetchCareerCount();
  }, []);

  const handleCareerSelect = (selectedCareer: string) => {
    setCareerInput(selectedCareer);
    inputRef.current?.focus();
  };

  const handleCareerReset = () => {
    setCareerInput("");
  };

  const formattedCount = count ? `${Number(count).toLocaleString()}+` : "2000+";
  // Short names only, so the chips stay on a single row

  return (
    <div className="min-h-dvh w-full bg-[linear-gradient(180deg,#f4f7fb_0%,#f8f9fb_55%,#fbf8f4_100%)] flex flex-col">
      {/* Sticky Top Navbar */}
      <Navbar careerCount={count} />

      <main className={`flex-1 w-full ${jakarta.className}`}>
        {/* Hero */}
        <section className="relative w-full overflow-hidden">
          {/* Side Images (desktop only) */}
          <div
            className="pointer-events-none absolute left-0 top-2 hidden lg:block lg:w-[33vw] max-w-[600px] -translate-x-[9%]"
            style={sideMask("left")}
          >
            <Image
              src="/leftSide.png"
              alt="Student exploring education paths and job opportunities"
              width={1315}
              height={1197}
              priority
              className="h-auto w-full select-none"
            />
          </div>
          <div
            className="pointer-events-none absolute right-0 top-2 hidden lg:block lg:w-[33vw] max-w-[600px] translate-x-[7%]"
            style={sideMask("right")}
          >
            <Image
              src="/rightSide.png"
              alt="Student discovering her interests and career path"
              width={1315}
              height={1197}
              priority
              className="h-auto w-full select-none"
            />
          </div>

          <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center px-4 pt-10 pb-8 text-center sm:pt-12 lg:max-w-[42vw] xl:max-w-[720px]">
            {/* Pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-[#fdf6ec] px-5 py-2 text-xs font-medium text-[#B87523] shadow-sm sm:text-sm">
              <Sparkles className="h-4 w-4" />
              Explore {formattedCount} Career Pathways
              <ChevronRight className="h-4 w-4" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-extrabold leading-[1.15] tracking-[-0.015em] text-[#111827] sm:text-5xl lg:text-[2.6rem] xl:text-[3.1rem]">
              Find the <span className="text-[#C9822B]">Right Career</span>
              <br />
              <span className="sm:whitespace-nowrap">for a Brighter Tomorrow</span>
            </h1>
            <p className="mt-5 max-w-[620px] text-sm leading-relaxed text-gray-500 sm:text-lg">
              Discover career options, skills, education paths and
              opportunities with AI-powered insights to help you make
              confident choices.
            </p>

            {/* Search Card */}
            <div className="mt-8 w-full max-w-[700px]">
              <HomeFormBox
                ref={inputRef}
                careerInput={careerInput}
                setCareerInput={setCareerInput}
              />
            </div>

          </div>
        </section>

        {/* Trending Careers */}
        <section className="w-full px-4 pb-8 sm:px-6 lg:px-8">
          <TrendingMarquee
            topic="Trending Careers"
            items={careers}
            onSelectCareer={handleCareerSelect}
            onResetCareer={handleCareerReset}
          />
        </section>
      </main>
    </div>
  );
}
