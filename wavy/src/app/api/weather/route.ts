import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude required" },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode,cloudcover,precipitation,relativehumidity_2m,pressure_msl,visibility,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();

    if (!data.current || !data.daily) {
      return NextResponse.json(
        { error: "Invalid weather data structure" },
        { status: 500 }
      );
    }

    const c = data.current;
    const daily = data.daily;

    // Weather code descriptions (WMO Weather interpretation codes)
    const weatherCodes: Record<number, { description: string; icon: string }> = {
      0: { description: "Clear sky", icon: "☀️" },
      1: { description: "Mainly clear", icon: "🌤️" },
      2: { description: "Partly cloudy", icon: "⛅" },
      3: { description: "Overcast", icon: "☁️" },
      45: { description: "Foggy", icon: "🌫️" },
      48: { description: "Depositing rime fog", icon: "🌫️" },
      51: { description: "Light drizzle", icon: "🌦️" },
      53: { description: "Moderate drizzle", icon: "🌦️" },
      55: { description: "Dense drizzle", icon: "🌦️" },
      56: { description: "Light freezing drizzle", icon: "🌨️" },
      57: { description: "Dense freezing drizzle", icon: "🌨️" },
      61: { description: "Slight rain", icon: "🌧️" },
      63: { description: "Moderate rain", icon: "🌧️" },
      65: { description: "Heavy rain", icon: "⛈️" },
      66: { description: "Light freezing rain", icon: "🌨️" },
      67: { description: "Heavy freezing rain", icon: "🌨️" },
      71: { description: "Slight snow", icon: "❄️" },
      73: { description: "Moderate snow", icon: "❄️" },
      75: { description: "Heavy snow", icon: "❄️" },
      77: { description: "Snow grains", icon: "❄️" },
      80: { description: "Slight rain showers", icon: "🌦️" },
      81: { description: "Moderate rain showers", icon: "🌧️" },
      82: { description: "Violent rain showers", icon: "⛈️" },
      85: { description: "Slight snow showers", icon: "🌨️" },
      86: { description: "Heavy snow showers", icon: "🌨️" },
      95: { description: "Thunderstorm", icon: "⛈️" },
      96: { description: "Thunderstorm with hail", icon: "⛈️" },
      99: { description: "Thunderstorm with heavy hail", icon: "⛈️" },
    };

    const weatherInfo = weatherCodes[c.weathercode] || { description: "Unknown", icon: "🌤️" };

    return NextResponse.json({
      current: {
        temperature: c.temperature_2m != null ? c.temperature_2m.toFixed(1) : null,
        feelsLike: c.apparent_temperature != null ? c.apparent_temperature.toFixed(1) : null,
        weatherCode: c.weathercode,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        cloudCover: c.cloudcover,
        precipitation: c.precipitation,
        humidity: c.relativehumidity_2m,
        pressure: c.pressure_msl != null ? c.pressure_msl.toFixed(0) : null,
        visibility: c.visibility ? (c.visibility / 1000).toFixed(1) : null,
        windSpeed: c.windspeed_10m,
        windDirection: c.winddirection_10m,
      },
      today: {
        maxTemp: daily.temperature_2m_max?.[0] != null ? daily.temperature_2m_max[0].toFixed(1) : null,
        minTemp: daily.temperature_2m_min?.[0] != null ? daily.temperature_2m_min[0].toFixed(1) : null,
        precipitation: daily.precipitation_sum?.[0] != null ? daily.precipitation_sum[0].toFixed(1) : null,
        sunrise: daily.sunrise?.[0] || null,
        sunset: daily.sunset?.[0] || null,
      },
      forecast: daily.time ? daily.time.slice(0, 7).map((time: string, idx: number) => ({
        date: time,
        maxTemp: daily.temperature_2m_max?.[idx],
        minTemp: daily.temperature_2m_min?.[idx],
        weatherCode: daily.weathercode?.[idx],
        precipitation: daily.precipitation_sum?.[idx],
      })) : [],
      unit: "°C",
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

