"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { LoadingWaves } from "@/components/LoadingWaves";

export default function DashboardPage() {
  const { selected, setSelected } = useLocation();
  const {
    weather,
    waterTemp,
    surfingConditions,
    kiteboardingConditions,
    wakeboardingConditions,
    snorkelingConditions,
    paddleboardingConditions,
    loading,
  } = useWeatherData();



  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      {/* Temperature */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Temperature</h2>
        {loading ? (
          <LoadingWaves />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Current Temperature" />
              <CardBody>
                {waterTemp?.error && weather?.error ? (
                  <p className="text-sm text-ocean/50 italic">
                    {waterTemp.error || weather.error || "No data"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {waterTemp?.temp ? (
                      <div>
                        <p className="text-3xl font-bold text-ocean">
                          🌊 {waterTemp.temp}°F
                        </p>
                        <p className="text-sm text-ocean/70 mt-1">Water Temperature</p>
                      </div>
                    ) : waterTemp?.error ? (
                      <p className="text-sm text-ocean/50">Water: {waterTemp.error}</p>
                    ) : null}
                    {weather?.current?.temperature ? (
                      <div className={waterTemp?.temp ? "mt-4" : ""}>
                        <p className="text-3xl font-bold text-ocean">
                          ☀️ {parseFloat(weather.current.temperature).toFixed(0)}°F
                        </p>
                        <p className="text-sm text-ocean/70 mt-1">Air Temperature</p>
                      </div>
                    ) : weather?.error ? (
                      <p className="text-sm text-ocean/50">Air: {weather.error}</p>
                    ) : null}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </section>

      {/* Weather Forecast */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">7-Day Weather Forecast</h2>
        {loading ? (
          <LoadingWaves />
        ) : weather?.forecast && weather.forecast.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {weather.forecast.map((day: any, idx: number) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = date.getDate();
              const month = date.toLocaleDateString("en-US", { month: "short" });
              
              // Weather code icons
              const weatherIcons: Record<number, string> = {
                0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
                45: "🌫️", 48: "🌫️",
                51: "🌦️", 53: "🌦️", 55: "🌦️",
                61: "🌧️", 63: "🌧️", 65: "⛈️",
                71: "❄️", 73: "❄️", 75: "❄️",
                80: "🌦️", 81: "🌧️", 82: "⛈️",
                95: "⛈️", 96: "⛈️", 99: "⛈️",
              };
              
              const icon = weatherIcons[day.weatherCode] || "🌤️";
              
              return (
                <Card key={idx}>
                  <CardHeader title={`${dayName}, ${month} ${dayNum}`} />
                  <CardBody>
                    <div className="text-center">
                      <p className="text-4xl mb-2">{icon}</p>
                      <p className="text-xl font-bold text-ocean">
                        {day.maxTemp ? `${day.maxTemp}°` : "--"}
                      </p>
                      <p className="text-sm text-ocean/70">
                        {day.minTemp ? `${day.minTemp}°` : "--"}
                      </p>
                      {day.precipitation && parseFloat(day.precipitation) > 0 && (
                        <p className="text-xs text-ocean/60 mt-1">
                          💧 {day.precipitation} in
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ocean/50 italic">No forecast data available</p>
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
