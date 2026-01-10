import { useEffect } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWeatherData } from "@/store/slices/weatherSlice";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useWeatherData() {
  const { selected } = useLocation();
  const dispatch = useAppDispatch();
  const locationId = selected.id;

  const weatherData = useAppSelector((state) => state.weather.data[locationId]);
  const loading = useAppSelector((state) => state.weather.loading[locationId] ?? false);
  const lastFetch = useAppSelector((state) => state.weather.lastFetch[locationId] ?? 0);
  const error = useAppSelector((state) => state.weather.error[locationId]);

  useEffect(() => {
    const now = Date.now();
    const shouldFetch = !weatherData || now - lastFetch > CACHE_DURATION;

    if (shouldFetch && !loading) {
      const { lat, lon } = selected.coords;
      dispatch(
        fetchWeatherData({
          lat,
          lon,
          station: selected.noaaStation,
          locationId: selected.id,
        })
      );
    }
  }, [selected, dispatch, weatherData, lastFetch, loading]);

  return {
    wind: weatherData?.wind || null,
    waves: weatherData?.waves || null,
    swell: weatherData?.swell || null,
    weather: weatherData?.weather || null,
    air: weatherData?.air || null,
    tides: weatherData?.tides || null,
    waterTemp: weatherData?.waterTemp || null,
    waveEnergy: weatherData?.waveEnergy || null,
    waveConsistency: weatherData?.waveConsistency || null,
    quality: weatherData?.quality || null,
    waterVisibility: weatherData?.waterVisibility || null,
    surfingConditions: weatherData?.surfingConditions || null,
    kiteboardingConditions: weatherData?.kiteboardingConditions || null,
    wakeboardingConditions: weatherData?.wakeboardingConditions || null,
    snorkelingConditions: weatherData?.snorkelingConditions || null,
    paddleboardingConditions: weatherData?.paddleboardingConditions || null,
    sailingConditions: weatherData?.sailingConditions || null,
    loading,
    error,
  };
}
