"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardBody, CardHeader } from "@/components/Card";

export default function WindPage() {
  const { selected, setSelected } = useLocation();
  const { wind, weather, loading } = useWeatherData();

  function getCardinalDirection(degrees: number): string {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">💨 Wind Conditions</h2>
        {loading ? (
          <div className="text-center py-8 text-ocean/60">Loading wind data...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader title="Wind Speed" />
              <CardBody>
                {wind?.speed ? (
                  <div>
                    <p className="text-4xl font-bold text-ocean">
                      {wind.speed.toFixed(1)} <span className="text-xl">mph</span>
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">
                      {wind.gusts ? `Gusts: ${wind.gusts.toFixed(1)} mph` : "No gust data"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">{wind?.error || "No data"}</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Wind Direction" />
              <CardBody>
                {wind?.direction ? (
                  <div>
                    <p className="text-4xl font-bold text-ocean">
                      {getCardinalDirection(wind.direction)}
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">
                      {wind.direction.toFixed(0)}°
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Wind Conditions" />
              <CardBody>
                {wind?.speed ? (
                  <div>
                    <p className="text-lg font-bold text-ocean">
                      {wind.speed < 5 ? "Calm" : wind.speed < 15 ? "Light" : wind.speed < 25 ? "Moderate" : "Strong"}
                    </p>
                    <p className="text-sm text-ocean/70 mt-2">
                      {wind.gusts && wind.gusts - wind.speed > 5 ? "Gusty conditions" : "Steady conditions"}
                    </p>
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

