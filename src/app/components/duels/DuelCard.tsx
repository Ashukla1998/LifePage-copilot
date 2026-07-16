"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, ArrowRight, Check } from "lucide-react";

interface DuelCardProps {
  image: string;
  title: string;
  subtitle?: string;

  selected?: boolean;
  disabled?: boolean;

  onChoose: () => void;
  onWatch?: () => void;
}

export default function DuelCard({
  image,
  title,
  subtitle,
  selected = false,
  disabled = false,
  onChoose,
  onWatch,
}: DuelCardProps) {
  return (
    <motion.article
      layout
      whileHover={
        !disabled
          ? {
              y: -8,
              scale: 1.015,
            }
          : {}
      }
      animate={{
        scale: selected ? 1.03 : 1,
        opacity: disabled && !selected ? 0.45 : 1,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`group overflow-hidden rounded-[30px] bg-white shadow-xl transition-all duration-300 border

${
  selected
    ? "border-green-400 shadow-green-200/60"
    : "border-orange-100 hover:border-orange-300 hover:shadow-orange-200/40"
}

w-full
max-w-[380px]
`}
    >
      {/* IMAGE */}

      <div className="relative h-[250px] overflow-hidden">

        <Image
          src={image}
          alt={title}
          fill
          sizes="380px"
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* PLAY */}

        <button
          onClick={onWatch}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 0.95, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            whileHover={{
              scale: 1.1,
            }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
          >
            <Play
              fill="white"
              size={24}
              className="text-white"
            />
          </motion.div>
        </button>

        {/* WATCH */}

        <span className="absolute bottom-5 right-5 rounded-full bg-white/20 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          WATCH FIRST
        </span>

      </div>

      {/* BODY */}

      <div className="space-y-5 p-6">

        <div>

          <h2 className="line-clamp-2 text-[30px] font-bold leading-tight text-slate-900">
            {title}
          </h2>

          <p className="mt-2 line-clamp-1 text-base text-slate-500">
            {subtitle}
          </p>

        </div>

        {/* ACTION */}

        <motion.button
          disabled={disabled}
          whileTap={{
            scale: 0.97,
          }}
          whileHover={
            !disabled
              ? {
                  scale: 1.02,
                }
              : {}
          }
          onClick={onChoose}
          className={`
flex
h-12
w-full
items-center
justify-center
gap-2
rounded-xl
font-semibold
transition-all
duration-300

${
  selected
    ? "bg-green-500 text-white"
    : "bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white"
}
`}
        >
          {selected ? (
            <>
              <Check size={18} />
              Your Choice
            </>
          ) : (
            <>
              Choose Career
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>

      </div>
    </motion.article>
  );
}