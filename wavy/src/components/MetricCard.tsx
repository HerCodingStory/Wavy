import { LucideIcon } from "lucide-react";
import { CircularGauge } from "./CircularGauge";
import { ProgressBar } from "./ProgressBar";
import clsx from "clsx";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit?: string;
  max?: number;
  type?: "gauge" | "bar" | "simple";
  color?: string;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  windDirection?: number; // Wind direction in degrees (0-360)
  className?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  max,
  type = "simple",
  color,
  subtitle,
  trend,
  windDirection,
  className,
}: MetricCardProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(value as string) || 0;
  const displayMax = max || 100;

  // Determine color based on value if not provided
  let metricColor = color;
  if (!metricColor && typeof value === "number" && max) {
    const percentage = (numericValue / max) * 100;
    if (percentage >= 70) {
      metricColor = "#10b981"; // emerald-500
    } else if (percentage >= 40) {
      metricColor = "#f59e0b"; // amber-500
    } else {
      metricColor = "#ef4444"; // red-500
    }
  }

  return (
    <div
      className={clsx(
        "bg-foam/90 backdrop-blur-sm border border-ocean/10 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-ocean/5">
            <Icon className="w-5 h-5 text-ocean" />
          </div>
          <span className="text-sm font-semibold text-ocean/80">{label}</span>
        </div>
        {trend && (
          <div
            className={clsx(
              "w-2 h-2 rounded-full",
              trend === "up" && "bg-emerald-500",
              trend === "down" && "bg-red-500",
              trend === "stable" && "bg-ocean/40"
            )}
          />
        )}
      </div>

      {type === "gauge" && typeof value === "number" && max && (
        <div className="flex justify-center mb-2">
          <CircularGauge
            value={numericValue}
            max={displayMax}
            size={100}
            color={metricColor}
            showValue={false}
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {/* Wind Direction Arrow */}
          {windDirection !== undefined && (
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full bg-ocean/10 flex items-center justify-center"
              style={{
                transform: `rotate(${windDirection}deg)`,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-ocean"
                style={{
                  transform: "rotate(180deg)", // Arrow points in direction wind is coming FROM
                }}
              >
                <path d="M12 2v20M12 2l4 4M12 2L8 6" />
              </svg>
            </div>
          )}
          
          <div className="flex items-baseline gap-1 flex-1">
            <span className="text-3xl font-bold text-ocean">
              {typeof value === "number" ? value.toFixed(value < 1 ? 1 : 0) : value}
            </span>
            {unit && (
              <span className="text-lg font-medium text-ocean/60">{unit}</span>
            )}
          </div>
        </div>

        {type === "bar" && typeof value === "number" && max && (
          <ProgressBar
            value={numericValue}
            max={displayMax}
            height={6}
            showLabel={false}
            color={metricColor}
            gradient
          />
        )}

        {subtitle && (
          <p className="text-xs text-ocean/60 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

