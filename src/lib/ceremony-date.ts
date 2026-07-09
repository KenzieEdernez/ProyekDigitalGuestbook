export function toCeremonyDateInputValue(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  const timestamp = Date.parse(value);
  if (!Number.isNaN(timestamp)) {
    return new Date(timestamp).toISOString().slice(0, 10);
  }

  return "";
}

export function formatCeremonyDateDisplay(isoDate: string) {
  if (!isoDate) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;

  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;

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
