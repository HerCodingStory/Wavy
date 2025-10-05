export function WindyEmbed({ lat, lon }: { lat: number; lon: number }) {
  const src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=9&level=surface&overlay=wind&menu=&message=true`;
  return (
    <div className="rounded-xl overflow-hidden border border-ocean shadow-md h-[400px]">
      <iframe
        width="100%"
        height="100%"
        src={src}
        title="Wind Map"
        allowFullScreen
      ></iframe>
    </div>
  );
}