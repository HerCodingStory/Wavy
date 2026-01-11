export function WaveMapEmbed({ lat, lon }: { lat: number; lon: number }) {
  const src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=9&level=surface&overlay=waves&menu=&message=true`;
  return (
    <div className="rounded-xl overflow-hidden border border-ocean shadow-md h-[400px] md:h-[calc(100vh-200px)] md:min-h-[600px]">
      <iframe
        width="100%"
        height="100%"
        src={src}
        title="Wave Map"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
}

