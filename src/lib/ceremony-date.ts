function isoDateFromLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localDateFromIso(isoDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day, 12, 0, 0);

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

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
