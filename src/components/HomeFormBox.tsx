"use client";

import React, { useEffect, forwardRef } from "react";
import { ArrowRight, Lightbulb, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

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

        fetch(`${API_BASE}/user_event`, {
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
          `${API_BASE}/update_user_event`,
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
      <div className="w-full rounded-2xl border border-white bg-white/95 p-4 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.15)] backdrop-blur sm:px-5 sm:py-5">
        {/* Search */}
        <form
          onSubmit={handleExplore}
          className="flex items-center gap-3 rounded-full border border-gray-200 bg-white py-2 pl-5 pr-2 transition focus-within:border-[#C9822B] focus-within:ring-4 focus-within:ring-amber-100"
        >
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={ref}
            type="text"
            required
            placeholder="Search any career, skill or field..."
            value={careerInput}
            onChange={(e) => setCareerInput(e.target.value)}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 sm:text-base"
          />
          <button
            type="submit"
            aria-label="Explore"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9822B] text-white shadow-md transition hover:scale-105 hover:bg-[#b4721f]"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        {/* Discovery */}
        <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-amber-100 bg-gradient-to-r from-[#fdf6ec] via-[#fffaf3] to-white p-3 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#C9822B] shadow-[0_4px_12px_rgba(201,130,43,0.18)]">
              <Lightbulb className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-[#C9822B] ring-2 ring-white" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">
                Not sure where to start?
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Play quick career duels and discover what suits you
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDiscovery}
            className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#C9822B] hover:shadow-lg sm:w-auto sm:text-sm"
          >
            <Sparkles className="h-4 w-4 text-amber-300 transition group-hover:text-white" />
            I Have No Idea
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        
      </div>
    );
  }
);

HomeFormBox.displayName = "HomeFormBox";
export default HomeFormBox;