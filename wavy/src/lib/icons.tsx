import {
  Waves,
  Wind,
  Cloud,
  Droplets,
  Sun,
  Eye,
  Gauge,
  Navigation,
  Thermometer,
  Waves as Swell,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Zap,
} from "lucide-react";

// Sport-specific icons
export const sportIcons = {
  surfing: Waves,
  kiteboarding: Wind,
  wakeboarding: Activity,
  snorkeling: Eye,
  paddleboarding: Waves,
  sailing: Navigation,
};

// Metric icons
export const metricIcons = {
  wave: Waves,
  wind: Wind,
  temperature: Thermometer,
  humidity: Droplets,
  uv: Sun,
  visibility: Eye,
  pressure: Gauge,
  swell: Swell,
  tide: Droplets,
  energy: Zap,
};

// Direction helper for wind/swell
export function getDirectionIcon(direction: number) {
  return Navigation;
}

// Trend icons
export const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

