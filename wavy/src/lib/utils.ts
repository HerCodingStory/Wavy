/**
 * Calculate moon phase based on date
 * Returns phase name and emoji
 */
export function getMoonPhase(date: Date = new Date()): { name: string; emoji: string } {
  // Approximate calculation based on days since last known new moon
  // This is a simplified calculation - for more accuracy, use a proper astronomical library
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53; // Average length of a lunar cycle in days
  const phase = (daysSinceNewMoon % lunarCycle) / lunarCycle;

  if (phase < 0.03 || phase > 0.97) {
    return { name: "New Moon", emoji: "🌑" };
  } else if (phase < 0.22) {
    return { name: "Waxing Crescent", emoji: "🌒" };
  } else if (phase < 0.28) {
    return { name: "First Quarter", emoji: "🌓" };
  } else if (phase < 0.47) {
    return { name: "Waxing Gibbous", emoji: "🌔" };
  } else if (phase < 0.53) {
    return { name: "Full Moon", emoji: "🌕" };
  } else if (phase < 0.72) {
    return { name: "Waning Gibbous", emoji: "🌖" };
  } else if (phase < 0.78) {
    return { name: "Last Quarter", emoji: "🌗" };
  } else {
    return { name: "Waning Crescent", emoji: "🌘" };
  }
}

/**
 * Format time string from ISO format
 */
export function formatTime(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return timeString;
  }
}



