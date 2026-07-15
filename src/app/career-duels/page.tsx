"use client";

import { motion } from "framer-motion";
import Background from "../components/Background";
import DuelCard from "../components/duels/DuelCard";

export default function CareerDuelsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">

          {/* Header */}

          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="rounded-full border border-orange-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-orange-600 shadow">
              ROUND 1 OF 4
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Choose Between These Careers
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              There are no right or wrong answers.
              <br />
              Simply choose the career that interests you more.
            </p>

            {/* Progress */}

            <div className="mx-auto mt-6 h-2 w-44 overflow-hidden rounded-full bg-orange-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "25%" }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
              />
            </div>
          </motion.div>

          {/* Duel Section */}

          <div className="relative mt-10 flex flex-col items-center justify-center gap-6 lg:flex-row lg:gap-0">

            {/* Left */}

            <DuelCard
              image="/doctor.jpg"
              title="Doctor"
              subtitle="Hazel Aswani · Director"
              onChoose={() => console.log("Doctor")}
            />

            {/* VS */}

            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="relative z-20 flex items-center justify-center lg:-mx-5"
            >
              <div className="absolute h-20 w-20 rounded-full bg-orange-300/30 blur-2xl" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-orange-200 bg-white shadow-xl">
                <span className="text-lg font-black text-orange-500">
                  VS
                </span>
              </div>
            </motion.div>

            {/* Right */}

            <DuelCard
              image="/software.jpg"
              title="Software Engineer"
              subtitle="James Macnamara · Teacher"
              onChoose={() => console.log("Software")}
            />

          </div>

          {/* Bottom Button */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .5 }}
            className="mt-10 flex justify-center"
          >
            <button className="rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600">
              Show Different Careers
            </button>
          </motion.div>

        </div>
      </section>
    </main>
  );
}