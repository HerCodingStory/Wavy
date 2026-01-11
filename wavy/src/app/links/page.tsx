"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { ExternalLink, Video, Cloud } from "lucide-react";

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

  const renderLinks = (
    links: Array<{ title: string; url: string }>,
    icon?: React.ReactNode
  ) => (
    <div className="space-y-3">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-foam/90 backdrop-blur-sm border border-ocean/10 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 rounded-xl bg-ocean/5 group-hover:bg-ocean/10 transition-colors">
                  {icon}
                </div>
              )}
              <span className="font-semibold text-ocean group-hover:text-coral transition-colors">
                {link.title}
              </span>
            </div>
            <ExternalLink
              size={18}
              className="text-ocean/60 group-hover:text-coral transition-colors flex-shrink-0"
            />
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ocean">Resources & Links</h1>
          <p className="text-sm text-ocean/60 font-medium">
            Useful links for weather, webcams, and marine forecasts
          </p>
        </div>

        {/* Live Webcams */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-ocean" />
              <h2 className="text-xl font-bold text-ocean">Live Webcams</h2>
            </div>
          </div>
          {renderLinks(webcamLinks, <Video className="w-4 h-4 text-ocean" />)}
        </section>

        {/* Weather Pages */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-ocean" />
              <h2 className="text-xl font-bold text-ocean">Weather Pages</h2>
            </div>
          </div>
          {renderLinks(weatherLinks, <Cloud className="w-4 h-4 text-ocean" />)}
        </section>
      </div>
    </Layout>
  );
}
