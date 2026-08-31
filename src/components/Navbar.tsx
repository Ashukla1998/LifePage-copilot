"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface NavbarProps {
  careerCount?: string | number;
}

export default function Navbar({ careerCount }: NavbarProps) {
  const [internalCount, setInternalCount] = useState<string>(
    careerCount ? String(careerCount) : ""
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync prop changes if passed dynamically later
  useEffect(() => {
    if (careerCount) {
      setInternalCount(String(careerCount));
    }
  }, [careerCount]);

  // 🔹 Automatically fetch from API only if careerCount is NOT provided
  useEffect(() => {
    if (careerCount) return;

    const fetchNavbarCount = async () => {
      try {
        const res = await fetch("https://www.lifepage.in/n/api/navbar", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        if (json.success === 1 && json.count) {
          setInternalCount(String(json.count));
        }
      } catch (error) {
        console.error("Error fetching navbar career count:", error);
      }
    };

    fetchNavbarCount();
  }, [careerCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedCount = internalCount
    ? Number(internalCount).toLocaleString()
    : "0";

  return (
    <nav className="sticky top-0 z-50 w-full bg-[url('/topbg.jpg')] bg-cover bg-center bg-no-repeat shadow-sm text-white shrink-0">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/icon.png"
              alt="Logo"
              width={140}
              height={40}
              priority
              className="h-10 w-auto cursor-pointer"
            />
          </Link>
        </div>

        {/* Center Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <h1 className="text-center text-xs font-semibold sm:text-lg md:text-xl whitespace-nowrap">
            World&apos;s largest Career Repository of{" "}
            <span className="text-orange-500 font-bold">
              {formattedCount}
            </span>{" "}
            Careers!
          </h1>
        </div>

        {/* Right Burger Menu & Dropdown */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/40 text-white transition hover:bg-black/60 focus:outline-none"
          >
            {/* Hamburger / Close Icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 top-12 mt-2 w-56 origin-top-right rounded-xl border border-gray-700 bg-[#222222] p-2 text-white shadow-2xl ring-1 ring-black/50 z-50">
              <div className="flex flex-col gap-1 text-sm font-medium">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition hover:bg-[#ffc000] hover:text-black"
                >
                  Login
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition hover:bg-[#ffc000] hover:text-black"
                >
                  Home
                </Link>
                <Link
                  href="/career-duels"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition hover:bg-[#ffc000] hover:text-black"
                >
                  Career Duels
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition hover:bg-[#ffc000] hover:text-black"
                >
                  Compare Careers
                </Link>
                <div className="my-1 border-t border-gray-700/60" />
                <Link
                  href="/advisor-list"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition hover:bg-[#ffc000] hover:text-black"
                >
                  Find Advisors
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}