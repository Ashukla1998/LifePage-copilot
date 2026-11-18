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

export default function CareerVideoGrid({ count = 9, fallback = null }: CareerVideoGridProps) {
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
    <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-0.5 bg-black">
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

  const href = `/articles?${new URLSearchParams({ profileid: video.sessionId, topic: video.career })}`;

  return (
    <Link
      href={href}
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
      className="group relative block h-full w-full overflow-hidden bg-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
      aria-label={`${video.speaker}, ${video.career}`}
    >
      {video.thumbUrl && (
        <Image
          src={video.thumbUrl}
          alt=""
          fill
          // Bucket images skip the optimizer, same as the rest of the app: it can't fetch them in production
          unoptimized
          sizes="(min-width: 1024px) 165px, (min-width: 768px) 17vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
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
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
      />

      {/* Name + career: always shown on touch screens, revealed on hover elsewhere */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/50 to-transparent px-2 pt-6 pb-1.5 text-left text-white transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
        <p className="truncate text-[11px] font-semibold leading-tight sm:text-xs">{video.speaker}</p>
        <p className="truncate text-[10px] leading-tight text-orange-300 sm:text-[11px]">{video.career}</p>
      </div>
    </Link>
  );
}
