"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { jakarta } from "@/lib/fonts";

// Long enough for the animation to register even when the next page is already prefetched
const MIN_VISIBLE_MS = 800;
// Safety net in case a navigation is cancelled and the path never changes
const MAX_VISIBLE_MS = 10000;

// Most specific paths first; anything unlisted shows "LifePage"
const ROUTE_LABELS: [string, string][] = [
  ["/learning-from-others", "Learning from Others"],
  ["/share-your-experience", "Share Your Experience"],
  ["/career-duels", "Career Duels"],
  ["/compare", "Compare Careers"],
  ["/advisor-list", "Advisors"],
  ["/articles", "Career Story"],
  ["/balance-report", "Balance Report"],
  ["/certificate", "Certificate"],
  ["/session", "Session"],
  ["/login", "Login"],
  ["/aka-dashboard", "AKA Dashboard"],
  ["/aka-member", "AKA Members"],
  ["/aka-projects", "AKA Projects"],
  ["/aka", "AKA"],
  ["/", "Home"],
];

const labelFor = (pathname: string) =>
  ROUTE_LABELS.find(([path]) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)))?.[1] ??
  "LifePage";

const pathOf = (href: string) => new URL(href, window.location.href).pathname;

type StartTransition = (targetPath: string) => void;

const PageTransitionContext = createContext<StartTransition | null>(null);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [nav, setNav] = useState<{ label: string; from: string } | null>(null);
  const [minElapsed, setMinElapsed] = useState(true);
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start: StartTransition = (targetPath) => {
    // Query-only changes stay on the same page, so there is nothing to wait for
    if (targetPath === window.location.pathname) return;
    setNav({ label: labelFor(targetPath), from: window.location.pathname });
    setMinElapsed(false);
    if (minTimer.current) clearTimeout(minTimer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    minTimer.current = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    maxTimer.current = setTimeout(() => setNav(null), MAX_VISIBLE_MS);
  };

  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  });
  // Stable identity so useTransitionRouter() doesn't hand out a new router on every render
  const stableStart = useCallback<StartTransition>((targetPath) => startRef.current(targetPath), []);

  // Catch clicks on every internal link (next/link and plain <a>) without changing each page
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/api/")) return;
      startRef.current(url.pathname);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const isDone = nav !== null && pathname !== nav.from && minElapsed;

  return (
    <PageTransitionContext.Provider value={stableStart}>
      {children}
      {nav !== null && (
        <div
          role="status"
          aria-live="polite"
          onTransitionEnd={() => isDone && setNav(null)}
          className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#FAF7F2]/95 backdrop-blur-sm transition-opacity duration-300 animate-[lp-fade-in_200ms_ease-out] ${
            isDone ? "pointer-events-none opacity-0" : "opacity-100"
          } ${jakarta.className}`}
        >
          {/* Top progress bar */}
          <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-amber-100">
            <div className="h-full w-1/2 bg-linear-to-r from-transparent via-[#C9822B] to-orange-500 animate-[lp-progress_1.2s_ease-in-out_infinite] motion-reduce:animate-none" />
          </div>

          {/* Logo with spinning rings */}
          <div className="relative h-28 w-28">
            <span className="absolute inset-0 rounded-full border-4 border-amber-200/70 border-t-[#C9822B] animate-spin motion-reduce:animate-none [animation-duration:1.1s]" />
            <span className="absolute inset-3 rounded-full border-2 border-transparent border-b-orange-500 border-l-orange-300 animate-[spin_1.6s_linear_infinite_reverse] motion-reduce:animate-none" />
            <span className="absolute inset-0 animate-[spin_2.4s_linear_infinite] motion-reduce:animate-none">
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            </span>
            <span className="absolute inset-6 rounded-full bg-amber-200/60 animate-pulse motion-reduce:animate-none" />
            <span className="absolute inset-7 flex items-center justify-center rounded-full bg-white shadow-md">
              <Image src="/icon.png" alt="" width={36} height={36} className="h-9 w-auto" />
            </span>
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#C9822B]">Opening</p>
          <p className="mt-1 text-xl font-extrabold text-[#111827] sm:text-2xl">{nav.label}</p>
          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-2 w-2 rounded-full bg-[#C9822B] animate-bounce motion-reduce:animate-none"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </PageTransitionContext.Provider>
  );
}

// Drop-in for useRouter() so code-driven navigation (router.push/replace) shows the loader too
export function useTransitionRouter() {
  const router = useRouter();
  const start = useContext(PageTransitionContext);

  return useMemo(
    () => ({
      ...router,
      push: (...args: Parameters<typeof router.push>) => {
        start?.(pathOf(args[0]));
        router.push(...args);
      },
      replace: (...args: Parameters<typeof router.replace>) => {
        start?.(pathOf(args[0]));
        router.replace(...args);
      },
    }),
    [router, start]
  );
}
