"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { ExternalLink } from "lucide-react";

export default function LinksPage() {
  const { selected, setSelected } = useLocation();

  const webcamLinks = [
    {
      title: "Key Biscayne Beach Cam",
      url: "https://keybiscayne.fl.gov/uniquely_kb/kb_beach_cam.php",
    },
    {
      title: "Miami Beach Live Cams",
      url: "https://www.miamiandbeaches.com/plan-your-trip/miami-webcams?wc=4",
    },
    {
      title: "Sunny Isles – Newport Pier",
      url: "https://sunnyislesbeachmiami.com/beach-cam/",
    },
  ];

  const weatherLinks = [
    {
      title: "National Weather Service - Miami",
      url: "https://www.weather.gov/mfl/",
    },
    {
      title: "NOAA Marine Forecast - South Florida",
      url: "https://forecast.weather.gov/MapClick.php?zoneid=FLZ172",
    },
    {
      title: "Windy.com - Wind & Wave Forecast",
      url: "https://www.windy.com/",
    },
    {
      title: "Surfline - Miami Surf Forecast",
      url: "https://www.surfline.com/surf-report/south-beach/5842041f4e65fad6a77099da",
    },
    {
      title: "NOAA Tides & Currents",
      url: "https://tidesandcurrents.noaa.gov/",
    },
    {
      title: "Open-Meteo Weather Forecast",
      url: "https://open-meteo.com/en/docs",
    },
    {
      title: "Weather.com - Miami Beach",
      url: "https://weather.com/weather/today/l/25.79,-80.13",
    },
    {
      title: "EPA Beach Advisory System (BEACON)",
      url: "https://watersgeo.epa.gov/beacon2/",
    },
  ];

  const renderLinks = (links: Array<{ title: string; url: string }>) => (
    <div className="space-y-3">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block card p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ocean">{link.title}</span>
            <ExternalLink size={18} className="text-ocean/60 flex-shrink-0" />
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <div className="space-y-8">
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">📹 Live Webcams</h2>
          {renderLinks(webcamLinks)}
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">🌤️ Weather Pages</h2>
          {renderLinks(weatherLinks)}
        </section>
      </div>
    </Layout>
  );
}

