// components/Navbar.tsx
import Image from "next/image";

interface NavbarProps {
  careerCount: number;
}

export default function Navbar({ careerCount }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        
        {/* Left Logo */}
        <div className="flex items-center">
          <Image
            src="/icon.png" // Place your logo inside /public
            alt="Logo"
            width={140}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </div>

        {/* Center Title */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-center text-sm font-semibold text-gray-900 sm:text-lg md:text-xl">
            World's Largest Career Repo About{" "}
            <span className="text-orange-600 font-bold">
              {careerCount.toLocaleString()||0}
            </span>{" "}
            Careers
          </h1>
        </div>
      </div>
    </nav>
  );
}