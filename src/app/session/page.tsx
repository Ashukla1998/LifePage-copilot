"use client";

import React, { useState, useEffect } from "react";

interface Question {
  questionid: string;
  sessionid: string;
  question: string;
  que_category: string;
  prompt_low: string;
  prompt_high: string;
  live: number;
  percentage: number;
  video_pos: number | string;
  description: string;
}

interface Session {
  sessionid: string;
  topic: string;
  category: string;
  place?: string | null;
  session_description: string;
  designation?: string | null;
  division?: string | null;
  subdivision?: string | null;
  stage?: string | null;
  stage1?: string | null;
  stage2?: string | null;
  stage3?: string | null;
  session_name?: string | null;
  price?: string | null;
  tags?: string | null;
  questions?: Question[];
}

interface ApiResponse {
  success: number;
  message: string;
  total?: number;
  data: Session[];
}

export default function CareerSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        const res = await fetch("https://www.lifepage.in/n/api/tmp");
        const json: ApiResponse = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setSessions(json.data);
        } else {
          setError(json.message || "Failed to load sessions");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <header className="max-w-7xl mx-auto mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
          Career Exploration Sessions
        </h1>
        <p className="mt-2 text-slate-400 text-base max-w-2xl">
          Select any career card below to inspect complete roadmaps, skill blueprints, and daily operational schedules.
        </p>
      </header>

      {loading && (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          Loading sessions...
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300">
          {error}
        </div>
      )}

      <main className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((item) => (
          <button
            key={item.sessionid}
            type="button"
            onClick={() => setSelectedSession(item)}
            className="group relative flex flex-col justify-between text-left aspect-square p-6 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {item.category || "General"}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{item.sessionid}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                {item.topic}
              </h2>

              <p className="mt-3 text-sm text-slate-400 line-clamp-6 leading-relaxed">
                {item.session_description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{item.questions?.length || 0} Modules</span>
              <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                View Details &rarr;
              </span>
            </div>
          </button>
        ))}
      </main>

      {selectedSession && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-3xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      ID: {selectedSession.sessionid}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedSession.price || "Free"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {selectedSession.topic}
                  </h2>
                  <p className="text-sm text-indigo-400 font-medium">
                    {selectedSession.session_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <section className="py-6 border-b border-slate-800 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Designation</span>
                  <span className="font-semibold text-slate-200">{selectedSession.designation || "N/A"}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Seniority Stage</span>
                  <span className="font-semibold text-slate-200">{selectedSession.stage || "N/A"}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Division</span>
                  <span className="font-semibold text-slate-200">{selectedSession.division || "N/A"}</span>
                </div>
              </section>

              <section className="py-6 border-b border-slate-800">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Session Overview
                </h3>
                <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                  {selectedSession.session_description}
                </p>
              </section>

              {selectedSession.tags && (
                <section className="py-6 border-b border-slate-800">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3">
                    Indexed Skills & Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSession.tags.split(",").map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="py-6">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4">
                  Career Modules ({selectedSession.questions?.length || 0})
                </h3>
                <div className="space-y-4">
                  {selectedSession.questions?.map((q) => (
                    <div
                      key={q.questionid}
                      className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {q.que_category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Weight: {q.percentage}%
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-100 mb-2">
                        {q.question}
                      </h4>
                      <div
                        className="text-xs text-slate-400 leading-relaxed space-y-2 [&>h1]:text-sm [&>h1]:font-semibold [&>h1]:text-slate-200 [&>h2]:text-xs [&>h2]:font-semibold [&>h2]:text-slate-300 [&>p]:mt-1"
                        dangerouslySetInnerHTML={{ __html: q.description }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}