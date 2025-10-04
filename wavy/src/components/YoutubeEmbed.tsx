"use client";

interface YouTubeEmbedProps {
  title: string;
  videoId: string;
}

export function YouTubeEmbed({ title, videoId }: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-white/10 bg-black/30">
      <div className="p-2 bg-black/50 text-center text-sm text-white/80 font-semibold">
        {title}
      </div>
      <iframe
        className="w-full aspect-video"
        src={embedUrl}
        title={title}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
