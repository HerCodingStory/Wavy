"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { LoadingWaves } from "@/components/LoadingWaves";
import { getMoonPhase, formatTime } from "@/lib/utils";

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
    sailingConditions,
    loading,
  } = useWeatherData();



  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      {/* Temperature & Weather Metrics */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Weather Metrics</h2>
        {loading ? (
          <LoadingWaves />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Water Temperature */}
            <Card>
              <CardHeader title="Water Temperature" />
              <CardBody>
                {waterTemp?.error ? (
                  <p className="text-sm text-ocean/50 italic">{waterTemp.error}</p>
                ) : waterTemp?.temp ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      🌊 {waterTemp.temp}°F
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Air Temperature */}
            <Card>
              <CardHeader title="Air Temperature" />
              <CardBody>
                {weather?.error ? (
                  <p className="text-sm text-ocean/50 italic">{weather.error}</p>
                ) : weather?.current?.temperature ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      ☀️ {parseFloat(weather.current.temperature).toFixed(0)}°F
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>
            {/* Sunrise */}
            <Card>
              <CardHeader title="Sunrise" />
              <CardBody>
                {weather?.today?.sunrise ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      🌅 {formatTime(weather.today.sunrise)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Sunset */}
            <Card>
              <CardHeader title="Sunset" />
              <CardBody>
                {weather?.today?.sunset ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      🌇 {formatTime(weather.today.sunset)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* UV Index */}
            <Card>
              <CardHeader title="UV Index" />
              <CardBody>
                {weather?.current?.uv_index !== null && weather?.current?.uv_index !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      ☀️ {weather.current.uv_index}
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">
                      {weather.current.uv_index_max ? `Max: ${weather.current.uv_index_max}` : ""}
                    </p>
                    <p className="text-xs text-ocean/60 mt-1">
                      {parseFloat(weather.current.uv_index) < 3 ? "Low" :
                       parseFloat(weather.current.uv_index) < 6 ? "Moderate" :
                       parseFloat(weather.current.uv_index) < 8 ? "High" :
                       parseFloat(weather.current.uv_index) < 11 ? "Very High" : "Extreme"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Moon Phase */}
            <Card>
              <CardHeader title="Moon Phase" />
              <CardBody>
                <div>
                  {(() => {
                    const moonPhase = getMoonPhase();
                    return (
                      <>
                        <p className="text-4xl font-bold text-ocean mb-1">
                          {moonPhase.emoji}
                        </p>
                        <p className="text-sm text-ocean/70">{moonPhase.name}</p>
                      </>
                    );
                  })()}
                </div>
              </CardBody>
            </Card>

            {/* Visibility */}
            <Card>
              <CardHeader title="Visibility" />
              <CardBody>
                {weather?.current?.visibility ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      👁️ {weather.current.visibility} <span className="text-lg">mi</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Humidity */}
            <Card>
              <CardHeader title="Humidity" />
              <CardBody>
                {weather?.current?.humidity !== null && weather?.current?.humidity !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      💧 {weather.current.humidity}%
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

      {/* Weather Forecast */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">7-Day Weather Forecast</h2>
        {loading ? (
          <LoadingWaves />
        ) : weather?.forecast && weather.forecast.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
            {weather.forecast.map((day: any, idx: number) => {
              const date = new Date(day.date);
              const today = new Date();
              const isToday = date.toDateString() === today.toDateString();
              
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
              const title = isToday ? "Today" : `${dayName}, ${month} ${dayNum}`;
              
              return (
                <Card key={idx} className={idx >= 3 ? "hidden md:block" : ""}>
                  <CardHeader title={title} />
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
        <h2 className="text-2xl font-bold">🏄 Current Conditions</h2>
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
                    {surfingConditions?.bestTimeFormatted && (
                      <p className="text-xs text-coral mt-2 font-medium">
                        ⏰ Best time: {surfingConditions.bestTimeFormatted} 
                        {surfingConditions.hoursFromNow > 0 && ` (${surfingConditions.hoursFromNow}h)`}
                      </p>
                    )}
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
                    {kiteboardingConditions?.bestTimeFormatted && (
                      <p className="text-xs text-coral mt-2 font-medium">
                        ⏰ Best time: {kiteboardingConditions.bestTimeFormatted} 
                        {kiteboardingConditions.hoursFromNow > 0 && ` (${kiteboardingConditions.hoursFromNow}h)`}
                      </p>
                    )}
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
                    {wakeboardingConditions?.bestTimeFormatted && (
                      <p className="text-xs text-coral mt-2 font-medium">
                        ⏰ Best time: {wakeboardingConditions.bestTimeFormatted} 
                        {wakeboardingConditions.hoursFromNow > 0 && ` (${wakeboardingConditions.hoursFromNow}h)`}
                      </p>
                    )}
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
                    {snorkelingConditions?.bestTimeFormatted && (
                      <p className="text-xs text-coral mt-2 font-medium">
                        ⏰ Best time: {snorkelingConditions.bestTimeFormatted} 
                        {snorkelingConditions.hoursFromNow > 0 && ` (${snorkelingConditions.hoursFromNow}h)`}
                      </p>
                    )}
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
                    {paddleboardingConditions?.bestTimeFormatted && (
                      <p className="text-xs text-coral mt-2 font-medium">
                        ⏰ Best time: {paddleboardingConditions.bestTimeFormatted} 
                        {paddleboardingConditions.hoursFromNow > 0 && ` (${paddleboardingConditions.hoursFromNow}h)`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ocean/50 italic">No data</p>
                )}
              </CardBody>
            </Card>

            {/* Sailing */}
            <Card>
              <CardHeader title="Sailing" />
              <CardBody>
                {sailingConditions?.error ? (
                  <p className="text-sm text-ocean/50 italic">{sailingConditions.error}</p>
                ) : sailingConditions?.score !== undefined ? (
                  <div>
                    <p className="text-3xl font-bold text-ocean">
                      {sailingConditions.emoji} {sailingConditions.score}
                    </p>
                    <p className="text-sm text-ocean/70 mt-1">{sailingConditions.level}</p>
                    <p className="text-xs text-ocean/60 mt-1">{sailingConditions.description}</p>
                    {sailingConditions?.bestTimeFormatted && (
                      <p className="text-xs text-coral mt-2 font-medium">
                        ⏰ Best time: {sailingConditions.bestTimeFormatted} 
                        {sailingConditions.hoursFromNow > 0 && ` (${sailingConditions.hoursFromNow}h)`}
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
    </Layout>
  );
}
