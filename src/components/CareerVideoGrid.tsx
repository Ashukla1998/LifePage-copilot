"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CareerVideo } from "@/lib/careerVideos";

interface CareerVideoGridProps {
  count?: number;
  /** Shown if no videos could be loaded */
  fallback?: React.ReactNode;
}

type State = { status: "loading" } | { status: "ready"; videos: CareerVideo[] } | { status: "error" };

export default function CareerVideoGrid({ count = 4, fallback = null }: CareerVideoGridProps) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/career-videos?count=${count}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        const videos: CareerVideo[] = json?.success ? json.data : [];
        setState(videos.length ? { status: "ready", videos } : { status: "error" });
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setState({ status: "error" });
      });
    return () => controller.abort();
  }, [count]);

  if (state.status === "error") return <>{fallback}</>;

  return (
    // A 16:9 grid of 2x2 ≈16:9 tiles, matching the session thumbnails (1700x956) and the
    // neighbouring card's 16:9 image so both cards line up
    <div className="grid aspect-video w-full grid-cols-2 grid-rows-2 gap-0.5 bg-black">
      {state.status === "loading"
        ? Array.from({ length: count }, (_, i) => (
            <div key={i} className="animate-pulse bg-gray-800" aria-hidden />
          ))
        : state.videos.map((video) => <CareerTile key={video.sessionId} video={video} />)}
    </div>
  );
}

function CareerTile({ video }: { video: CareerVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Only attach the MP4 once the tile is hovered, so 9 videos don't download up front
  const [activated, setActivated] = useState(false);
  // Keep the thumbnail visible until the video has a frame to show
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setActivated(true);
    // The src may only just have been attached; play once React has rendered it
    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  };

  const stop = () => {
    setPlaying(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  // 0 years (same calendar year) isn't worth showing
  const experience = video.experienceYears
    ? `${video.experienceYears} ${video.experienceYears === 1 ? "yr" : "yrs"} exp`
    : "";
  // Shorter form for the phone strip, e.g. "13 yrs"
  const shortExperience = video.experienceYears
    ? `${video.experienceYears} ${video.experienceYears === 1 ? "yr" : "yrs"}`
    : "";

  const href = `/articles?${new URLSearchParams({ profileid: video.sessionId, topic: video.career })}`;

  return (
    <Link
      href={href}
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
      className="group relative block h-full w-full overflow-hidden bg-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
      aria-label={[video.speaker, video.designation, video.career, experience, video.lang].filter(Boolean).join(", ")}
    >
      {video.thumbUrl && (
        <Image
          src={video.thumbUrl}
          alt=""
          fill
          // Bucket images skip the optimizer, same as the rest of the app: it can't fetch them in production
          unoptimized
          sizes="(min-width: 1024px) 250px, (min-width: 768px) 25vw, 50vw"
          className="object-contain transition-transform duration-500 group-hover:scale-105"
        />
      )}

      <video
        ref={videoRef}
        src={activated ? video.videoUrl : undefined}
        poster={video.thumbUrl || undefined}
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setPlaying(true)}
        onWaiting={() => setPlaying(false)}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
      />

      {/* Experience + language badges: hover devices only (on phones they'd cover the small tiles) */}
      {(experience || video.lang) && (
        <div className="absolute top-2 right-2 hidden flex-wrap justify-end gap-1 transition-opacity duration-300 [@media(hover:hover)]:flex [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
          {experience && (
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white shadow sm:text-[11px]">
              {experience}
            </span>
          )}
          {video.lang && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow sm:text-[11px]">
              {video.lang}
            </span>
          )}
        </div>
      )}

      {/* Touch screens: always-on slim strip (name + career). Hover devices: full details on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-2 pt-4 pb-1.5 text-left [@media(hover:hover)]:via-black/50 [@media(hover:hover)]:px-3 [@media(hover:hover)]:pt-8 [@media(hover:hover)]:pb-2 text-white transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
        <p className="truncate text-xs font-semibold leading-tight sm:text-sm">{video.speaker}</p>
        {video.designation && (
          <p className="mt-0.5 hidden truncate text-[11px] leading-tight text-white/80 sm:text-xs [@media(hover:hover)]:block">
            {video.designation}
          </p>
        )}
        <p className="mt-0.5 truncate text-[11px] leading-tight text-orange-300 sm:text-xs">{video.career}</p>
        {/* Touch screens only: compact experience + language line (hover devices use the badges) */}
        {(shortExperience || video.lang) && (
          <p className="mt-0.5 truncate text-[10px] leading-tight text-white/75 [@media(hover:hover)]:hidden">
            {[shortExperience, video.lang].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
