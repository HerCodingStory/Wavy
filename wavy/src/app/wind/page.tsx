"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { WindyEmbed } from "@/components/WindyEmbed";
import { LoadingWaves } from "@/components/LoadingWaves";

export default function WindPage() {
  const { selected, setSelected } = useLocation();
  const { wind, weather, air, loading } = useWeatherData();

  function getCardinalDirection(degrees: number): string {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">💨 Current Conditions</h2>
        {loading ? (
          <LoadingWaves />
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

            {/* Air Quality */}
            {air && !air.error && (
              <Card>
                <CardHeader title="Air Quality" />
                <CardBody>
                  {air.aqi !== undefined ? (
                    <div>
                      <p className="text-2xl font-bold text-ocean">
                        {air.aqi}
                      </p>
                      <p className="text-sm text-ocean/70 mt-1">
                        {air.category || "Unknown"}
                      </p>
                      {air.pm25 && (
                        <p className="text-xs text-ocean/60 mt-1">
                          PM2.5: {air.pm25} µg/m³
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-ocean/50 italic">No data</p>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Wind Gust */}
            <Card>
              <CardHeader title="Wind Gust" />
              <CardBody>
                {wind?.gusts ? (
                  <div>
                    <p className="text-4xl font-bold text-ocean">
                      💨 {wind.gusts.toFixed(1)} <span className="text-xl">mph</span>
                    </p>
                    {wind.speed && (
                      <p className="text-sm text-ocean/70 mt-2">
                        Regular: {wind.speed.toFixed(1)} mph
                      </p>
                    )}
                  </div>
                ) : weather?.current?.windGust ? (
                  <div>
                    <p className="text-4xl font-bold text-ocean">
                      💨 {weather.current.windGust} <span className="text-xl">mph</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Cloud Coverage */}
            <Card>
              <CardHeader title="Cloud Coverage" />
              <CardBody>
                {weather?.current?.cloudCover !== null && weather?.current?.cloudCover !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      ☁️ {weather.current.cloudCover}%
                    </p>
                    <p className="text-xs text-ocean/60 mt-1">
                      {weather.current.cloudCover < 25 ? "Clear" :
                       weather.current.cloudCover < 50 ? "Partly Cloudy" :
                       weather.current.cloudCover < 75 ? "Mostly Cloudy" : "Overcast"}
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

      {/* Wind Map */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">💨 Map</h2>
        <div className="w-full">
          <WindyEmbed lat={selected.coords.lat} lon={selected.coords.lon} />
        </div>
      </section>
    </Layout>
  );
}

