"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function HlsPlayer({
  src,
  autoPlay = true,
  muted = true,
}: {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="w-full aspect-video rounded-xl border border-white/10"
      controls
      playsInline
      autoPlay={autoPlay}
      muted={muted}
    />
  );
}
