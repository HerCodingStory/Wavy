"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { WaveMapEmbed } from "@/components/WaveMapEmbed";
import { LoadingWaves } from "@/components/LoadingWaves";

export default function WavesPage() {
  const { selected, setSelected } = useLocation();
  const { waves, swell, waveEnergy, waveConsistency, quality, waterVisibility, tides, wind, weather, loading } = useWeatherData();

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
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">🌊 Wave Conditions</h2>
        {loading ? (
          <LoadingWaves />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader title="Wave Height" />
              <CardBody>
                {waves?.waveHeight ? (
                  <div>
                    <p className="text-4xl font-bold text-ocean">
                      {parseFloat(waves.waveHeight).toFixed(2)} <span className="text-xl">ft</span>
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">
                      Period: {waves.wavePeriod ? `${waves.wavePeriod}s` : "--"}
                    </p>
                    {waves?.surfHeight && (
                      <p className="text-xs text-ocean/60 mt-1">
                        Surf Height: {parseFloat(waves.surfHeight).toFixed(2)} ft
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">{waves?.error || "No data"}</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Primary Swell" />
              <CardBody>
                {swell?.primary ? (
                  <div>
                    <p className="text-2xl font-bold text-ocean">
                      {swell.primary.height}ft @ {swell.primary.period}s
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">
                      {swell.primary.directionCardinal} ({swell.primary.direction.toFixed(0)}°)
                    </p>
                    {swell.secondary && parseFloat(swell.secondary.height) > 0 && (
                      <p className="text-xs text-ocean/60 mt-2">
                        Secondary: {swell.secondary.height}ft @ {swell.secondary.period}s
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">{swell?.error || "No data"}</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Wave Energy" />
              <CardBody>
                {waveEnergy?.energy ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {waveEnergy.energy} <span className="text-sm">kJ/m²</span>
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">{waveEnergy.level}</p>
                    <p className="text-xs text-ocean/60 mt-1">{waveEnergy.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">{waveEnergy?.error || "No data"}</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Wave Consistency" />
              <CardBody>
                {waveConsistency?.score ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {waveConsistency.score}%
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">{waveConsistency.level}</p>
                    <p className="text-xs text-ocean/60 mt-1">{waveConsistency.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">{waveConsistency?.error || "No data"}</p>
                )}
              </CardBody>
            </Card>

            {/* Water Quality */}
            <Card>
              <CardHeader title="Water Quality" />
              <CardBody>
                {quality?.error ? (
                  <p className="text-sm text-ocean/50 italic">
                    {quality.error}
                  </p>
                ) : quality?.status || quality?.quality ? (
                  <div>
                    <p className="text-xl font-bold text-ocean">
                      {quality.status || quality.quality}
                    </p>
                    {quality.description && (
                      <p className="text-xs text-ocean/60 mt-1">
                        {quality.description}
                      </p>
                    )}
                    {quality.lastUpdated && (
                      <p className="text-xs text-ocean/50 mt-1">
                        Updated: {new Date(quality.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Water Visibility */}
            <Card>
              <CardHeader title="Water Visibility" />
              <CardBody>
                {waterVisibility?.error ? (
                  <p className="text-sm text-ocean/50 italic">
                    {waterVisibility.error}
                  </p>
                ) : waterVisibility?.visibility ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {waterVisibility.visibility} <span className="text-sm">ft</span>
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">
                      {waterVisibility.level}
                    </p>
                    <p className="text-xs text-ocean/60 mt-1">
                      {waterVisibility.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Tide */}
            <Card>
              <CardHeader title="Tide" />
              <CardBody>
                {tides?.error ? (
                  <p className="text-sm text-ocean/50 italic">
                    {tides.error}
                  </p>
                ) : tides?.current ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
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
                    {tides.nextLow && (
                      <p className="text-xs text-ocean/60 mt-1">
                        Low: {tides.nextLow.height}ft @ {formatTime(tides.nextLow.time)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </section>

      {/* Wave Map */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">🌊 Wave Map</h2>
        <div className="w-full">
          <WaveMapEmbed lat={selected.coords.lat} lon={selected.coords.lon} />
        </div>
      </section>
    </Layout>
  );
}

