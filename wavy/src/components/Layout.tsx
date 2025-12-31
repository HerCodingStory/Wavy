"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Wind, Waves, Video, Link as LinkIcon } from "lucide-react";
import { locations } from "@/lib/sources";

interface LayoutProps {
  children: React.ReactNode;
  selectedLocation: typeof locations[0];
  onLocationChange: (location: typeof locations[0]) => void;
}

export function Layout({ children, selectedLocation, onLocationChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} />, path: "/" },
    { id: "wind", label: "Wind", icon: <Wind size={18} />, path: "/wind" },
    { id: "waves", label: "Waves", icon: <Waves size={18} />, path: "/waves" },
    { id: "live", label: "Live Cams", icon: <Video size={18} />, path: "/live" },
    { id: "links", label: "Links", icon: <LinkIcon size={18} />, path: "/links" },
  ];

  return (
    <div className="flex h-screen bg-sand text-ocean">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-ocean text-foam flex flex-col z-30 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex flex-col items-center space-y-3 border-b border-foam/10">
          <Image src="/logo1.png" alt="Wavy Escape" width={80} height={80} />
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-foam/20 text-foam"
                    : "text-foam/70 hover:bg-foam/10 hover:text-foam"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <footer className="text-xs text-center text-foam/50 pb-6">
          © 2025 Wavy
        </footer>
      </aside>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-60 p-6 md:p-10 space-y-10 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center sticky top-0 bg-sand/80 backdrop-blur-md z-10 py-3 border-b border-ocean/10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-ocean"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">
                {menuItems.find((item) => item.path === pathname)?.label || "Dashboard"}
              </h1>
            </div>
          </div>

          <select
            value={selectedLocation.id}
            onChange={(e) => {
              const next = locations.find((s) => s.id === e.target.value);
              if (next) onLocationChange(next);
            }}
            className="bg-white border border-ocean/20 text-ocean rounded-xl px-3 py-2 focus:ring-2 focus:ring-coral text-sm"
          >
            {locations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </header>

        {children}
      </main>
    </div>
  );
}

