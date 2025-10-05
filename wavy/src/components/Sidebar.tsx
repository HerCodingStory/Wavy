"use client";

import { useState } from "react";
import { Home, Wind, Waves, Video, Map, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

export function Sidebar() {
  const [active, setActive] = useState("home");

  const menuItems = [
    { id: "home", label: "Dashboard", icon: <Home size={18} /> },
    { id: "wind", label: "Wind", icon: <Wind size={18} /> },
    { id: "waves", label: "Waves", icon: <Waves size={18} /> },
    { id: "live", label: "Live Cams", icon: <Video size={18} /> },
    { id: "map", label: "Wind Map", icon: <Map size={18} /> },
    { id: "links", label: "Links", icon: <LinkIcon size={18} /> },
  ];

  return (
    <aside className="h-screen w-56 bg-ocean/95 text-white flex flex-col justify-between fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 flex flex-col items-center space-y-3">
        <Image
          src="/logo.png" // your logo file
          alt="Wavy"
          width={60}
          height={60}
          className="rounded-full"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
              active === item.id
                ? "bg-white/20 text-white font-semibold"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="text-xs text-white/60 text-center pb-4">
        © 2025 Wavy Escape
      </div>
    </aside>
  );
}
