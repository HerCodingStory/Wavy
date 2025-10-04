"use client";

interface WebcamEmbedProps {
  title: string;
  src: string;
}

export function WebcamEmbed({ title, src }: WebcamEmbedProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-white/10 bg-black/30">
      <div className="p-2 bg-black/50 text-center text-sm text-white/80 font-semibold">
        {title}
      </div>
      <iframe
        src={src}
        title={title}
        className="w-full aspect-video"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
