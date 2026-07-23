// "use client";

// import React, { useState, useRef } from "react";
// import Navbar from "../components/Navbar";
// import HomeFormBox from "../components/HomeFormBox";
// import TrendingMarquee from "../components/TrendingMarquee";

// export default function Home() {
//   const [careerInput, setCareerInput] = useState("");
//   const inputRef = useRef<HTMLInputElement>(null);

//   // Handles selecting a career from marquee
//   const handleCareerSelect = (selectedCareer: string) => {
//     setCareerInput(selectedCareer);
//     inputRef.current?.focus();
//   };

//   // Handles resetting state on second click
//   const handleCareerReset = () => {
//     setCareerInput("");
//   };

//   return (
//     <div className="h-screen h-dvh w-screen overflow-hidden bg-gray-50 flex flex-col justify-between">
//       {/* Navbar */}
//       <Navbar careerCount={1000000} />

//       {/* Main Content Container */}
//       <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-2 min-h-0 overflow-hidden">
//         {/* Form Box */}
//         <HomeFormBox
//           ref={inputRef}
//           careerInput={careerInput}
//           setCareerInput={setCareerInput}
//         />

//         {/* Marquee Section */}
//         <TrendingMarquee
//           onSelectCareer={handleCareerSelect}
//           onResetCareer={handleCareerReset}
//         />
//       </main>
//     </div>
//   );
// }
"use client";

import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import HomeFormBox from "../components/HomeFormBox";
import TrendingMarquee from "../components/TrendingMarquee";

export default function Home() {
  const [careerInput, setCareerInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Handles selecting a career from marquee
  const handleCareerSelect = (selectedCareer: string) => {
    setCareerInput(selectedCareer);
    inputRef.current?.focus();
  };

  // Handles resetting state on second click
  const handleCareerReset = () => {
    setCareerInput("");
  };

  return (
    <div className="h-screen h-dvh w-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar careerCount={1000000} />

      {/* Main Content Area: Evenly spaces top, middle, and bottom sections */}
      <main className="flex-1 flex flex-col items-center justify-evenly px-4 pt-16 pb-4 min-h-0 overflow-hidden">
        {/* Form Box */}
        <HomeFormBox
          ref={inputRef}
          careerInput={careerInput}
          setCareerInput={setCareerInput}
        />

        {/* Trending Marquee Section */}
        <TrendingMarquee
          onSelectCareer={handleCareerSelect}
          onResetCareer={handleCareerReset}
        />
      </main>
    </div>
  );
}