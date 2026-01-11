"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { MetricCard } from "@/components/MetricCard";
import { SportConditionCard } from "@/components/SportConditionCard";
import { sportIcons } from "@/lib/icons";
import { Waves, Wind, Navigation, Droplets, Thermometer, Sun } from "lucide-react";

export default function DashboardPage() {
  const { selected, setSelected } = useLocation();
  const {
    wind,
    waves,
    swell,
    weather,
    tides,
    waterTemp,
    waterVisibility,
    surfingConditions,
    kiteboardingConditions,
    wakeboardingConditions,
    snorkelingConditions,
    paddleboardingConditions,
    loading,
  } = useWeatherData();

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

  function celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  // Get trend based on tide direction
  function getTideTrend(isRising: boolean) {
    return isRising ? ("up" as const) : ("down" as const);
  }

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ocean">Miami Conditions</h1>
          <p className="text-sm text-ocean/60 font-medium">
            Real-time ocean and weather data for extreme water sports
          </p>
        </div>

        {/* Weather Metrics Grid */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <h2 className="text-xl font-bold text-ocean">Weather Metrics</h2>
          </div>
          
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-ocean/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Wave Height */}
              <MetricCard
                icon={Waves}
                label="Wave Height"
                value={waves?.waveHeight ? parseFloat(waves.waveHeight) : 0}
                unit="m"
                type="bar"
                max={5}
                subtitle={waves?.wavePeriod ? `Period: ${waves.wavePeriod}s` : undefined}
              />

              {/* Wind Speed */}
              <MetricCard
                icon={Wind}
                label="Wind Speed"
                value={wind?.speed ? wind.speed : 0}
                unit="mph"
                type="bar"
                max={40}
                subtitle={
                  wind?.direction
                    ? `${getCardinalDirection(wind.direction)} (${wind.direction.toFixed(0)}°)`
                    : undefined
                }
              />

              {/* Water Temperature */}
              <MetricCard
                icon={Thermometer}
                label="Water Temp"
                value={
                  waterTemp?.temperature
                    ? celsiusToFahrenheit(parseFloat(waterTemp.temperature)).toFixed(0)
                    : 0
                }
                unit="°F"
                type="gauge"
                max={100}
                color="#0ea5e9"
              />

              {/* Swell */}
              <MetricCard
                icon={Navigation}
                label="Swell"
                value={swell?.primary ? parseFloat(swell.primary.height) : 0}
                unit="m"
                type="bar"
                max={4}
                subtitle={
                  swell?.primary
                    ? `${swell.primary.directionCardinal} @ ${swell.primary.period}s`
                    : undefined
                }
              />

              {/* Tide */}
              <MetricCard
                icon={Droplets}
                label="Tide"
                value={tides?.current ? parseFloat(tides.current.height) : 0}
                unit="ft"
                type="gauge"
                max={6}
                trend={tides?.current?.isRising ? getTideTrend(tides.current.isRising) : undefined}
                subtitle={
                  tides?.current?.isRising ? "Rising" : tides?.current ? "Falling" : undefined
                }
              />

              {/* Air Temperature */}
              <MetricCard
                icon={Sun}
                label="Air Temp"
                value={weather?.current?.temperature ? parseFloat(weather.current.temperature) : 0}
                unit="°F"
                type="simple"
                subtitle={
                  weather?.current?.feelsLike
                    ? `Feels like ${parseFloat(weather.current.feelsLike).toFixed(0)}°F`
                    : undefined
                }
              />

              {/* Humidity */}
              <MetricCard
                icon={Droplets}
                label="Humidity"
                value={weather?.current?.humidity ? weather.current.humidity : 0}
                unit="%"
                type="bar"
                max={100}
              />

              {/* UV Index */}
              <MetricCard
                icon={Sun}
                label="UV Index"
                value={weather?.current?.uv_index ? parseFloat(weather.current.uv_index) : 0}
                unit=""
                type="bar"
                max={11}
                color={
                  weather?.current?.uv_index
                    ? parseFloat(weather.current.uv_index) >= 8
                      ? "#ef4444"
                      : parseFloat(weather.current.uv_index) >= 5
                      ? "#f59e0b"
                      : "#10b981"
                    : undefined
                }
              />
            </div>
          )}
        </section>

        {/* Sport Conditions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <h2 className="text-xl font-bold text-ocean">Activity Conditions</h2>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-48 bg-ocean/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Surfing */}
              {surfingConditions?.score !== undefined && !surfingConditions.error && (
                <SportConditionCard
                  icon={sportIcons.surfing}
                  name="Surfing"
                  score={surfingConditions.score}
                  level={surfingConditions.level}
                  description={surfingConditions.description}
                  bestTimeFormatted={surfingConditions.bestTimeFormatted}
                  hoursFromNow={surfingConditions.hoursFromNow}
                />
              )}

              {/* Kiteboarding */}
              {kiteboardingConditions?.score !== undefined &&
                !kiteboardingConditions.error && (
                  <SportConditionCard
                    icon={sportIcons.kiteboarding}
                    name="Kiteboarding"
                    score={kiteboardingConditions.score}
                    level={kiteboardingConditions.level}
                    description={kiteboardingConditions.description}
                    bestTimeFormatted={kiteboardingConditions.bestTimeFormatted}
                    hoursFromNow={kiteboardingConditions.hoursFromNow}
                  />
                )}

              {/* Wakeboarding */}
              {wakeboardingConditions?.score !== undefined &&
                !wakeboardingConditions.error && (
                  <SportConditionCard
                    icon={sportIcons.wakeboarding}
                    name="Wakeboarding"
                    score={wakeboardingConditions.score}
                    level={wakeboardingConditions.level}
                    description={wakeboardingConditions.description}
                    bestTimeFormatted={wakeboardingConditions.bestTimeFormatted}
                    hoursFromNow={wakeboardingConditions.hoursFromNow}
                  />
                )}

              {/* Snorkeling */}
              {snorkelingConditions?.score !== undefined &&
                !snorkelingConditions.error && (
                  <SportConditionCard
                    icon={sportIcons.snorkeling}
                    name="Snorkeling"
                    score={snorkelingConditions.score}
                    level={snorkelingConditions.level}
                    description={snorkelingConditions.description}
                    bestTimeFormatted={snorkelingConditions.bestTimeFormatted}
                    hoursFromNow={snorkelingConditions.hoursFromNow}
                  />
                )}

              {/* Paddleboarding */}
              {paddleboardingConditions?.score !== undefined &&
                !paddleboardingConditions.error && (
                  <SportConditionCard
                    icon={sportIcons.paddleboarding}
                    name="Paddleboarding"
                    score={paddleboardingConditions.score}
                    level={paddleboardingConditions.level}
                    description={paddleboardingConditions.description}
                    bestTimeFormatted={paddleboardingConditions.bestTimeFormatted}
                    hoursFromNow={paddleboardingConditions.hoursFromNow}
                  />
                )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
