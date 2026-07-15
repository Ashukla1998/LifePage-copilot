"use client";

import { motion } from "framer-motion";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#FFF8F1]">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fffdfb_0%,#fff7ee_40%,#fff5ec_100%)]" />

      {/* Orange Glow Left */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-orange-300/30 blur-[140px]"
      />

      {/* Orange Glow Right */}
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-orange-200/30 blur-[170px]"
      />

      {/* Bottom Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
        }}
        className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-200/25 blur-[180px]"
      />

      {/* Glass Shapes */}
      <div className="absolute left-20 top-28 h-64 w-64 rounded-[50px] border border-white/30 bg-white/20 backdrop-blur-3xl" />

      <div className="absolute right-24 top-52 h-52 w-52 rounded-full border border-white/30 bg-white/20 backdrop-blur-3xl" />

      <div className="absolute bottom-32 right-40 h-72 w-44 rounded-[80px] border border-white/30 bg-white/20 backdrop-blur-3xl" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
          linear-gradient(to right,#000 1px,transparent 1px),
          linear-gradient(to bottom,#000 1px,transparent 1px)
        `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}