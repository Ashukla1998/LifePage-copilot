"use client";

import { useEffect, useRef } from "react";
import type { MediaPlayerClass } from "dashjs";

interface AdaptiveVideoProps {
  dashUrl: string;
  mp4Url: string;
  className?: string;
}

// Streams the DASH manifest with dash.js so quality adapts to the viewer's connection.
// Falls back to the progressive MP4 when Media Source isn't available, when the bucket
// blocks the cross-origin manifest request (no CORS headers), or when dash.js errors.
export default function AdaptiveVideo({ dashUrl, mp4Url, className }: AdaptiveVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let player: MediaPlayerClass | null = null;
    let cancelled = false;
    const controller = new AbortController();

    const playMp4 = () => {
      if (cancelled) return;
      player?.reset();
      player = null;
      video.src = mp4Url;
    };

    const start = async () => {
      const hasMediaSource =
        typeof window !== "undefined" && ("MediaSource" in window || "ManagedMediaSource" in window);
      if (!dashUrl || !hasMediaSource) return playMp4();

      try {
        // dash.js fetches the manifest and segments cross-origin; this fails fast if CORS isn't allowed
        const probe = await fetch(dashUrl, { method: "HEAD", signal: controller.signal });
        if (!probe.ok) return playMp4();
      } catch {
        return playMp4();
      }

      const dashjs = await import("dashjs");
      if (cancelled) return;

      player = dashjs.MediaPlayer().create();
      player.on(dashjs.MediaPlayer.events.ERROR, playMp4);
      player.initialize(video, dashUrl, false);
    };

    start();

    return () => {
      cancelled = true;
      controller.abort();
      player?.reset();
      video.removeAttribute("src");
      video.load();
    };
  }, [dashUrl, mp4Url]);

  return (
    <video ref={videoRef} controls playsInline preload="metadata" className={className}>
      Your browser can&apos;t play this video.
    </video>
  );
}
