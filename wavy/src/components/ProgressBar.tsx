interface ProgressBarProps {
  value: number;
  max: number;
  height?: number;
  label?: string;
  showLabel?: boolean;
  color?: string;
  gradient?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  height = 8,
  label,
  showLabel = true,
  color,
  gradient = false,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  // Determine color based on percentage if not provided
  let barColorClass = "";
  let barColorHex = color;
  if (!color) {
    if (percentage >= 70) {
      barColorClass = "bg-gradient-to-r from-emerald-500 to-teal-500";
      barColorHex = "#10b981";
    } else if (percentage >= 40) {
      barColorClass = "bg-gradient-to-r from-amber-500 to-orange-500";
      barColorHex = "#f59e0b";
    } else {
      barColorClass = "bg-gradient-to-r from-red-500 to-red-600";
      barColorHex = "#ef4444";
    }
  } else {
    // If color is provided as hex, create a gradient class from it
    barColorClass = gradient ? `bg-gradient-to-r from-[${color}] to-[${color}]` : "";
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-ocean/70">{label}</span>
          <span className="text-xs font-semibold text-ocean">
            {value.toFixed(1)} / {max}
          </span>
        </div>
      )}
      <div
        className="relative w-full bg-ocean/10 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            gradient && barColorClass ? barColorClass : ""
          }`}
          style={{
            width: `${percentage}%`,
            ...(gradient && barColorClass ? {} : { backgroundColor: barColorHex }),
          }}
        />
        {/* Shine effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            width: `${percentage}%`,
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}

