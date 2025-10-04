"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { WebcamCard } from "@/components/WebcamCard";
import { WebcamEmbed } from "@/components/WebcamEmbed";
import { YouTubeEmbed } from "@/components/YoutubeEmbed";

import HlsPlayer from "@/components/HlsPlayer";
import { stations } from "@/lib/sources";

export default function Page() {
  const [selectedStation, setSelectedStation] = useState("8723214");
  const [wind, setWind] = useState<any>(null);
  const [tides, setTides] = useState<any>(null);
  const [quality, setQuality] = useState<any>(null);

  const ozolioStream =
    "https://use01-smr03-relay.ozolio.com/hls-live/_definst_/relay01.byfvdg3.m3u8";
  const ozolioIframe = "https://relay.ozolio.com/player/?camId=5121&autoplay=true";

  useEffect(() => {
    fetch("/api/wind").then((r) => r.json()).then(setWind);
    fetch("/api/tides").then((r) => r.json()).then(setTides);
    // fetch("/api/water-quality").then((r) => r.json()).then(setQuality);
  }, []);

  useEffect(() => {
    fetch(`/api/water-quality?station=${selectedStation}`)
      .then((r) => r.json())
      .then(setQuality);
  }, [selectedStation]);

  const waterTemp = tides?.waterTemp?.data?.[0]?.v;
  const windText = wind?.today || "Loading...";
  const tonightText = wind?.tonight || "";
  const qualityLabel = quality?.status_label || "Unavailable";

  // determine color + emoji indicators
  const getQualityIndicator = (label: string) => {
    if (label.includes("Good")) return { icon: "🟢", color: "text-green-400" };
    if (label.includes("Poor")) return { icon: "🔴", color: "text-red-400" };
    if (label.includes("Caution")) return { icon: "🟡", color: "text-yellow-400" };
    return { icon: "⚪", color: "text-white/60" };
  };

  const qualityStatus = getQualityIndicator(qualityLabel);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-10 text-white">
      {/* HEADER */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-brand.aqua">
          🌊 Miami Watersports Dashboard
        </h1>
        <p className="text-white/70">
          Kiteboarding • Wakeboarding • Surf conditions
        </p>

        {/* DROPDOWN */}
        <div className="flex justify-center">
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="bg-brand.purple text-white border border-white/20 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand.aqua outline-none"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* STATS CARDS */}
      <section className="grid md:grid-cols-3 gap-6">
        {/* Wind Forecast */}
        <Card>
          <CardHeader title="Wind Forecast (NWS)" />
          <CardBody>
            {wind?.error ? (
              <p className="text-red-400 text-sm">Error loading forecast</p>
            ) : (
              <>
                <div className="flex items-center gap-2 text-brand.aqua text-sm font-semibold mb-2">
                  💨 Today
                </div>
                <p className="text-sm opacity-80">{windText}</p>
                {tonightText && (
                  <>
                    <div className="flex items-center gap-2 text-brand.pink text-sm font-semibold mt-4 mb-1">
                      🌙 Tonight
                    </div>
                    <p className="text-sm opacity-80">{tonightText}</p>
                  </>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* Tide & Water Temp */}
        <Card>
          <CardHeader title="Tide & Water Temp (NOAA)" />
          <CardBody>
            {waterTemp ? (
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center gap-2 text-brand.aqua text-lg font-bold">
                  🌡️ {waterTemp} °F
                </div>
                <p className="text-sm opacity-80">
                  Sea surface temperature near Virginia Key.
                </p>
              </div>
            ) : (
              <p className="text-sm opacity-50">Loading water data...</p>
            )}
          </CardBody>
        </Card>

        {/* Water Quality */}
        <Card>
          <CardHeader title="Water Conditions (NOAA)" />
          <CardBody>
            {quality?.error ? (
              <p className="text-sm text-red-400">Error loading data</p>
            ) : quality ? (
              <div className="space-y-2 text-sm">
                {quality.temperature && (
                  <div className="flex items-center gap-2">
                    🌡️ <span>Temperature:</span>
                    <span className="font-semibold text-brand.aqua">
                      {quality.temperature} °F
                    </span>
                  </div>
                )}
                {quality.salinity && (
                  <div className="flex items-center gap-2">
                    🌊 <span>Salinity:</span>
                    <span className="font-semibold text-brand.pink">
                      {quality.salinity} PSU
                    </span>
                  </div>
                )}
                {quality.oxygen && (
                  <div className="flex items-center gap-2">
                    🫧 <span>Dissolved Oxygen:</span>
                    <span className="font-semibold text-green-400">
                      {quality.oxygen} mg/L
                    </span>
                  </div>
                )}
                <p className="text-xs text-white/40 mt-2">
                  Station ID: {quality.station || "—"} • Last update:{" "}
                  {quality.timestamp || "—"}
                </p>
              </div>
            ) : (
              <p className="text-sm opacity-50">Loading latest readings...</p>
            )}
          </CardBody>
        </Card>

      </section>

      {/* WEBCAM LINKS */}
      <section className="grid md:grid-cols-3 gap-6">
        <WebcamCard
          title="Key Biscayne Beach Cam"
          href="https://keybiscayne.fl.gov/uniquely_kb/kb_beach_cam.php"
        />
        <WebcamCard
          title="Miami & Beaches Webcams"
          href="https://www.miamiandbeaches.com/plan-your-trip/miami-webcams?wc=2"
        />
        <WebcamCard
          title="Sunny Isles – Newport Pier"
          href="https://sunnyislesbeachmiami.com/beach-cam/"
        />
      </section>

      {/* LIVE STREAM SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-brand.aqua">🎥 Live Beach Cams</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <WebcamEmbed
            title="Key Biscayne Live Cam"
            src="https://g1.ipcamlive.com/player/player.php?alias=6030787be95a2&autoplay=true"
          />
          <WebcamEmbed
            title="Miami Beach Ocean Cam"
            src="https://relay.ozolio.com/player/?camId=5121&autoplay=true"
          />
          <YouTubeEmbed
            title="Coral City Camera"
            videoId="7i8ARjIeM2k" // your YouTube video ID
          />
        </div>
      </section>

      <footer className="text-center text-xs text-white/40 pt-6">
        Built for water lovers in Miami 🌴 | Data from NWS, NOAA, and Swim Guide
      </footer>
    </main>
  );
}
