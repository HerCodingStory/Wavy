import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface SportConditionCardProps {
  icon: LucideIcon;
  name: string;
  score: number;
  level: string;
  description?: string;
  bestTimeFormatted?: string;
  hoursFromNow?: number;
  className?: string;
}

export function SportConditionCard({
  icon: Icon,
  name,
  score,
  level,
  description,
  bestTimeFormatted,
  hoursFromNow,
  className,
}: SportConditionCardProps) {
  // Determine color and status based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return { 
      color: "#10b981", 
      bg: "bg-white/80 dark:bg-emerald-950", 
      border: "border-emerald-100 dark:border-emerald-800",
      textColor: "#065f46" // Dark emerald for light mode text
    };
    if (score >= 65) return { 
      color: "#3b82f6", 
      bg: "bg-white/80 dark:bg-blue-950", 
      border: "border-blue-100 dark:border-blue-800",
      textColor: "#1e40af" // Dark blue for light mode text
    };
    if (score >= 50) return { 
      color: "#f59e0b", 
      bg: "bg-white/80 dark:bg-amber-950", 
      border: "border-amber-100 dark:border-amber-800",
      textColor: "#92400e" // Dark amber for light mode text
    };
    if (score >= 35) return { 
      color: "#ef4444", 
      bg: "bg-white/80 dark:bg-red-950", 
      border: "border-red-100 dark:border-red-800",
      textColor: "#991b1b" // Dark red for light mode text
    };
    return { 
      color: "#6b7280", 
      bg: "bg-white/80 dark:bg-gray-950", 
      border: "border-gray-100 dark:border-gray-800",
      textColor: "#374151" // Dark gray for light mode text
    };
  };

  const scoreColors = getScoreColor(score);
  const barColor = score >= 80 ? "from-emerald-500 to-teal-500" : 
                   score >= 65 ? "from-blue-500 to-cyan-500" :
                   score >= 50 ? "from-amber-500 to-orange-500" :
                   score >= 35 ? "from-red-500 to-red-600" :
                   "from-gray-400 to-gray-500";

  return (
    <div
      className={clsx(
        "relative backdrop-blur-sm border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group",
        scoreColors.border,
        scoreColors.bg,
        className
      )}
    >
      {/* Decorative gradient background */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl -z-0"
        style={{ backgroundColor: scoreColors.color }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${scoreColors.color}15` }}
            >
              <Icon
                className="w-6 h-6"
                style={{ color: scoreColors.color }}
              />
            </div>
            <h3 
              className="text-lg font-bold dark:text-white" 
              style={{ color: scoreColors.textColor || scoreColors.color }}
            >
              {name}
            </h3>
          </div>
        </div>

        {/* Big Score */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className="text-5xl font-black tracking-tight"
              style={{ color: scoreColors.color }}
            >
              {score}
            </span>
            <span 
              className="text-xl font-semibold dark:!text-white/70"
              style={{ color: scoreColors.textColor ? `${scoreColors.textColor}CC` : undefined }}
            >
              /100
            </span>
          </div>
          
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="relative w-full h-2.5 bg-ocean/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out ${barColor}`}
              style={{
                width: `${score}%`,
              }}
            />
            {/* Shine effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                width: `${score}%`,
              }}
            />
          </div>
        </div>

          {/* Level Badge */}
          <div className="inline-flex items-center gap-1.5 mt-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: scoreColors.color }}
            />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: scoreColors.color }}
            >
              {level}
            </span>
          </div>
        </div>

        {/* Description (minimal) */}
        {description && (
          <p 
            className="text-xs dark:!text-white/90 font-medium leading-relaxed mb-2"
            style={{ color: scoreColors.textColor ? `${scoreColors.textColor}DD` : undefined }}
          >
            {description}
          </p>
        )}

        {/* Best Time */}
        {bestTimeFormatted && (
          <div 
            className="flex items-center gap-1.5 mt-2 pt-2 border-t dark:border-white/20"
            style={{ borderColor: scoreColors.textColor ? `${scoreColors.textColor}30` : undefined }}
          >
            <svg
              className="w-3 h-3 dark:!text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: scoreColors.textColor ? `${scoreColors.textColor}AA` : undefined }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span 
              className="text-xs dark:!text-white/70 font-medium"
              style={{ color: scoreColors.textColor ? `${scoreColors.textColor}AA` : undefined }}
            >
              Best time: {bestTimeFormatted}
              {hoursFromNow !== undefined && hoursFromNow > 0 && ` (${hoursFromNow}h)`}
            </span>
          </div>
        )}
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
    </div>
  );
}

