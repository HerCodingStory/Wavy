"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X, Home, Wind, Waves, Video, Map, Link as LinkIcon } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { WebcamEmbed } from "@/components/WebcamEmbed";
import { YouTubeEmbed } from "@/components/YoutubeEmbed";
import { WindyEmbed } from "@/components/WindyEmbed";
import { locations } from "@/lib/sources";

type WindData = { today?: string; tonight?: string; speed?: number; gusts?: number; direction?: number; error?: string };
type WavesData = { waveHeight?: number; period?: number; direction?: number; error?: string };
type TidesData = any;
type QualityData = { source?: string; status?: string; last_updated?: string; temperature?: string; timestamp?: string; error?: string };

export default function Page() {
  const [selected, setSelected] = useState(locations[0]);
  const [wind, setWind] = useState<any>(null);
  const [waves, setWaves] = useState<any>(null);
  const [air, setAir] = useState<any>(null);
  const [tides, setTides] = useState<any>(null);
  const [quality, setQuality] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    const { lat, lon } = selected.coords;

    async function fetchData() {
      try {
        const [windRes, waveRes, tideRes, airRes, qualityRes] = await Promise.all([
          fetch(`/api/wind?lat=${lat}&lon=${lon}`),
          fetch(`/api/waves?lat=${lat}&lon=${lon}`),
          fetch(`/api/tides?station=${selected.noaaStation}`),
          fetch(`/api/air?lat=${lat}&lon=${lon}`),
          fetch(`/api/water-quality?station=${selected.noaaStation}`),
        ]);

        setWind(await windRes.json());
        setWaves(await waveRes.json());
        setTides(await tideRes.json());
        setAir(await airRes.json());
        setQuality(await qualityRes.json());
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchData();
  }, [selected]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { id: "wind", label: "Wind", icon: <Wind size={18} /> },
    { id: "waves", label: "Waves", icon: <Waves size={18} /> },
    { id: "live", label: "Live Cams", icon: <Video size={18} /> },
    { id: "map", label: "Wind Map", icon: <Map size={18} /> },
    { id: "links", label: "Links", icon: <LinkIcon size={18} /> },
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
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-foam/70 hover:bg-foam/10 hover:text-foam transition-all"
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
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
              <h1 className="text-lg font-bold">Dashboard</h1>
            </div>
          </div>

          <select
            value={selected.id}
            onChange={(e) => {
              const next = locations.find((s) => s.id === e.target.value);
              if (next) setSelected(next);
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

        {/* Stats Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader title="Wind Forecast" />
            <CardBody>
              {wind?.speed ? (
                <div>
                  <p className="text-lg font-bold">💨 {wind.speed} mph</p>
                  <p className="text-sm text-ocean/70">Gusts: {wind.gusts} mph</p>
                </div>
              ) : (
                <p className="text-sm text-ocean/50 italic">
                  {wind?.error || "No wind data available"}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Wave Height" />
            <CardBody>
              <p className="text-3xl font-bold">
                🌊 {waves?.waveHeight?.toFixed?.(1) ?? "--"} m
              </p>
              <p className="text-sm text-ocean/70">Current wave height</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Water Quality" />
            <CardBody>
              <p className="text-2xl font-bold">
                {quality?.status || "Unavailable"}
              </p>
              <p className="text-sm text-ocean/70">
                Source: {quality?.source || "Swim Guide"}
              </p>
            </CardBody>
          </Card>
        </section>

        {/* Wind Map */}
        <section>
          <h2 className="text-2xl font-bold mb-4">💨 Wind Map</h2>
          <div className="rounded-xl overflow-hidden">
            <WindyEmbed lat={selected.coords.lat} lon={selected.coords.lon} />
          </div>
        </section>

        {/* Live Cams */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">🎥 Live Beach Cams</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <WebcamEmbed
              title="Key Biscayne Kite Shop Cam"
              src="https://g1.ipcamlive.com/player/player.php?alias=6030787be95a2&autoplay=true"
            />
            <YouTubeEmbed title="Coral City Camera" videoId="7i8ARjIeM2k" />
          </div>
        </section>

        {/* Links */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-ocean/5 rounded-xl overflow-hidden">
            <iframe
              src="https://keybiscayne.fl.gov/uniquely_kb/kb_beach_cam.php"
              className="w-full h-[220px] sm:h-[250px] border-0 scale-[0.9] origin-top"
            />
            <a
              href="https://keybiscayne.fl.gov/uniquely_kb/kb_beach_cam.php"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-semibold text-ocean py-2 bg-sand hover:underline"
            >
              Key Biscayne Beach Cam
            </a>
          </div>

          <div className="bg-ocean/5 rounded-xl overflow-hidden">
            <iframe
              src="https://www.miamiandbeaches.com/plan-your-trip/miami-webcams?wc=4"
              className="w-full h-[220px] sm:h-[250px] border-0 scale-[0.9] origin-top"
            />
            <a
              href="https://www.miamiandbeaches.com/plan-your-trip/miami-webcams?wc=4"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-semibold text-ocean py-2 bg-sand hover:underline"
            >
              Miami Beach Live Cams
            </a>
          </div>

          <div className="bg-ocean/5 rounded-xl overflow-hidden">
            <iframe
              src="https://sunnyislesbeachmiami.com/beach-cam/"
              className="w-full h-[220px] sm:h-[250px] border-0 scale-[0.9] origin-top"
            />
            <a
              href="https://sunnyislesbeachmiami.com/beach-cam/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-semibold text-ocean py-2 bg-sand hover:underline"
            >
              Sunny Isles – Newport Pier
            </a>
          </div>
        </section>

        <footer className="text-center text-xs text-ocean/60 mt-10 pb-4">
          Built for water lovers in Miami 🌴 | Data from NOAA, NWS, Open-Meteo, SwimGuide
        </footer>
      </main>
    </div>
  );
}
