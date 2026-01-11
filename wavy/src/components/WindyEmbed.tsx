"use client";

import { useEffect, useRef } from "react";

export function WindyEmbed({ lat, lon }: { lat: number; lon: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Update iframe src when coordinates change
    if (iframeRef.current) {
      const newSrc = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=11&level=surface&overlay=wind&menu=&message=true`;
      iframeRef.current.src = newSrc;
    }
  }, [lat, lon]);

  const src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=11&level=surface&overlay=wind&menu=&message=true`;
  // Use coordinates as key to force iframe reload when location changes
  const iframeKey = `${lat.toFixed(4)}-${lon.toFixed(4)}`;
  
  return (
    <div className="rounded-xl overflow-hidden border border-ocean shadow-md h-[400px] md:h-[calc(100vh-200px)] md:min-h-[600px]">
      <iframe
        key={iframeKey}
        ref={iframeRef}
        width="100%"
        height="100%"
        src={src}
        title="Wind Map"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
}