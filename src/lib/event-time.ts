export type TimePeriod = "AM" | "PM";

export type TimeParts = {
  hour: number;
  minute: number;
  period: TimePeriod;
};

export function formatTime12({ hour, minute, period }: TimeParts) {
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function stripTimePrefix(value: string) {
  return value.trim().replace(/^at\s+/i, "");
}

export function formatEventTimeAt(timeFrom: string) {
  const cleaned = stripTimePrefix(timeFrom);
  if (!cleaned) return "";

  const parts = parseTime12(cleaned);
  return parts ? formatTime12(parts) : cleaned;
}

function to12Hour(hour24: number, minute: number): TimeParts {
  const period: TimePeriod = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return { hour: hour12, minute, period };
}

export function parseTime12(value: string): TimeParts | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withoutAt = trimmed.replace(/^at\s+/i, "");

  const match12 = withoutAt.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    const hour = Number(match12[1]);
    const minute = Number(match12[2]);
    const period = match12[3].toUpperCase() as TimePeriod;
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
    return { hour, minute, period };
  }

  const match24 = withoutAt.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hour24 = Number(match24[1]);
    const minute = Number(match24[2]);
    if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) return null;
    return to12Hour(hour24, minute);
  }

  return null;
}

export function parseLegacyTimeValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const withoutAt = trimmed.replace(/^at\s+/i, "");
  const [fromRaw] = withoutAt.split(/\s*-\s*/);
  const fromParts = parseTime12(fromRaw ?? "");
  return fromParts ? formatTime12(fromParts) : fromRaw?.trim() ?? "";
}

export function emptyTimeParts(): TimeParts {
  return { hour: 7, minute: 0, period: "PM" };
}

export function partsFromTimeString(value: string, fallback = emptyTimeParts()) {
  return parseTime12(value) ?? fallback;
}

export function isTimePartsComplete(parts: TimeParts) {
  return (
    Number.isFinite(parts.hour) &&
    parts.hour >= 1 &&
    parts.hour <= 12 &&
    Number.isFinite(parts.minute) &&
    parts.minute >= 0 &&
    parts.minute <= 59 &&
    (parts.period === "AM" || parts.period === "PM")
  );
}
