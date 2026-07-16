"use client";

import { motion } from "framer-motion";
import { Swords } from "lucide-react";

interface VSProps {
  fighting?: boolean;
}

export default function VS({
  fighting = false,
}: VSProps) {
  return (
    <motion.div
      animate={
        fighting
          ? {
              scale: [1, 1.35, 0.95, 1],
              rotate: [0, 8, -8, 0],
            }
          : {
              scale: [1, 1.05, 1],
            }
      }
      transition={{
        duration: fighting ? 0.6 : 2,
        repeat: fighting ? 0 : Infinity,
      }}
      className="relative z-20 flex items-center justify-center"
    >
      {/* Glow */}

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        className="absolute h-24 w-24 rounded-full bg-orange-300 blur-3xl"
      />

      {/* Circle */}

      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-orange-200 bg-white shadow-xl">

        <Swords
          size={28}
          className="text-orange-500"
        />

      </div>
    </motion.div>
  );
}