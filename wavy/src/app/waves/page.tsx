"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardBody, CardHeader } from "@/components/Card";

export default function WavesPage() {
  const { selected, setSelected } = useLocation();
  const { waves, swell, waveEnergy, waveConsistency, loading } = useWeatherData();

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">🌊 Wave Conditions</h2>
        {loading ? (
          <div className="text-center py-8 text-ocean/60">Loading wave data...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader title="Wave Height" />
              <CardBody>
                {waves?.waveHeight ? (
                  <div>
                    <p className="text-4xl font-bold text-ocean">
                      {parseFloat(waves.waveHeight).toFixed(2)} <span className="text-xl">m</span>
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">
                      Period: {waves.wavePeriod ? `${waves.wavePeriod}s` : "--"}
                    </p>
                    {waves?.surfHeight && (
                      <p className="text-xs text-ocean/60 mt-1">
                        Surf Height: {parseFloat(waves.surfHeight).toFixed(2)}m
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
                      {swell.primary.height}m @ {swell.primary.period}s
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">
                      {swell.primary.directionCardinal} ({swell.primary.direction.toFixed(0)}°)
                    </p>
                    {swell.secondary && parseFloat(swell.secondary.height) > 0 && (
                      <p className="text-xs text-ocean/60 mt-2">
                        Secondary: {swell.secondary.height}m @ {swell.secondary.period}s
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
          </div>
        )}
      </section>
    </Layout>
  );
}

