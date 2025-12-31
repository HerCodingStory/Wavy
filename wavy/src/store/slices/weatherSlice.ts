import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface WeatherData {
  wind: any;
  waves: any;
  swell: any;
  weather: any;
  air: any;
  tides: any;
  waterTemp: any;
  waveEnergy: any;
  waveConsistency: any;
  quality: any;
  waterVisibility: any;
  surfingConditions: any;
  kiteboardingConditions: any;
  wakeboardingConditions: any;
  snorkelingConditions: any;
  paddleboardingConditions: any;
}

interface WeatherState {
  data: Record<string, WeatherData>; // Key: locationId
  loading: Record<string, boolean>;
  lastFetch: Record<string, number>; // Timestamp of last fetch
  error: Record<string, string | null>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const parseResponse = async (res: Response) => {
  try {
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.clone().text();
      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        return { error: `Server error (HTTP ${res.status})` };
      }
      try {
        const data = JSON.parse(text);
        if (data.error) {
          return { error: data.error };
        }
        return data;
      } catch {
        return { error: `Invalid response format (HTTP ${res.status})` };
      }
    }

    const data = await res.json();
    if (!res.ok || data.error) {
      return { error: data.error || `HTTP ${res.status}` };
    }
    return data;
  } catch (err) {
    console.error(`Error parsing response from ${res.url}:`, err);
    return { error: `Failed to parse response (HTTP ${res.status})` };
  }
};

export const fetchWeatherData = createAsyncThunk(
  "weather/fetchWeatherData",
  async (params: { lat: number; lon: number; station: string; locationId: string }) => {
    const { lat, lon, station, locationId } = params;

    const [
      windRes,
      waveRes,
      swellRes,
      weatherRes,
      tideRes,
      waterTempRes,
      waveEnergyRes,
      waveConsistencyRes,
      airRes,
      qualityRes,
      waterVisibilityRes,
      surfingRes,
      kiteboardingRes,
      wakeboardingRes,
      snorkelingRes,
      paddleboardingRes,
    ] = await Promise.all([
      fetch(`/api/wind?lat=${lat}&lon=${lon}`),
      fetch(`/api/waves?lat=${lat}&lon=${lon}`),
      fetch(`/api/swell?lat=${lat}&lon=${lon}`),
      fetch(`/api/weather?lat=${lat}&lon=${lon}`),
      fetch(`/api/tides?station=${station}&lat=${lat}&lon=${lon}`),
      fetch(`/api/water-temp?station=${station}&lat=${lat}&lon=${lon}`),
      fetch(`/api/wave-energy?lat=${lat}&lon=${lon}`),
      fetch(`/api/wave-consistency?lat=${lat}&lon=${lon}`),
      fetch(`/api/air?lat=${lat}&lon=${lon}`),
      fetch(`/api/water-quality?station=${station}&lat=${lat}&lon=${lon}`),
      fetch(`/api/water-visibility?lat=${lat}&lon=${lon}`),
      fetch(`/api/surfing-conditions?lat=${lat}&lon=${lon}`),
      fetch(`/api/kiteboarding-conditions?lat=${lat}&lon=${lon}`),
      fetch(`/api/wakeboarding-conditions?lat=${lat}&lon=${lon}`),
      fetch(`/api/snorkeling-conditions?lat=${lat}&lon=${lon}&station=${station}`),
      fetch(`/api/paddleboarding-conditions?lat=${lat}&lon=${lon}`),
    ]);

    const weatherData: WeatherData = {
      wind: await parseResponse(windRes),
      waves: await parseResponse(waveRes),
      swell: await parseResponse(swellRes),
      weather: await parseResponse(weatherRes),
      tides: await parseResponse(tideRes),
      waterTemp: await parseResponse(waterTempRes),
      waveEnergy: await parseResponse(waveEnergyRes),
      waveConsistency: await parseResponse(waveConsistencyRes),
      air: await parseResponse(airRes),
      quality: await parseResponse(qualityRes),
      waterVisibility: await parseResponse(waterVisibilityRes),
      surfingConditions: await parseResponse(surfingRes),
      kiteboardingConditions: await parseResponse(kiteboardingRes),
      wakeboardingConditions: await parseResponse(wakeboardingRes),
      snorkelingConditions: await parseResponse(snorkelingRes),
      paddleboardingConditions: await parseResponse(paddleboardingRes),
    };

    return { locationId, data: weatherData };
  }
);

const initialState: WeatherState = {
  data: {},
  loading: {},
  lastFetch: {},
  error: {},
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearCache: (state, action: PayloadAction<string>) => {
      const locationId = action.payload;
      delete state.data[locationId];
      delete state.lastFetch[locationId];
    },
    clearAllCache: (state) => {
      state.data = {};
      state.lastFetch = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state, action) => {
        const locationId = action.meta.arg.locationId;
        state.loading[locationId] = true;
        state.error[locationId] = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        const { locationId, data } = action.payload;
        state.data[locationId] = data;
        state.loading[locationId] = false;
        state.lastFetch[locationId] = Date.now();
        state.error[locationId] = null;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        const locationId = action.meta.arg.locationId;
        state.loading[locationId] = false;
        state.error[locationId] = action.error.message || "Failed to fetch weather data";
      });
  },
});

export const { clearCache, clearAllCache } = weatherSlice.actions;
export default weatherSlice.reducer;

