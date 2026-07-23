"use client";

import React, { useEffect, forwardRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserEventBody {
  userid: string;
  start_time?: string;
  end_time?: string;
}

interface HomeFormBoxProps {
  careerInput: string;
  setCareerInput: (value: string) => void;
}

const HomeFormBox = forwardRef<HTMLInputElement, HomeFormBoxProps>(
  ({ careerInput, setCareerInput }, ref) => {
    const router = useRouter();

    useEffect(() => {
      if (typeof window === "undefined") return;

      let userid = sessionStorage.getItem("lp_userid");

      if (!userid) {
        userid =
          "user_" +
          Date.now() +
          "_" +
          Math.random().toString(36).substring(2, 8);

        sessionStorage.setItem("lp_userid", userid);

        const body: UserEventBody = {
          userid,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
        };

        fetch("https://www.lifepage.in/n/api/user_event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then((data) => console.log("Session started:", data))
          .catch((err) => console.error("API error:", err));
      }
    }, []);

    const updateUserEvent = async () => {
      if (typeof window === "undefined") return;

      const userid = sessionStorage.getItem("lp_userid");
      if (!userid) return;

      const body: UserEventBody = {
        userid,
        end_time: new Date().toISOString(),
      };

      try {
        const res = await fetch(
          "https://www.lifepage.in/n/api/update_user_event",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        const data = await res.json();
        console.log("Session updated:", data);
      } catch (err) {
        console.error("API error:", err);
      }
    };

    const handleExplore = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!careerInput.trim()) return;

      await updateUserEvent();
      router.push(`/compare?career=${encodeURIComponent(careerInput.trim())}`);
    };

    const handleDiscovery = async () => {
      await updateUserEvent();
      router.push("/career-duels");
    };

    return (
      <div className="w-full max-w-[500px] rounded-sm border border-black bg-[#ffc000] p-6 text-center text-[#262626] shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-bold leading-[1.3] sm:text-xl">
          Which Career are you interested in?
        </h2>

        {/* Form */}
        <form onSubmit={handleExplore}>
          <input
            ref={ref}
            type="text"
            required
            placeholder="e.g. Website Designer, Data Analyst"
            value={careerInput}
            onChange={(e) => setCareerInput(e.target.value)}
            className="mb-4 w-full rounded-sm border border-white bg-white p-2.5 text-center text-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] outline-none focus:border-blue-500 sm:p-3"
          />

          <button
            type="submit"
            className="inline-flex w-full sm:w-[60%] items-center justify-center gap-2 rounded bg-[#2196f3] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1e88e5]"
          >
            Explore
            <Image
              src="/Newpath.png"
              alt="Explore"
              width={18}
              height={18}
            />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <hr className="border-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-[#ffc000] px-3 text-xs font-semibold text-gray-700">
              OR
            </span>
          </div>
        </div>

        {/* Discovery Button */}
        <button
          onClick={handleDiscovery}
          className="inline-flex w-full sm:w-[60%] items-center justify-center gap-2 rounded bg-[#363636] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-black"
        >
          I Have No Idea
          <Image
            src="/Newresearch.png"
            alt="Discovery"
            width={18}
            height={18}
          />
        </button>
      </div>
    );
  }
);

HomeFormBox.displayName = "HomeFormBox";
export default HomeFormBox;