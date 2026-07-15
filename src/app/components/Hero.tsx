// "use client";

// import { motion } from "framer-motion";
// import { Search } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";

// export default function Hero() {
//   return (
//     <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
//       {/* Badge */}
//       <motion.div
//         initial={{ opacity: 0, y: -15 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="mb-8"
//       >
//         <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/70 px-4 py-2 shadow-lg backdrop-blur-xl">
//           <Image
//             src="/icon.png"
//             alt="LifePage"
//             width={20}
//             height={20}
//             className="object-contain"
//           />

//           <span className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">
//             LIFEPAGE
//           </span>
//         </div>
//       </motion.div>

//       {/* Heading */}
//       <motion.h1
//         initial={{ opacity: 0, y: 25 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2, duration: 0.8 }}
//         className="max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl"
//       >
//         Which Career Are You
//         <br />
//         <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
//           Interested In?
//         </span>
//       </motion.h1>

//       {/* Subtitle */}
//       <motion.p
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.5 }}
//         className="mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600"
//       >
//         Discover careers, compare opportunities, explore colleges,
//         understand salaries, and let AI guide your future.
//       </motion.p>

//       {/* Search */}
//       <motion.div
//         initial={{ opacity: 0, y: 25 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.8 }}
//         className="mt-10 w-full max-w-2xl"
//       >
//         <div className="group flex items-center rounded-2xl border border-orange-100 bg-white/80 px-5 py-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-200/40">
//           <Search
//             size={22}
//             className="mr-4 text-orange-500 transition group-hover:scale-110"
//           />

//           <input
//             type="text"
//             placeholder="Search career, college, course..."
//             className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
//           />
//         </div>
//       </motion.div>

//       {/* Cards */}
//       <motion.div
//         initial={{ opacity: 0, y: 25 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 1 }}
//         className="mt-10 flex w-full max-w-6xl flex-col items-center gap-6 md:flex-row"
//       >
//         {/* Search Card */}
//         <motion.div
//           whileHover={{ y: -6, scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           className="group flex w-full flex-1 cursor-pointer items-center gap-5 rounded-[30px] border border-orange-200 bg-white p-5 shadow-lg transition-all duration-300 hover:border-orange-400 hover:shadow-2xl"
//         >
//           <div className="relative h-24 w-24 shrink-0">
//             <Image
//               src="/search.png"
//               alt="Search Career"
//               fill
//               className="object-contain transition-transform duration-300 group-hover:scale-105"
//             />
//           </div>

//           <div className="flex-1">
//             <div className="mb-2 flex items-center gap-3">
//               <h3 className="text-3xl font-bold text-slate-900">
//                 Explore Careers
//               </h3>

//               <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
//                 Search
//               </span>
//             </div>

//             <p className="text-lg leading-7 text-slate-600">
//               Search thousands of careers, colleges and courses.
//             </p>
//           </div>
//         </motion.div>

//         {/* OR */}
//         <div className="flex items-center justify-center px-2">
//           <span className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold tracking-[0.35em] text-orange-500 shadow">
//             OR
//           </span>
//         </div>

//         {/* Game Card */}
//         <motion.div
//           whileHover={{ y: -6, scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           className="group flex w-full flex-1 cursor-pointer items-center gap-5 rounded-[30px] border border-slate-200 bg-white p-5 shadow-lg transition-all duration-300 hover:border-orange-400 hover:shadow-2xl"
//         >
//           <div className="relative h-24 w-24 shrink-0">
//             <Image
//               src="/game.png"
//               alt="Career Duels"
//               fill
//               className="object-contain transition-transform duration-300 group-hover:scale-105"
//             />
//           </div>

//           <div className="flex-1">
//             <div className="mb-2 flex items-center gap-3">
//               <h3 className="text-3xl font-bold text-slate-900">
//                 Career Duels
//               </h3>

//               <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
//                 Play
//               </span>
//             </div>

//             <p className="text-lg leading-7 text-slate-600">
//               Can't decide? Play a fun game and discover the career that suits
//               you best.
//             </p>
//           </div>
//         </motion.div>
//       </motion.div>
//     </section>
//   );
// }
"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

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
          <Image
            src="/icon.png"
            alt="LifePage"
            width={20}
            height={20}
            className="object-contain"
          />

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

      {/* Search */}
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

      {/* Cards */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-10 flex w-full max-w-6xl flex-col items-center gap-6 md:flex-row"
      >
        {/* Explore Careers */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/careers")}
          className="group flex w-full flex-1 cursor-pointer items-center gap-5 rounded-[30px] border border-orange-200 bg-white p-5 shadow-lg transition-all duration-300 hover:border-orange-400 hover:shadow-2xl"
        >
          <div className="relative h-24 w-24 shrink-0">
            <Image
              src="/search.png"
              alt="Search Career"
              fill
              sizes="96px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-3xl font-bold text-slate-900">
                Explore Careers
              </h3>

              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Search
              </span>
            </div>

            <p className="text-lg leading-7 text-slate-600">
              Search thousands of careers, colleges and courses.
            </p>
          </div>
        </motion.div>

        {/* OR */}
        <div className="flex items-center justify-center px-2">
          <span className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold tracking-[0.35em] text-orange-500 shadow">
            OR
          </span>
        </div>

        {/* Career Duels */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/career-duels")}
          className="group flex w-full flex-1 cursor-pointer items-center gap-5 rounded-[30px] border border-slate-200 bg-white p-5 shadow-lg transition-all duration-300 hover:border-orange-400 hover:shadow-2xl"
        >
          <div className="relative h-24 w-24 shrink-0">
            <Image
              src="/game.png"
              alt="Career Duels"
              fill
              sizes="96px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-bold text-slate-900">
                  Career Duels
                </h3>

                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Play
                </span>
              </div>

              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 6 }}
                className="text-2xl font-bold text-orange-500"
              >
                →
              </motion.span>
            </div>

            <p className="text-lg leading-7 text-slate-600">
              Can't decide? Play a fun game and discover the career that suits
              you best.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}