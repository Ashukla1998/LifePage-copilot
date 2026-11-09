"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { jakarta } from "@/lib/fonts";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className={`flex w-full flex-1 flex-col items-center justify-center bg-[linear-gradient(180deg,#f4f7fb_0%,#f8f9fb_55%,#fbf8f4_100%)] px-4 py-24 text-center ${jakarta.className}`}
    >
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-sm">
        <TriangleAlert className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-[-0.015em] text-gray-900 sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-500 sm:text-base">
        We couldn&apos;t load this page. Please try again, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex items-center gap-2 rounded-full bg-[#C9822B] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#b4721f]"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-900"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
