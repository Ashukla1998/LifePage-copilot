// import Background from "./components/Background";
// import Hero from "./components/Hero";

// export default function Home() {
//   return (
//     <main className="relative overflow-hidden">
//       <Background />
//       <Hero />
//     </main>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserEventBody {
  userid: string;
  start_time?: string;
  end_time?: string;
}

export default function Home() {
  const router = useRouter();
  const [careerInput, setCareerInput] = useState<string>('');

  // 🔹 Auto-initialize session if missing on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let userid = sessionStorage.getItem("lp_userid");

    if (!userid) {
      userid =
        "user_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 8);

      sessionStorage.setItem("lp_userid", userid);

      const body: UserEventBody = {
        userid: userid,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      };

      fetch("https://www.lifepage.in/n/api/user_event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(data => console.log("Session started:", data))
        .catch(err => console.error("API error:", err));
    }
  }, []);

  // 🔹 Update user event on action click
  const updateUserEvent = async () => {
    const userid = typeof window !== 'undefined' ? sessionStorage.getItem("lp_userid") : null;
    if (!userid) return;

    const body: UserEventBody = {
      userid: userid,
      end_time: new Date().toISOString()
    };

    try {
      const res = await fetch("https://www.lifepage.in/n/api/update_user_event", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      console.log("Session ended updated:", data);
    } catch (err) {
      console.error("API error:", err);
    }
  };

  // 🔹 Action Handlers
  const handleExplore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerInput.trim()) return;

    await updateUserEvent();
    router.push(`/compare?career=${encodeURIComponent(careerInput.trim())}`);
  };

  const handleDiscovery = async () => {
    await updateUserEvent();

    // Converted from legacy career_discovery.php route
    router.push('/career-duels');
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-5 box-border font-sans bg-gray-50">
      <div className="w-full max-w-[520px] bg-[#ffc000] border border-black p-8 md:p-6 xs:p-5 text-center text-[#262626] box-border shadow-sm rounded-sm">

        {/* TITLE */}
        <h2 className="text-[22px] md:text-[19px] xs:text-[18px] font-bold mb-[18px] line-clamp-3 leading-[1.4]">
          Which Career are you interested in?
        </h2>

        {/* FORM */}
        <form onSubmit={handleExplore}>
          {/* INPUT */}
          <input
            name="career"
            type="text"
            required
            placeholder="e.g. Website Designer, Data Analyst"
            value={careerInput}
            onChange={(e) => setCareerInput(e.target.value)}
            className="w-full p-3 text-[14px] xs:text-[13px] text-center bg-white border border-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] outline-none mb-[26px] box-border focus:border-blue-400 rounded-sm"
          />

          {/* EXPLORE BUTTON */}
          <button
            type="submit"
            className="text-[14px] font-bold py-3 px-[22px] rounded-[3px] border-none cursor-pointer shadow-[0_6px_10px_rgba(0,0,0,0.25)] inline-flex items-center justify-center gap-2 transition duration-300 ease-in-out md:w-[56%]` border-none cursor-pointer shadow-[0_6px_10px_rgba(0,0,0,0.25)] inline-flex items-center justify-center gap-2 transition duration-300 ease-in-out bg-[#2196f3] text-white hover:-translate-y-[2px]"
          >
            Explore
            <img src="/Newpath.png" height="20" width="20" alt="PathIcon" className="h-5 w-auto" />
          </button>
        </form>

        <div className="relative my-7">
          <hr className="border-t border-black/20" />

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white px-4 text-sm font-semibold text-gray-600 tracking-wider">
              OR
            </span>
          </div>
        </div>

        {/* DISCOVERY BUTTON */}
        <button
          onClick={handleDiscovery}
          className="text-[14px] font-bold py-3 px-[22px] rounded-[3px] border-none cursor-pointer shadow-[0_6px_10px_rgba(0,0,0,0.25)] inline-flex items-center justify-center gap-2 transition duration-300 ease-in-out md:w-[56%]` inline-flex items-center justify-center gap-2 transition duration-300 ease-in-out bg-[#363636] text-white hover:-translate-y-[2px]"
        >
          I have no Idea
          <img src="/Newresearch.png" height="20" width="20" alt="ResearchIcon" className="h-5 w-auto" />
        </button>

      </div>
    </div>
  );
}