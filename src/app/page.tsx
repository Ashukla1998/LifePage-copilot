import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Lightbulb, PenLine, Sparkles, type LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import AdaptiveVideo from "@/components/AdaptiveVideo";
import ComingSoonButton from "@/components/ComingSoonButton";
import CareerVideoGrid from "@/components/CareerVideoGrid";
import { jakarta } from "@/lib/fonts";
import { dashManifestUrl, resolveVideoUrl } from "@/lib/articles";
// import Footer from "@/components/Footer";
interface CommunityCard {
  href: string;
  icon: LucideIcon;
  title: React.ReactNode;
  description: string;
  cta: string;
  /** Background + hover classes for the CTA button; defaults to dark */
  ctaColor?: string;
  image: string;
  alt: string;
  /** Bucket session whose video plays in place of the image */
  videoSession?: string;
  /** CTA button shows a "coming soon" toast instead of navigating (image still links) */
  comingSoon?: boolean;
}

const cards: CommunityCard[] = [
  {
    href: "/learning-from-others",
    icon: Lightbulb,
    title: <>Learn From Career Pages of Real Professionals!</>,
    description: "Gain perspective by exploring stories, tips, and wisdom from professionals like you.",
    cta: "Start Now",
    ctaColor: "bg-orange-500 hover:bg-orange-600",
    image: "/learning_from_others.png",
    alt: "Friends sharing career stories on a hilltop at sunset",
    videoSession: "20170205-0005",
  },
  {
    href: "/share-your-experience",
    icon: PenLine,
    title: (
      <>
        Document your Career Pages! 
      </>
    ),
    description: "Help others by sharing your career journey, insights, and triumphs.",
    cta: "Share My Story",
    // Faded to signal the feature isn't available yet (button shows a coming-soon toast)
    ctaColor: "bg-[#111827]/40 hover:bg-[#111827]/50",
    image: "/share_your_experience.png",
    alt: "Student writing in a notebook while watching the sunset over the mountains",
    comingSoon: true,
  },
];

export default function Home() {
  return (
    <div className="flex-1 w-full bg-[#fbf6ec] flex flex-col">
      <Navbar />

      <main className={`flex-1 w-full ${jakarta.className}`}>
        <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-6 pb-10 text-center sm:px-6 sm:pt-12 sm:pb-14">

          {/* Cards */}
          <div className="mt-2 grid w-full gap-5 text-left sm:mt-10 sm:gap-6 md:grid-cols-2">
            {cards.map(({ href, icon: Icon, title, description, cta, ctaColor, image, alt, videoSession, comingSoon }, index) => {
              const ctaClassName = `group mt-auto flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition sm:px-6 ${ctaColor ?? "bg-[#111827] hover:bg-[#1f2937]"}`;
              const ctaContent = (
                <>
                  <Sparkles className="h-4 w-4 text-[#f5c26b]" />
                  {cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              );
              const media = (
                <Image
                  src={image}
                  alt={alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 490px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              );
              return (
              <div
                key={href}
                className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(17,24,39,0.06)] sm:rounded-3xl"
              >
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <div className="mb-5 flex items-start gap-3 sm:items-center sm:gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fdf0dc] text-[#C9822B] sm:h-16 sm:w-16 lg:h-18 lg:w-18">
                      <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold leading-tight text-gray-900 sm:text-xl lg:text-2xl">{title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600 sm:mt-1.5">{description}</p>
                    </div>
                  </div>

                  {comingSoon ? (
                    <ComingSoonButton className={ctaClassName}>{ctaContent}</ComingSoonButton>
                  ) : (
                    <Link href={href} className={ctaClassName}>
                      {ctaContent}
                    </Link>
                  )}
                </div>

                {videoSession ? (
                  <div className="relative w-full overflow-hidden bg-black">
                    <CareerVideoGrid
                      fallback={
                        <div className="aspect-video w-full">
                          <AdaptiveVideo
                            mp4Url={resolveVideoUrl(`${videoSession}.mp4`, videoSession)}
                            dashUrl={dashManifestUrl(`${videoSession}.mp4`, videoSession)}
                            poster={resolveVideoUrl(`${videoSession}1.JPG`, videoSession)}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <Link href={href} className="relative block aspect-video w-full overflow-hidden" tabIndex={-1}>
                    {media}
                  </Link>
                )}
              </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
