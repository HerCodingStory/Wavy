"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { MetricCard } from "@/components/MetricCard";
import { SportConditionCard } from "@/components/SportConditionCard";
import { sportIcons } from "@/lib/icons";
import { Waves, Wind, Navigation, Droplets, Thermometer, Sun, Eye, Sunrise, Sunset, Cloud } from "lucide-react";
import { getMoonPhase, formatTime } from "@/lib/utils";
import { Card } from "@/components/Card";

export default function DashboardPage() {
  const { selected, setSelected } = useLocation();
  const {
    wind,
    waves,
    swell,
    weather,
    tides,
    waterTemp,
    surfingConditions,
    kiteboardingConditions,
    wakeboardingConditions,
    snorkelingConditions,
    paddleboardingConditions,
    sailingConditions,
    loading,
  } = useWeatherData();

  function getCardinalDirection(degrees: number): string {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  function celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  // Get trend based on tide direction
  function getTideTrend(isRising: boolean) {
    return isRising ? ("up" as const) : ("down" as const);
  }

  // Weather code icons mapping
  const weatherIcons: Record<number, string> = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌦️",
    61: "🌧️", 63: "🌧️", 65: "⛈️",
    71: "❄️", 73: "❄️", 75: "❄️",
    80: "🌦️", 81: "🌧️", 82: "⛈️",
    95: "⛈️", 96: "⛈️", 99: "⛈️",
  };

  const moonPhase = getMoonPhase();

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <div className="space-y-8 pb-16">
        {/* Weather Metrics Grid */}
        <section className="space-y-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-ocean/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Water Temperature */}
              <MetricCard
                icon={Waves}
                label="Water Temperature"
                value={
                  waterTemp?.temperature
                    ? celsiusToFahrenheit(parseFloat(waterTemp.temperature)).toFixed(0)
                    : waterTemp?.temp
                    ? parseFloat(waterTemp.temp).toFixed(0)
                    : 0
                }
                unit="°F"
                type="gauge"
                max={100}
                color="#0ea5e9"
              />

              {/* Air Temperature */}
              <MetricCard
                icon={Sun}
                label="Air Temperature"
                value={weather?.current?.temperature ? parseFloat(weather.current.temperature) : 0}
                unit="°F"
                type="simple"
                subtitle={
                  weather?.current?.feelsLike
                    ? `Feels like ${parseFloat(weather.current.feelsLike).toFixed(0)}°F`
                    : undefined
                }
              />

              {/* Sunrise */}
              <MetricCard
                icon={Sunrise}
                label="Sunrise"
                value={weather?.today?.sunrise ? formatTime(weather.today.sunrise) : "--"}
                unit=""
                type="simple"
              />

              {/* Sunset */}
              <MetricCard
                icon={Sunset}
                label="Sunset"
                value={weather?.today?.sunset ? formatTime(weather.today.sunset) : "--"}
                unit=""
                type="simple"
              />

              {/* UV Index */}
              <MetricCard
                icon={Sun}
                label="UV Index"
                value={weather?.current?.uv_index ? parseFloat(weather.current.uv_index) : 0}
                unit=""
                type="bar"
                max={11}
                subtitle={
                  weather?.current?.uv_index_max
                    ? `Max: ${weather.current.uv_index_max}`
                    : undefined
                }
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

              {/* Moon Phase */}
              <Card className="bg-foam/90 backdrop-blur-sm border border-ocean/10 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-ocean/5">
                      <Cloud className="w-5 h-5 text-ocean" />
                    </div>
                    <span className="text-sm font-semibold text-ocean/80">Moon Phase</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl">{moonPhase.emoji}</span>
                  </div>
                  <p className="text-sm text-ocean/70 font-medium">{moonPhase.name}</p>
                </div>
              </Card>

              {/* Visibility */}
              <MetricCard
                icon={Eye}
                label="Visibility"
                value={weather?.current?.visibility ? parseFloat(weather.current.visibility) : 0}
                unit="mi"
                type="bar"
                max={20}
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
            </div>
          )}
        </section>

        {/* 7-Day Weather Forecast */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <h2 className="text-xl font-bold text-ocean">7-Day Weather Forecast</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-40 bg-ocean/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : weather?.forecast && weather.forecast.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              {weather.forecast.map((day: any, idx: number) => {
                const date = new Date(day.date);
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = date.getDate();
                const month = date.toLocaleDateString("en-US", { month: "short" });
                
                const icon = weatherIcons[day.weatherCode] || "🌤️";
                const title = isToday ? "Today" : `${dayName}, ${month} ${dayNum}`;
                
                return (
                  <Card
                    key={idx}
                    className={`bg-foam/90 backdrop-blur-sm border border-ocean/10 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${idx >= 3 ? "hidden md:block" : ""}`}
                  >
                    <div className="text-center">
                      <h3 className="text-xs font-semibold text-ocean/70 mb-2">{title}</h3>
                      <div className="text-4xl mb-3">{icon}</div>
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-ocean">
                          {day.maxTemp ? `${day.maxTemp}°` : "--"}
                        </p>
                        <p className="text-sm text-ocean/70">
                          {day.minTemp ? `${day.minTemp}°` : "--"}
                        </p>
                        {day.precipitation && parseFloat(day.precipitation) > 0 && (
                          <p className="text-xs text-ocean/60 mt-2 flex items-center justify-center gap-1">
                            <Droplets className="w-3 h-3" />
                            {day.precipitation} in
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-ocean/50 italic">No forecast data available</p>
          )}
        </section>

        {/* Activity Conditions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <h2 className="text-xl font-bold text-ocean">Activity Conditions</h2>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
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

              {/* Sailing */}
              {sailingConditions?.score !== undefined && !sailingConditions.error && (
                <SportConditionCard
                  icon={sportIcons.sailing}
                  name="Sailing"
                  score={sailingConditions.score}
                  level={sailingConditions.level}
                  description={sailingConditions.description}
                  bestTimeFormatted={sailingConditions.bestTimeFormatted}
                  hoursFromNow={sailingConditions.hoursFromNow}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
