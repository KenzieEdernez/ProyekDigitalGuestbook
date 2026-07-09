import { parseTime12 } from "./event-time";

export function localDateFromIso(isoDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day, 12, 0, 0);

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function isoDateFromLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseFlexibleDate(value: string) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return localDateFromIso(value);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
    12,
    0,
    0
  );
}

export function applyTimeToDate(base: Date, timeFrom: string) {
  const parts = parseTime12(timeFrom);
  const result = new Date(base);

  if (!parts) {
    result.setHours(9, 0, 0, 0);
    return result;
  }

  let hour = parts.hour % 12;
  if (parts.period === "PM") hour += 12;

  result.setHours(hour, parts.minute, 0, 0);
  return result;
}

export function parseEventDateTime(date: string, timeFrom: string) {
  const base = parseFlexibleDate(date);
  if (!base) return null;
  return applyTimeToDate(base, timeFrom);
}

export function toGoogleCalendarUtc(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function toIcsLocalDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hour}${minute}${second}`;
}
