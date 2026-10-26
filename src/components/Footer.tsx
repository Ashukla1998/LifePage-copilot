"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ArrowUpRight, Globe } from "lucide-react";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const EXPLORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/career-duels", label: "Career Duels" },
  { href: "/compare", label: "Compare Careers" },
  { href: "/advisor-list", label: "Find Advisors" },
];

const ACCOUNT_LINKS = [{ href: "/login", label: "Login" }];

// Homepage and AKA pages have their own layouts; the certificate is embedded in an iframe
const isFooterHidden = (pathname: string) =>
  pathname === "/" || pathname.startsWith("/aka") || pathname.startsWith("/certificate");

export default function Footer() {
  const pathname = usePathname();
  if (isFooterHidden(pathname)) return null;

  return (
    <footer className={`w-full shrink-0 bg-[#141414] text-gray-400 ${jakarta.className}`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        {/* Brand */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/icon.png" alt="LifePage" width={140} height={40} className="h-10 w-auto" />
            <span className="text-lg font-bold text-white">LifePage</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            The world&apos;s largest career repository &mdash; real stories from real
            professionals to help you find the right career for a brighter tomorrow.
          </p>
          <a
            href="https://www.lifepage.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-[#C9822B] hover:text-[#E8A54B]"
          >
            <Globe className="h-4 w-4" />
            www.lifepage.in
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Explore */}
        <nav aria-label="Explore">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Explore</h3>
          <ul className="space-y-2.5 text-sm">
            {EXPLORE_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`transition hover:text-[#E8A54B] ${pathname === href ? "text-[#E8A54B]" : ""}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Account */}
        <nav aria-label="Account">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Account</h3>
          <ul className="space-y-2.5 text-sm">
            {ACCOUNT_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`transition hover:text-[#E8A54B] ${pathname === href ? "text-[#E8A54B]" : ""}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} LifePage. All rights reserved.</p>
          <p>
            Made with care to help you choose <span className="text-[#E8A54B]">the right career</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
