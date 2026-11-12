import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Lightbulb, PenLine, Sparkles, type LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { jakarta } from "@/lib/fonts";
// import Footer from "@/components/Footer";
interface CommunityCard {
  href: string;
  icon: LucideIcon;
  title: React.ReactNode;
  description: string;
  cta: string;
  image: string;
  alt: string;
}

const cards: CommunityCard[] = [
  {
    href: "/share-your-experience",
    icon: PenLine,
    title: (
      <>
        Share Your <span className="text-[#C9822B]">Experience</span>! ✨
      </>
    ),
    description: "Help others by sharing your career journey, insights, and triumphs.",
    cta: "Share My Story",
    image: "/share_your_experience.png",
    alt: "Student writing in a notebook while watching the sunset over the mountains",
  },
  {
    href: "/learning-from-others",
    icon: Lightbulb,
    title: <>Learning From Others 💡</>,
    description: "Gain perspective by exploring stories, tips, and wisdom from professionals like you.",
    cta: "Browse Stories",
    image: "/learning_from_others.png",
    alt: "Friends sharing career stories on a hilltop at sunset",
  },
];

export default function Home() {
  return (
    <div className="flex-1 w-full bg-[#fbf6ec] flex flex-col">
      <Navbar />

      <main className={`flex-1 w-full ${jakarta.className}`}>
        <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-10 pb-14 text-center sm:px-6 sm:pt-12">
          {/* Pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-[#fdf0dc] px-5 py-2 text-xs font-medium text-[#B87523] shadow-sm sm:text-sm">
            <Sparkles className="h-4 w-4" />
            Engage with our Community
            <ChevronRight className="h-4 w-4" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold leading-[1.15] tracking-[-0.015em] text-[#111827] sm:text-5xl">
            <span className="text-[#C9822B]">Share</span> and <span className="text-[#C9822B]">Learn</span> from
            <br />
            our Community
          </h1>
          <p className="mt-5 max-w-[520px] text-sm leading-relaxed text-gray-500 sm:text-lg">
            Connect with professionals, find inspiration, and grow together through shared insights.
          </p>

          {/* Cards */}
          <div className="mt-10 grid w-full gap-6 text-left md:grid-cols-2">
            {cards.map(({ href, icon: Icon, title, description, cta, image, alt }, index) => (
              <div
                key={href}
                className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(17,24,39,0.06)]"
              >
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#fdf0dc] text-[#C9822B] sm:h-[72px] sm:w-[72px]">
                      <Icon className="h-7 w-7" />
                    </span>
                    <div>
                      <h2 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">{title}</h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{description}</p>
                    </div>
                  </div>

                  <Link
                    href={href}
                    className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1f2937]"
                  >
                    <Sparkles className="h-4 w-4 text-[#f5c26b]" />
                    {cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <Link href={href} className="relative block aspect-[6/5] w-full overflow-hidden" tabIndex={-1}>
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 490px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
