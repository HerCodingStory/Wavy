"use client";

"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { LoadingWaves } from "@/components/LoadingWaves";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { LatLngExpression } from "leaflet";

// Dynamically import Leaflet map to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});

// Fix Leaflet default marker icon issue
if (typeof window !== "undefined") {
  const L = require("leaflet");
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Custom hook to fetch weather data for custom coordinates
function useCustomWeatherData(lat: number | null, lon: number | null, noaaStation: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = window.location.origin;
        const [
          windRes,
          waveRes,
          swellRes,
          weatherRes,
          tideRes,
          waterTempRes,
          waveEnergyRes,
          waveConsistencyRes,
          airRes,
          qualityRes,
          waterVisibilityRes,
          surfingRes,
          kiteboardingRes,
          wakeboardingRes,
          snorkelingRes,
          paddleboardingRes,
        ] = await Promise.all([
          fetch(`${baseUrl}/api/wind?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/waves?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/swell?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/weather?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/tides?station=${noaaStation || "8723170"}&lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/water-temp?station=${noaaStation || "8723170"}&lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/wave-energy?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/wave-consistency?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/air?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/water-quality?station=${noaaStation || "8723170"}&lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/water-visibility?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/surfing-conditions?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/kiteboarding-conditions?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/wakeboarding-conditions?lat=${lat}&lon=${lon}`),
          fetch(`${baseUrl}/api/snorkeling-conditions?lat=${lat}&lon=${lon}&station=${noaaStation || "8723170"}`),
          fetch(`${baseUrl}/api/paddleboarding-conditions?lat=${lat}&lon=${lon}`),
        ]);

        const weatherData = {
          wind: await windRes.json(),
          waves: await waveRes.json(),
          swell: await swellRes.json(),
          weather: await weatherRes.json(),
          tides: await tideRes.json(),
          waterTemp: await waterTempRes.json(),
          waveEnergy: await waveEnergyRes.json(),
          waveConsistency: await waveConsistencyRes.json(),
          air: await airRes.json(),
          quality: await qualityRes.json(),
          waterVisibility: await waterVisibilityRes.json(),
          surfingConditions: await surfingRes.json(),
          kiteboardingConditions: await kiteboardingRes.json(),
          wakeboardingConditions: await wakeboardingRes.json(),
          snorkelingConditions: await snorkelingRes.json(),
          paddleboardingConditions: await paddleboardingRes.json(),
        };

        setData(weatherData);
      } catch (err) {
        setError("Failed to fetch weather data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300); // Debounce
    return () => clearTimeout(timer);
  }, [lat, lon, noaaStation]);

  return { data, loading, error };
}

// Click handler component for the map
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  const { useMapEvents } = require("react-leaflet");
  
  const map = useMapEvents({
    click: (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  
  return null;
}

export default function MapPage() {
  const { selected } = useLocation();
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Use custom coordinates if selected, otherwise use default location
  const lat = selectedCoords?.lat || selected.coords.lat;
  const lon = selectedCoords?.lon || selected.coords.lon;

  const { data, loading, error } = useCustomWeatherData(
    lat,
    lon,
    selected.noaaStation
  );

  const handleMapClick = (clickedLat: number, clickedLon: number) => {
    setSelectedCoords({ lat: clickedLat, lon: clickedLon });
    setMapKey((prev) => prev + 1); // Force map re-render
  };

  function getCardinalDirection(degrees: number): string {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  function formatTime(timeString: string): string {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return timeString;
    }
  }

  return (
    <Layout selectedLocation={selected} onLocationChange={() => {}}>
      <div className="space-y-6">
        {/* Map Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🗺️ Select Location</h2>
            {selectedCoords && (
              <button
                onClick={() => {
                  setSelectedCoords(null);
                  setMapKey((prev) => prev + 1);
                }}
                className="px-4 py-2 bg-ocean text-foam rounded-lg hover:bg-ocean/90 transition-colors text-sm"
              >
                Clear Selection
              </button>
            )}
          </div>
          <div className="card p-4">
            <p className="text-sm text-ocean/70 mb-2">
              Click on the map to select a location and view weather metrics
            </p>
            {selectedCoords && (
              <p className="text-sm text-ocean font-medium">
                <MapPin size={16} className="inline mr-1" />
                Selected: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lon.toFixed(4)}
              </p>
            )}
            <div className="mt-4 rounded-lg overflow-hidden" style={{ height: "400px", minHeight: "400px" }}>
              {typeof window !== "undefined" && (
                <MapContainer
                  key={mapKey}
                  center={[lat, lon] as LatLngExpression}
                  zoom={11}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {selectedCoords && (
                    <Marker position={[selectedCoords.lat, selectedCoords.lon] as LatLngExpression} />
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        </section>

        {/* Weather Metrics */}
        {selectedCoords && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">📊 Weather Metrics</h2>
            {loading ? (
              <LoadingWaves />
            ) : error ? (
              <Card>
                <CardBody>
                  <p className="text-sm text-ocean/50 italic">{error}</p>
                </CardBody>
              </Card>
            ) : data ? (
              <>
                {/* Temperature */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader title="Water Temperature" />
                    <CardBody>
                      {data.waterTemp?.error ? (
                        <p className="text-sm text-ocean/50 italic">{data.waterTemp.error}</p>
                      ) : data.waterTemp?.temp ? (
                        <p className="text-3xl font-bold text-ocean">🌊 {data.waterTemp.temp}°F</p>
                      ) : (
                        <p className="text-sm text-ocean/50 italic">No data</p>
                      )}
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Air Temperature" />
                    <CardBody>
                      {data.weather?.error ? (
                        <p className="text-sm text-ocean/50 italic">{data.weather.error}</p>
                      ) : data.weather?.current?.temperature ? (
                        <p className="text-3xl font-bold text-ocean">
                          ☀️ {parseFloat(data.weather.current.temperature).toFixed(0)}°F
                        </p>
                      ) : (
                        <p className="text-sm text-ocean/50 italic">No data</p>
                      )}
                    </CardBody>
                  </Card>
                </div>

                {/* Wind */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader title="Wind Speed" />
                    <CardBody>
                      {data.wind?.error ? (
                        <p className="text-sm text-ocean/50 italic">{data.wind.error}</p>
                      ) : data.wind?.speed ? (
                        <p className="text-3xl font-bold text-ocean">
                          💨 {data.wind.speed.toFixed(1)} <span className="text-lg">mph</span>
                        </p>
                      ) : (
                        <p className="text-sm text-ocean/50 italic">No data</p>
                      )}
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Wind Direction" />
                    <CardBody>
                      {data.wind?.direction ? (
                        <p className="text-3xl font-bold text-ocean">
                          {getCardinalDirection(data.wind.direction)}
                        </p>
                      ) : (
                        <p className="text-sm text-ocean/50 italic">No data</p>
                      )}
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Wind Gust" />
                    <CardBody>
                      {data.wind?.gusts ? (
                        <p className="text-3xl font-bold text-ocean">
                          💨 {data.wind.gusts.toFixed(1)} <span className="text-lg">mph</span>
                        </p>
                      ) : (
                        <p className="text-sm text-ocean/50 italic">No data</p>
                      )}
                    </CardBody>
                  </Card>
                </div>

                {/* Waves */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader title="Wave Height" />
                    <CardBody>
                      {data.waves?.error ? (
                        <p className="text-sm text-ocean/50 italic">{data.waves.error}</p>
                      ) : data.waves?.height ? (
                        <p className="text-3xl font-bold text-ocean">
                          🌊 {data.waves.height} <span className="text-lg">ft</span>
                        </p>
                      ) : (
                        <p className="text-sm text-ocean/50 italic">No data</p>
                      )}
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Wave Period" />
                    <CardBody>
                      {data.waves?.period ? (
                        <p className="text-3xl font-bold text-ocean">
                          ⏱️ {data.waves.period} <span className="text-lg">s</span>
                        </p>
                      ) : (
                        <p className="text-sm text-ocean/50 italic">No data</p>
                      )}
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Swell Direction" />
                    <CardBody>
                      {data.swell?.direction ? (
                        <p className="text-3xl font-bold text-ocean">
                          {getCardinalDirection(data.swell.direction)}
                        </p>
                      ) : (
                        <p className="text-sm text-ocean/50 italic">No data</p>
                      )}
                    </CardBody>
                  </Card>
                </div>

                {/* Activity Conditions */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">🏄 Activity Conditions</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Surfing", data: data.surfingConditions },
                      { title: "Kiteboarding", data: data.kiteboardingConditions },
                      { title: "Wakeboarding", data: data.wakeboardingConditions },
                      { title: "Snorkeling", data: data.snorkelingConditions },
                      { title: "Paddleboarding", data: data.paddleboardingConditions },
                    ].map((activity) => (
                      <Card key={activity.title}>
                        <CardHeader title={activity.title} />
                        <CardBody>
                          {activity.data?.error ? (
                            <p className="text-sm text-ocean/50 italic">{activity.data.error}</p>
                          ) : activity.data?.score !== undefined ? (
                            <div>
                              <p className="text-3xl font-bold text-ocean">
                                {activity.data.emoji} {activity.data.score}
                              </p>
                              <p className="text-sm text-ocean/70 mt-1">{activity.data.level}</p>
                              <p className="text-xs text-ocean/60 mt-1">{activity.data.description}</p>
                              {activity.data?.bestTimeFormatted && (
                                <p className="text-xs text-coral mt-2 font-medium">
                                  ⏰ Best time: {activity.data.bestTimeFormatted}
                                  {activity.data.hoursFromNow > 0 && ` (${activity.data.hoursFromNow}h)`}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-ocean/50 italic">No data</p>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}
      </div>
    </Layout>
  );
}

