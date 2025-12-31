"use client";

export function LoadingWaves() {
  const bars = [20, 30, 40, 30, 20, 35, 25, 30];
  
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-end justify-center gap-1.5 h-12">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-1.5 bg-ocean rounded-full"
            style={{
              height: `${height}px`,
              animation: `wave 0.6s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
