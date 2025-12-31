"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wind, Waves, Video, Link as LinkIcon } from "lucide-react";
import { locations } from "@/lib/sources";

interface LayoutProps {
  children: React.ReactNode;
  selectedLocation: typeof locations[0];
  onLocationChange: (location: typeof locations[0]) => void;
}

export function Layout({ children, selectedLocation, onLocationChange }: LayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={22} />, path: "/" },
    { id: "wind", label: "Wind", icon: <Wind size={22} />, path: "/wind" },
    { id: "waves", label: "Waves", icon: <Waves size={22} />, path: "/waves" },
    { id: "live", label: "Live", icon: <Video size={22} />, path: "/live" },
    { id: "links", label: "Links", icon: <LinkIcon size={22} />, path: "/links" },
  ];

  return (
    <div className="flex flex-col h-screen bg-sand text-ocean md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-60 bg-ocean text-foam flex-col z-30">
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

      {/* Main Content */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-0">
        {/* Mobile/Desktop Header */}
        <header className="sticky top-0 z-20 bg-ocean/95 backdrop-blur-lg border-b border-ocean/20 safe-area-top md:bg-sand/95">
          <div className="px-4 py-3 md:px-6 md:py-4">
            {/* Mobile: Logo (Centered) */}
            <div className="flex items-center justify-center mb-3 md:hidden">
              <Image 
                src="/logo1.png" 
                alt="Wavy" 
                width={48} 
                height={48}
                className="flex-shrink-0"
              />
            </div>
            
            {/* Desktop: Title */}
            <div className="hidden md:block mb-3">
              <h1 className="text-xl font-bold">
                {menuItems.find((item) => item.path === pathname)?.label || "Dashboard"}
              </h1>
            </div>

            {/* Location Selector */}
            <select
              value={selectedLocation.id}
              onChange={(e) => {
                const next = locations.find((s) => s.id === e.target.value);
                if (next) onLocationChange(next);
              }}
              className="w-full md:w-auto bg-white/90 md:bg-white border border-foam/20 md:border-ocean/20 text-ocean md:text-ocean rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-coral text-sm font-medium shadow-sm"
            >
              {locations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-10 space-y-6 pb-20 md:pb-6 safe-area-bottom">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-ocean border-t border-ocean/20 z-30 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                  isActive
                    ? "text-foam"
                    : "text-foam/60"
                }`}
              >
                <div className={`${isActive ? "scale-110" : ""} transition-transform`}>
                  {item.icon}
                </div>
                <span className={`text-xs mt-1 ${isActive ? "font-semibold" : "font-normal"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

