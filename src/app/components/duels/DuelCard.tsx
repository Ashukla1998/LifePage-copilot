"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, ArrowRight } from "lucide-react";

interface DuelCardProps {
  image: string;
  title: string;
  subtitle: string;
  onChoose: () => void;
  onWatch?: () => void;
}

export default function DuelCard({
  image,
  title,
  subtitle,
  onChoose,
  onWatch,
}: DuelCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      whileHover={{
        y: -6,
        transition: { duration: 0.25 },
      }}
      className="group w-full max-w-[360px] overflow-hidden rounded-[24px] border border-orange-100 bg-white shadow-xl transition-all duration-300 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-200/40"
    >
      {/* IMAGE */}

      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="360px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* PLAY BUTTON */}

        <button
          onClick={onWatch}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-md"
          >
            <Play
              fill="white"
              size={22}
            />
          </motion.div>
        </button>

        {/* WATCH */}

        <span className="absolute bottom-4 right-4 rounded-full bg-slate-900/80 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
          Watch First
        </span>
      </div>

      {/* CONTENT */}

      <div className="space-y-4 p-5">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-2 text-base text-slate-500">
            {subtitle}
          </p>

        </div>

        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: .98 }}
          onClick={onChoose}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-50 py-3 font-semibold text-orange-600 transition-all duration-300 hover:bg-orange-500 hover:text-white"
        >
          Choose Career

          <ArrowRight size={18} />
        </motion.button>

      </div>
    </motion.div>
  );
}