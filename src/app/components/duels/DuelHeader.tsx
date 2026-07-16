"use client";

import { motion } from "framer-motion";

interface DuelHeaderProps {
  round: number;
  totalRounds: number;
}

export default function DuelHeader({
  round,
  totalRounds,
}: DuelHeaderProps) {
  const progress = (round / totalRounds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
      }}
      className="text-center"
    >
      {/* Round */}

      <motion.div
        layout
        className="inline-flex items-center rounded-full border border-orange-200 bg-white px-5 py-2 shadow-lg"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-orange-600">
          Round {round} of {totalRounds}
        </span>
      </motion.div>

      {/* Title */}

      <motion.h1
        layout
        className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
      >
        Which Career Feels More Like You?
      </motion.h1>

      {/* Subtitle */}

      <motion.p
        layout
        className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600"
      >
        Don't overthink it.

        <br />

        Pick the career that excites you more.

      </motion.p>

      {/* Progress */}

      <div className="mx-auto mt-8 h-2 w-56 overflow-hidden rounded-full bg-orange-100">

        <motion.div
          layout
          animate={{
            width: `${progress}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
          className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500"
        />

      </div>
    </motion.div>
  );
}