"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { WebcamCard } from "@/components/WebcamCard";
import { WebcamEmbed } from "@/components/WebcamEmbed";
import { YouTubeEmbed } from "@/components/YoutubeEmbed";
import { WindMap } from "@/components/WindMap";

import HlsPlayer from "@/components/HlsPlayer";
import { locations } from "@/lib/sources";
import { WindyEmbed } from "@/components/WindyEmbed";

export default function Page() {
  const [selected, setSelected] = useState(locations[0]);
  const [wind, setWind] = useState<any>(null);
  const [waves, setWaves] = useState<any>(null);
  const [tides, setTides] = useState<any>(null);
  const [quality, setQuality] = useState<any>(null);

  const ozolioStream =
    "https://use01-smr03-relay.ozolio.com/hls-live/_definst_/relay01.byfvdg3.m3u8";
  const ozolioIframe = "https://relay.ozolio.com/player/?camId=5121&autoplay=true";

  useEffect(() => {
    const { lat, lon } = selected.coords;

    async function fetchData() {
      const [windData, waveData, tideData, qualityData] = await Promise.all([
        fetch(`/api/wind?lat=${lat}&lon=${lon}`).then((r) => r.json()),
        fetch(`/api/waves?lat=${lat}&lon=${lon}`).then((r) => r.json()),
        fetch(`/api/tides?station=${selected.noaaStation}`).then((r) => r.json()),
        fetch(`/api/water-quality?id=${selected.swimGuideId}`).then((r) => r.json()),
      ]);

      setWind(windData);
      setWaves(waveData);
      setTides(tideData);
      setQuality(qualityData);
    }

    fetchData();
  }, [selected]);

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
        <p className="text-ocean">
          Choose location to preview:
        </p>

        {/* DROPDOWN */}
        <div className="flex justify-center">
          <select
            value={selected.id}
            onChange={(e) => {
              const newStation = locations.find((s) => s.id === e.target.value);
              if (newStation) setSelected(newStation);
            }}
            className="bg-sand border border-ocean/20 text-ocean rounded-xl px-4 py-2 focus:ring-2 focus:ring-coral"
          >
            {locations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-ocean/70 mt-2">
            Showing data for: <span className="font-semibold">{selected.name}</span>
        </p>
      </header>

      {/* STATS CARDS */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Wind Forecast (NWS)" />
          <CardBody>
            <p className="font-semibold text-coral">Today</p>
            <p className="text-sm text-coral opacity-80">
              {wind?.today || "Loading..."}
            </p>
            {wind?.tonight && (
              <>
                <p className="font-semibold text-ocean mt-4">Tonight</p>
                <p className="text-sm text-ocean opacity-80">{wind.tonight}</p>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Wave Height (Open-Meteo)" />
          <CardBody>
            {waves ? (
              <p className="text-lg font-bold text-ocean">
                🌊 {waves.waveHeight?.toFixed(1)} m
              </p>
            ) : (
              <p className="text-sm opacity-60">Loading...</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Water Quality (Swim Guide)" />
          <CardBody>
            {quality?.status ? (
              <p
                className={`text-lg text-coral font-semibold ${
                  quality.status.includes("Good")
                    ? "text-green-600"
                    : quality.status.includes("Poor")
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {quality.status}
              </p>
            ) : (
              <p className="text-sm text-coral opacity-60">Loading...</p>
            )}
          </CardBody>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader title="Water Temperature (NOAA)" />
          <CardBody>
            <p className="text-lg font-bold text-ocean">
              🌡️ {tides?.data?.[0]?.v || "—"} °F
            </p>
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-ocean mb-4">📍 Map View</h2>
        <WindyEmbed lat={selected.coords.lat} lon={selected.coords.lon} />
      </section>

      {/* LIVE STREAM SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-brand.aqua">🎥 Live Beach Cams</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <WebcamEmbed
            title="Key Biscayne Kite Shop Cam"
            src="https://g1.ipcamlive.com/player/player.php?alias=6030787be95a2&autoplay=true"
          />
          <YouTubeEmbed
            title="Coral City Camera"
            videoId="7i8ARjIeM2k" // your YouTube video ID
          />
          <YouTubeEmbed
            title="Fort Lauderdale Beach"
            videoId="8vTmL-oD3Lo" // your YouTube video ID
          />
        </div>
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

      {/* Footer */}
      <footer className="text-center text-xs text-ocean/60 pt-6">
        Built for water lovers in Miami 🌴 | Data from NOAA, NWS, Open-Meteo, SwimGuide
      </footer>
    </main>
  );
}
