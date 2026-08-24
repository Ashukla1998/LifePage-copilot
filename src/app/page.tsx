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
          // 1. count is at the root level
          setCount(json.count);

          // 2. data is an array of { topic: string } objects
          const topics = json.data.map((item: { topic: string }) => item.topic.trim());
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
    <div className="h-screen h-dvh w-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Navbar with actual count */}
      <Navbar careerCount={count} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-evenly px-4 pt-16 pb-4 min-h-0 overflow-hidden">
        {/* Form Box */}
        <HomeFormBox
          ref={inputRef}
          careerInput={careerInput}
          setCareerInput={setCareerInput}
        />

        {/* Trending Marquee populated with API topics */}
        {careerNames.length > 0 && (
          <TrendingMarquee
            topic="Trending Careers"
            items={careerNames}
            onSelectCareer={handleCareerSelect}
            onResetCareer={handleCareerReset}
          />
        )}
      </main>
    </div>
  );
}