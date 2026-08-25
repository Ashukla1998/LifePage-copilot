"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import HomeFormBox from "../components/HomeFormBox";
import TrendingMarquee from "../components/TrendingMarquee";

export default function Home() {
  const [careerInput, setCareerInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState<string>("");
  const [careerNames, setCareerNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchCareerCount = async () => {
      try {
        const res = await fetch("https://www.lifepage.in/n/api/navbar", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();

        if (json.success === 1) {
          setCount(json.count);
          const topics = json.data.map((item: { topic: string }) =>
            item.topic.trim()
          );
          setCareerNames(topics);
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

  return (
    <div className="h-screen h-dvh w-full overflow-hidden bg-gray-50 flex flex-col justify-between">
      {/* Sticky Top Navbar */}
      <Navbar careerCount={count} />

      {/* Centered Main Form Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center px-4 py-4 min-h-0 overflow-y-auto">
        <HomeFormBox
          ref={inputRef}
          careerInput={careerInput}
          setCareerInput={setCareerInput}
        />
      </main>

      {/* Fixed Bottom Section for Trending Marquee */}
      {careerNames.length > 0 && (
        <footer className="w-full pb-4 sm:pb-6 shrink-0 flex justify-center">
          <TrendingMarquee
            topic="Trending Careers"
            items={careerNames}
            onSelectCareer={handleCareerSelect}
            onResetCareer={handleCareerReset}
          />
        </footer>
      )}
    </div>
  );
}