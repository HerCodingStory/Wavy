"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { MetricCard } from "@/components/MetricCard";
import { SportConditionCard } from "@/components/SportConditionCard";
import { Card, CardBody } from "@/components/Card";
import { sportIcons } from "@/lib/icons";
import { LoadingWaves } from "@/components/LoadingWaves";
import dynamic from "next/dynamic";
import { MapPin, Waves, Wind, Thermometer, Sun, Navigation, Activity, Eye, Cloud, Gauge, Droplets, Zap } from "lucide-react";
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
      <div className="space-y-6 pb-16">
        {/* Map Section */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-ocean">Interactive Map</h1>
            <p className="text-sm text-ocean/60 font-medium">
              Click on the map to view weather conditions at any location
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-coral" />
              <h2 className="text-xl font-bold text-ocean">Select Location</h2>
            </div>
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
            </div>
          </div>
        </section>

        {/* Weather Metrics */}
        {selectedCoords && (
          <section className="space-y-6">
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
                  {data.weather?.current?.temperature && !data.weather?.error && (
                    <MetricCard
                      icon={Sun}
                      label="Air Temperature"
                      value={parseFloat(data.weather.current.temperature)}
                      unit="°F"
                      type="simple"
                      subtitle={
                        data.weather.current.feelsLike
                          ? `Feels like ${parseFloat(data.weather.current.feelsLike).toFixed(0)}°F`
                          : undefined
                      }
                    />
                  )}

                  {data.weather?.current?.humidity !== null && data.weather?.current?.humidity !== undefined && (
                    <MetricCard
                      icon={Droplets}
                      label="Humidity"
                      value={data.weather.current.humidity}
                      unit="%"
                      type="bar"
                      max={100}
                    />
                  )}
                </div>

                {/* Wind */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.wind?.speed && !data.wind?.error && (
                    <MetricCard
                      icon={Wind}
                      label="Wind Speed"
                      value={data.wind.speed}
                      unit="mph"
                      type="bar"
                      max={40}
                      subtitle={
                        data.wind.gusts
                          ? `Gusts: ${data.wind.gusts.toFixed(1)} mph`
                          : undefined
                      }
                    />
                  )}

                  {data.wind?.direction && (
                    <MetricCard
                      icon={Activity}
                      label="Wind Direction"
                      value={getCardinalDirection(data.wind.direction)}
                      unit=""
                      type="simple"
                      windDirection={data.wind.direction}
                      subtitle={`${data.wind.direction.toFixed(0)}°`}
                    />
                  )}

                  {data.wind?.gusts && (
                    <MetricCard
                      icon={Wind}
                      label="Wind Gust"
                      value={data.wind.gusts}
                      unit="mph"
                      type="bar"
                      max={50}
                    />
                  )}
                </div>

                {/* Waves */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.waves?.height && !data.waves?.error && (
                    <MetricCard
                      icon={Waves}
                      label="Wave Height"
                      value={parseFloat(data.waves.height)}
                      unit="ft"
                      type="bar"
                      max={15}
                      subtitle={
                        data.waves.period ? `Period: ${data.waves.period}s` : undefined
                      }
                    />
                  )}

                  {data.waves?.period && (
                    <MetricCard
                      icon={Gauge}
                      label="Wave Period"
                      value={parseFloat(data.waves.period)}
                      unit="s"
                      type="simple"
                    />
                  )}

                  {data.swell?.primary?.height && (
                    <MetricCard
                      icon={Navigation}
                      label="Swell Height"
                      value={parseFloat(data.swell.primary.height) * 3.28084}
                      unit="ft"
                      type="bar"
                      max={15}
                      subtitle={
                        data.swell.primary.directionCardinal && data.swell.primary.period
                          ? `${data.swell.primary.directionCardinal} @ ${data.swell.primary.period}s`
                          : undefined
                      }
                    />
                  )}

                  {data.waveEnergy?.energy && !data.waveEnergy?.error && (
                    <MetricCard
                      icon={Zap}
                      label="Wave Energy"
                      value={parseFloat(data.waveEnergy.energy)}
                      unit="kJ/m²"
                      type="bar"
                      max={200}
                      subtitle={data.waveEnergy.level}
                      color={
                        parseFloat(data.waveEnergy.energy) > 150
                          ? "#ef4444"
                          : parseFloat(data.waveEnergy.energy) > 100
                          ? "#f59e0b"
                          : "#10b981"
                      }
                    />
                  )}

                  {data.waveConsistency?.score && !data.waveConsistency?.error && (
                    <MetricCard
                      icon={Activity}
                      label="Wave Consistency"
                      value={data.waveConsistency.score}
                      unit="%"
                      type="bar"
                      max={100}
                      subtitle={data.waveConsistency.level}
                    />
                  )}

                  {data.waterVisibility?.visibility && !data.waterVisibility?.error && (
                    <MetricCard
                      icon={Eye}
                      label="Water Visibility"
                      value={parseFloat(data.waterVisibility.visibility)}
                      unit="ft"
                      type="bar"
                      max={100}
                      subtitle={data.waterVisibility.level}
                      color={
                        parseFloat(data.waterVisibility.visibility) > 60
                          ? "#10b981"
                          : parseFloat(data.waterVisibility.visibility) > 30
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                    />
                  )}

                  {data.quality?.status || data.quality?.quality ? (
                    <MetricCard
                      icon={Activity}
                      label="Water Quality"
                      value={data.quality.status || data.quality.quality || ""}
                      unit=""
                      type="simple"
                      subtitle={data.quality.description}
                    />
                  ) : null}

                  {data.tides?.current && !data.tides?.error && (
                    <MetricCard
                      icon={Droplets}
                      label="Tide"
                      value={parseFloat(data.tides.current.height)}
                      unit="ft"
                      type="simple"
                      subtitle={
                        data.tides.current?.isRising ? "Rising" : "Falling"
                      }
                    />
                  )}
                </div>

                {/* Additional Metrics */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.air?.aqi !== undefined && !data.air?.error && (
                    <MetricCard
                      icon={Cloud}
                      label="Air Quality"
                      value={data.air.aqi}
                      unit=""
                      type="bar"
                      max={300}
                      subtitle={data.air.category || "Unknown"}
                      color={
                        data.air.aqi <= 50
                          ? "#10b981"
                          : data.air.aqi <= 100
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                    />
                  )}

                  {data.weather?.current?.uv_index !== null && data.weather?.current?.uv_index !== undefined && (
                    <MetricCard
                      icon={Sun}
                      label="UV Index"
                      value={parseFloat(data.weather.current.uv_index)}
                      unit=""
                      type="bar"
                      max={11}
                      color={
                        parseFloat(data.weather.current.uv_index) >= 8
                          ? "#ef4444"
                          : parseFloat(data.weather.current.uv_index) >= 5
                          ? "#f59e0b"
                          : "#10b981"
                      }
                    />
                  )}

                  {data.weather?.current?.visibility && (
                    <MetricCard
                      icon={Eye}
                      label="Visibility"
                      value={parseFloat(data.weather.current.visibility)}
                      unit="mi"
                      type="bar"
                      max={20}
                    />
                  )}
                </div>

                {/* Activity Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-coral" />
                    <h3 className="text-xl font-bold text-ocean">Activity Conditions</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.surfingConditions?.score !== undefined &&
                      !data.surfingConditions.error && (
                        <SportConditionCard
                          icon={sportIcons.surfing}
                          name="Surfing"
                          score={data.surfingConditions.score}
                          level={data.surfingConditions.level}
                          description={data.surfingConditions.description}
                          bestTimeFormatted={data.surfingConditions.bestTimeFormatted}
                          hoursFromNow={data.surfingConditions.hoursFromNow}
                        />
                      )}

                    {data.kiteboardingConditions?.score !== undefined &&
                      !data.kiteboardingConditions.error && (
                        <SportConditionCard
                          icon={sportIcons.kiteboarding}
                          name="Kiteboarding"
                          score={data.kiteboardingConditions.score}
                          level={data.kiteboardingConditions.level}
                          description={data.kiteboardingConditions.description}
                          bestTimeFormatted={data.kiteboardingConditions.bestTimeFormatted}
                          hoursFromNow={data.kiteboardingConditions.hoursFromNow}
                        />
                      )}

                    {data.wakeboardingConditions?.score !== undefined &&
                      !data.wakeboardingConditions.error && (
                        <SportConditionCard
                          icon={sportIcons.wakeboarding}
                          name="Wakeboarding"
                          score={data.wakeboardingConditions.score}
                          level={data.wakeboardingConditions.level}
                          description={data.wakeboardingConditions.description}
                          bestTimeFormatted={data.wakeboardingConditions.bestTimeFormatted}
                          hoursFromNow={data.wakeboardingConditions.hoursFromNow}
                        />
                      )}

                    {data.snorkelingConditions?.score !== undefined &&
                      !data.snorkelingConditions.error && (
                        <SportConditionCard
                          icon={sportIcons.snorkeling}
                          name="Snorkeling"
                          score={data.snorkelingConditions.score}
                          level={data.snorkelingConditions.level}
                          description={data.snorkelingConditions.description}
                          bestTimeFormatted={data.snorkelingConditions.bestTimeFormatted}
                          hoursFromNow={data.snorkelingConditions.hoursFromNow}
                        />
                      )}

                    {data.paddleboardingConditions?.score !== undefined &&
                      !data.paddleboardingConditions.error && (
                        <SportConditionCard
                          icon={sportIcons.paddleboarding}
                          name="Paddleboarding"
                          score={data.paddleboardingConditions.score}
                          level={data.paddleboardingConditions.level}
                          description={data.paddleboardingConditions.description}
                          bestTimeFormatted={data.paddleboardingConditions.bestTimeFormatted}
                          hoursFromNow={data.paddleboardingConditions.hoursFromNow}
                        />
                      )}
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

