"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardBody, CardHeader } from "@/components/Card";

export default function DashboardPage() {
  const { selected, setSelected } = useLocation();
  const {
    wind,
    waves,
    swell,
    weather,
    tides,
    waterTemp,
    waveEnergy,
    waveConsistency,
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

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      {/* Main Stats Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Current Conditions</h2>
        {loading ? (
          <div className="text-center py-8 text-ocean/60">Loading conditions...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Wave Height */}
            <Card>
              <CardHeader title="Wave Height" />
              <CardBody>
                <p className="text-3xl font-bold text-ocean">
                  {waves?.waveHeight ? `${parseFloat(waves.waveHeight).toFixed(1)}m` : "--"}
                </p>
                <p className="text-sm text-ocean/70 mt-1">
                  Period: {waves?.wavePeriod ? `${waves.wavePeriod}s` : "--"}
                </p>
                {waves?.surfHeight && (
                  <p className="text-xs text-ocean/60 mt-1">
                    Surf: {parseFloat(waves.surfHeight).toFixed(1)}m
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Wind */}
            <Card>
              <CardHeader title="Wind" />
              <CardBody>
                {wind?.speed ? (
                  <div>
                    <p className="text-2xl font-bold text-ocean">
                      {wind.speed.toFixed(0)} <span className="text-lg">mph</span>
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">
                      Gusts: {wind.gusts?.toFixed(0)} mph
                    </p>
                    {wind.direction && (
                      <p className="text-xs text-ocean/60 mt-1">
                        {getCardinalDirection(wind.direction)} ({wind.direction.toFixed(0)}°)
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">
                    {wind?.error || "No data"}
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Swell */}
            <Card>
              <CardHeader title="Swell" />
              <CardBody>
                {swell?.primary ? (
                  <div>
                    <p className="text-xl font-bold text-ocean">
                      {swell.primary.height}m @ {swell.primary.period}s
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">
                      {swell.primary.directionCardinal} ({swell.primary.direction.toFixed(0)}°)
                    </p>
                    {swell.secondary && parseFloat(swell.secondary.height) > 0 && (
                      <p className="text-xs text-ocean/60 mt-1">
                        Secondary: {swell.secondary.height}m @ {swell.secondary.period}s
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">
                    {swell?.error || "No data"}
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Tide */}
            <Card>
              <CardHeader title="Tide" />
              <CardBody>
                {tides?.current ? (
                  <div>
                    <p className="text-2xl font-bold text-ocean">
                      {tides.current.height} <span className="text-lg">ft</span>
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">
                      {tides.current.isRising ? "↗ Rising" : "↘ Falling"}
                    </p>
                    {tides.nextHigh && (
                      <p className="text-xs text-ocean/60 mt-1">
                        High: {tides.nextHigh.height}ft @ {formatTime(tides.nextHigh.time)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">
                    {tides?.error || "No data"}
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </section>

      {/* Activity Conditions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">🏄 Activity Conditions</h2>
        {loading ? null : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Surfing */}
            <Card>
              <CardHeader title="Surfing" />
              <CardBody>
                {surfingConditions?.error ? (
                  <p className="text-sm text-ocean/50 italic">{surfingConditions.error}</p>
                ) : surfingConditions?.score !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {surfingConditions.emoji} {surfingConditions.score}
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">{surfingConditions.level}</p>
                    <p className="text-xs text-ocean/60 mt-1">{surfingConditions.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Kiteboarding */}
            <Card>
              <CardHeader title="Kiteboarding" />
              <CardBody>
                {kiteboardingConditions?.error ? (
                  <p className="text-sm text-ocean/50 italic">{kiteboardingConditions.error}</p>
                ) : kiteboardingConditions?.score !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {kiteboardingConditions.emoji} {kiteboardingConditions.score}
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">{kiteboardingConditions.level}</p>
                    <p className="text-xs text-ocean/60 mt-1">{kiteboardingConditions.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Wakeboarding */}
            <Card>
              <CardHeader title="Wakeboarding" />
              <CardBody>
                {wakeboardingConditions?.error ? (
                  <p className="text-sm text-ocean/50 italic">{wakeboardingConditions.error}</p>
                ) : wakeboardingConditions?.score !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {wakeboardingConditions.emoji} {wakeboardingConditions.score}
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">{wakeboardingConditions.level}</p>
                    <p className="text-xs text-ocean/60 mt-1">{wakeboardingConditions.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Snorkeling */}
            <Card>
              <CardHeader title="Snorkeling" />
              <CardBody>
                {snorkelingConditions?.error ? (
                  <p className="text-sm text-ocean/50 italic">{snorkelingConditions.error}</p>
                ) : snorkelingConditions?.score !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {snorkelingConditions.emoji} {snorkelingConditions.score}
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">{snorkelingConditions.level}</p>
                    <p className="text-xs text-ocean/60 mt-1">{snorkelingConditions.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Paddleboarding */}
            <Card>
              <CardHeader title="Paddleboarding" />
              <CardBody>
                {paddleboardingConditions?.error ? (
                  <p className="text-sm text-ocean/50 italic">{paddleboardingConditions.error}</p>
                ) : paddleboardingConditions?.score !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {paddleboardingConditions.emoji} {paddleboardingConditions.score}
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">{paddleboardingConditions.level}</p>
                    <p className="text-xs text-ocean/60 mt-1">{paddleboardingConditions.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </section>
    </Layout>
  );
}

