"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { MetricCard } from "@/components/MetricCard";
import { WindyEmbed } from "@/components/WindyEmbed";
import { Wind, Gauge, Cloud, Activity } from "lucide-react";

export default function WindPage() {
  const { selected, setSelected } = useLocation();
  const { wind, weather, air, loading } = useWeatherData();

  function getCardinalDirection(degrees: number): string {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  // Determine wind condition level
  function getWindCondition(speed: number): string {
    if (speed < 5) return "Calm";
    if (speed < 15) return "Light";
    if (speed < 25) return "Moderate";
    return "Strong";
  }

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ocean">Wind Conditions</h1>
          <p className="text-sm text-ocean/60 font-medium">
            Real-time wind data and forecast
          </p>
        </div>

        {/* Current Conditions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <h2 className="text-xl font-bold text-ocean">Current Conditions</h2>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-ocean/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Wind Speed */}
              {wind?.speed && (
                <MetricCard
                  icon={Wind}
                  label="Wind Speed"
                  value={wind.speed}
                  unit="mph"
                  type="bar"
                  max={40}
                  subtitle={
                    wind.gusts ? `Gusts: ${wind.gusts.toFixed(1)} mph` : undefined
                  }
                />
              )}

              {/* Wind Direction */}
              {wind?.direction && (
                <MetricCard
                  icon={Activity}
                  label="Wind Direction"
                  value={getCardinalDirection(wind.direction)}
                  unit=""
                  type="simple"
                  windDirection={wind.direction}
                  subtitle={`${wind.direction.toFixed(0)}°`}
                />
              )}

              {/* Wind Conditions */}
              {wind?.speed && (
                <MetricCard
                  icon={Gauge}
                  label="Wind Conditions"
                  value={wind.speed}
                  unit=""
                  type="simple"
                  subtitle={getWindCondition(wind.speed)}
                />
              )}

              {/* Air Quality */}
              {air && !air.error && air.aqi !== undefined && (
                <MetricCard
                  icon={Cloud}
                  label="Air Quality"
                  value={air.aqi}
                  unit=""
                  type="bar"
                  max={300}
                  subtitle={air.category || "Unknown"}
                  color={
                    air.aqi <= 50 ? "#10b981" :
                    air.aqi <= 100 ? "#f59e0b" :
                    "#ef4444"
                  }
                />
              )}

              {/* Wind Gust */}
              {(wind?.gusts || weather?.current?.windGust) && (
                <MetricCard
                  icon={Wind}
                  label="Wind Gust"
                  value={wind?.gusts ? wind.gusts : parseFloat(weather?.current?.windGust || "0")}
                  unit="mph"
                  type="bar"
                  max={50}
                  subtitle={
                    wind?.speed ? `Regular: ${wind.speed.toFixed(1)} mph` : undefined
                  }
                />
              )}

              {/* Cloud Coverage */}
              {weather?.current?.cloudCover !== null &&
                weather?.current?.cloudCover !== undefined && (
                  <MetricCard
                    icon={Cloud}
                    label="Cloud Coverage"
                    value={weather.current.cloudCover}
                    unit="%"
                    type="bar"
                    max={100}
                    subtitle={
                      weather.current.cloudCover < 25
                        ? "Clear"
                        : weather.current.cloudCover < 50
                        ? "Partly Cloudy"
                        : weather.current.cloudCover < 75
                        ? "Mostly Cloudy"
                        : "Overcast"
                    }
                    color={
                      weather.current.cloudCover < 25 ? "#10b981" :
                      weather.current.cloudCover < 75 ? "#f59e0b" :
                      "#6b7280"
                    }
                  />
                )}
            </div>
          )}
        </section>

        {/* Wind Map */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <h2 className="text-xl font-bold text-ocean">Wind Map</h2>
          </div>
          <div className="w-full rounded-2xl overflow-hidden shadow-lg">
            <WindyEmbed lat={selected.coords.lat} lon={selected.coords.lon} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
