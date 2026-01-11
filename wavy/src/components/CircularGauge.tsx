interface CircularGaugeProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  unit?: string;
  color?: string;
  showValue?: boolean;
}

export function CircularGauge({
  value,
  max,
  size = 80,
  strokeWidth = 8,
  label,
  unit,
  color = "var(--color-coral)",
  showValue = true,
}: CircularGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-ocean/10"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Value text */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-ocean" style={{ fontSize: size * 0.2 }}>
              {value.toFixed(value < 1 ? 1 : 0)}
            </span>
            {unit && (
              <span className="text-xs text-ocean/60" style={{ fontSize: size * 0.12 }}>
                {unit}
              </span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span className="text-xs font-medium text-ocean/70 mt-2 text-center">
          {label}
        </span>
      )}
    </div>
  );
}

