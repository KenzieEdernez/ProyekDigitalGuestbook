import {
  isoDateFromLocalDate,
  localDateFromIso,
} from "./event-datetime";

export function toCeremonyDateInputValue(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return isoDateFromLocalDate(parsed);
  }

  return "";
}

export function formatCeremonyDateDisplay(isoDate: string) {
  if (!isoDate) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;

  const parsed = localDateFromIso(isoDate);
  if (!parsed) return isoDate;

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function ceremonyDateFromInput(isoDate: string) {
  if (!isoDate) return "";
  return formatCeremonyDateDisplay(isoDate);
}
