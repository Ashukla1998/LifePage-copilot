"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Button from "./ui/Button";

const suggestions = [
  "Software Engineer",
  "Doctor",
  "IAS Officer",
  "Study Abroad",
  "AI Engineer",
  "Business",
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/70 px-4 py-2 shadow-lg backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-orange-500" />

          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">
            LIFEPAGE
          </span>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl"
      >
        Which Career Are You
        <br />

        <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
          Interested In?
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600"
      >
        Discover careers, compare opportunities, explore colleges,
        understand salaries, and let AI guide your future.
      </motion.p>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-10 w-full max-w-2xl"
      >
        <div className="group flex items-center rounded-2xl border border-orange-100 bg-white/80 px-5 py-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-200/40">

          <Search
            size={22}
            className="mr-4 text-orange-500 transition group-hover:scale-110"
          />

          <input
            type="text"
            placeholder="Search career, college, course..."
            className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Button className="mt-6" size="lg" variant="primary">
          Explore Career
        </Button>
      </motion.div>
    </section>
  );
}