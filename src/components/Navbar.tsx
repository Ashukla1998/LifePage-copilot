import Image from "next/image";
import React from "react";

interface NavbarProps {
  careerCount: string;
}

export default function Navbar({ careerCount }: NavbarProps) {
  const formattedCount = careerCount
    ? Number(careerCount).toLocaleString()
    : "0";

  return (
    <nav className="sticky top-0 z-50 w-full bg-[url('/topbg.jpg')] bg-cover bg-center bg-no-repeat shadow-sm text-white shrink-0">
      {/* <div className="bg-black/30"> */}
        <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          {/* Left Logo */}
          <div className="flex items-center">
            <Image
              src="/icon.png"
              alt="Logo"
              width={140}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </div>

          {/* Center Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-center text-sm font-semibold sm:text-lg md:text-xl">
              World's largest Career Repository of{" "}
              <span className="text-orange-600 font-bold">
                {formattedCount}
              </span>{" "}
              Careers!
            </h1>
          </div>
        {/* </div> */}
      </div>
    </nav>
  );
}