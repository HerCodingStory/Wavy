"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { MetricCard } from "@/components/MetricCard";
import { WaveMapEmbed } from "@/components/WaveMapEmbed";
import {
  Waves,
  Navigation,
  Zap,
  TrendingUp,
  Eye,
  Droplets,
  Activity,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function WavesPage() {
  const { selected, setSelected } = useLocation();
  const {
    waves,
    swell,
    waveEnergy,
    waveConsistency,
    quality,
    waterVisibility,
    tides,
    loading,
  } = useWeatherData();

  function getCardinalDirection(degrees: number): string {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  // Get tide trend
  function getTideTrend(isRising: boolean) {
    return isRising ? ("up" as const) : ("down" as const);
  }

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ocean">Wave Conditions</h1>
          <p className="text-sm text-ocean/60 font-medium">
            Real-time wave data and ocean conditions
          </p>
        </div>

        {/* Wave Conditions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <h2 className="text-xl font-bold text-ocean">Wave Conditions</h2>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-ocean/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Wave Height */}
              {waves?.waveHeight && (
                <MetricCard
                  icon={Waves}
                  label="Wave Height"
                  value={parseFloat(waves.waveHeight) * 3.28084} // Convert m to ft
                  unit="ft"
                  type="bar"
                  max={15}
                  subtitle={
                    waves.wavePeriod
                      ? `Period: ${waves.wavePeriod}s`
                      : undefined
                  }
                />
              )}

              {/* Primary Swell */}
              {swell?.primary && (
                <MetricCard
                  icon={Navigation}
                  label="Primary Swell"
                  value={parseFloat(swell.primary.height) * 3.28084} // Convert m to ft
                  unit="ft"
                  type="bar"
                  max={15}
                  subtitle={`${swell.primary.directionCardinal} @ ${swell.primary.period}s`}
                />
              )}

              {/* Wave Energy */}
              {waveEnergy?.energy && (
                <MetricCard
                  icon={Zap}
                  label="Wave Energy"
                  value={parseFloat(waveEnergy.energy)}
                  unit="kJ/m²"
                  type="bar"
                  max={200}
                  subtitle={waveEnergy.level}
                  color={
                    parseFloat(waveEnergy.energy) > 150
                      ? "#ef4444"
                      : parseFloat(waveEnergy.energy) > 100
                      ? "#f59e0b"
                      : "#10b981"
                  }
                />
              )}

              {/* Wave Consistency */}
              {waveConsistency?.score && (
                <MetricCard
                  icon={TrendingUp}
                  label="Wave Consistency"
                  value={waveConsistency.score}
                  unit="%"
                  type="bar"
                  max={100}
                  subtitle={waveConsistency.level}
                />
              )}

              {/* Water Quality */}
              {quality &&
                !quality.error &&
                (quality.status || quality.quality) && (
                  <MetricCard
                    icon={Activity}
                    label="Water Quality"
                    value={
                      quality.status || quality.quality
                        ? quality.status || quality.quality
                        : ""
                    }
                    unit=""
                    type="simple"
                    subtitle={quality.description}
                  />
                )}

              {/* Water Visibility */}
              {waterVisibility?.visibility && !waterVisibility.error && (
                <MetricCard
                  icon={Eye}
                  label="Water Visibility"
                  value={parseFloat(waterVisibility.visibility)}
                  unit="ft"
                  type="bar"
                  max={100}
                  subtitle={waterVisibility.level}
                  color={
                    parseFloat(waterVisibility.visibility) > 60
                      ? "#10b981"
                      : parseFloat(waterVisibility.visibility) > 30
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                />
              )}

              {/* Tide */}
              {tides?.current && !tides.error && (
                <MetricCard
                  icon={Droplets}
                  label="Tide"
                  value={parseFloat(tides.current.height)}
                  unit="ft"
                  type="gauge"
                  max={6}
                  trend={
                    tides.current?.isRising
                      ? getTideTrend(tides.current.isRising)
                      : undefined
                  }
                  subtitle={
                    tides.current?.isRising ? "Rising" : "Falling"
                  }
                />
              )}

              {/* Secondary Swell */}
              {swell?.secondary &&
                parseFloat(swell.secondary.height) > 0 && (
                  <MetricCard
                    icon={Navigation}
                    label="Secondary Swell"
                    value={parseFloat(swell.secondary.height) * 3.28084} // Convert m to ft
                    unit="ft"
                    type="bar"
                    max={10}
                    subtitle={`${swell.secondary.directionCardinal} @ ${swell.secondary.period}s`}
                  />
                )}
            </div>
          )}
        </section>

        {/* Wave Map */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <h2 className="text-xl font-bold text-ocean">Wave Map</h2>
          </div>
          <div className="w-full rounded-2xl overflow-hidden shadow-lg">
            <WaveMapEmbed lat={selected.coords.lat} lon={selected.coords.lon} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
