import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import Navbar from "../components/Navbar";
import { jakarta } from "@/lib/fonts";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex w-full flex-1 flex-col bg-[linear-gradient(180deg,#f4f7fb_0%,#f8f9fb_55%,#fbf8f4_100%)]">
      <Navbar />
      <main className={`flex flex-1 flex-col items-center justify-center px-4 py-20 text-center ${jakarta.className}`}>
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf6ec] text-[#C9822B] shadow-sm">
          <Compass className="h-8 w-8" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#C9822B]">404</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.015em] text-gray-900 sm:text-4xl">
          This path doesn&apos;t exist
        </h1>
        <p className="mt-3 max-w-md text-sm text-gray-500 sm:text-base">
          The page you&apos;re looking for may have moved. Let&apos;s get you back to exploring careers.
        </p>
        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#C9822B] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#b4721f]"
        >
          Back to Home
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </main>
    </div>
  );
}
