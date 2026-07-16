import {
  parseEventDateTime,
  toGoogleCalendarUtc,
  toIcsLocalDateTime,
} from "./event-datetime";

export type CalendarEventInput = {
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  durationHours?: number;
};

function buildCalendarEvent(input: CalendarEventInput) {
  const start = parseEventDateTime(input.date, input.time);
  if (!start) return null;

  const end = new Date(start);
  end.setHours(end.getHours() + (input.durationHours ?? 3));

  return {
    title: input.title,
    start,
    end,
    location: input.location,
    description: input.description ?? "",
  };
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildIcsContent(input: CalendarEventInput) {
  const event = buildCalendarEvent(input);
  if (!event) return null;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Digital Guestbook//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@digital-guestbook`,
    `DTSTAMP:${toGoogleCalendarUtc(new Date())}`,
    `DTSTART:${toIcsLocalDateTime(event.start)}`,
    `DTEND:${toIcsLocalDateTime(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    event.description
      ? `DESCRIPTION:${escapeIcsText(event.description)}`
      : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return `${lines.join("\r\n")}\r\n`;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function addToCalendar(input: CalendarEventInput) {
  const icsContent = buildIcsContent(input);
  if (!icsContent) return false;

  if (isIosDevice()) {
    window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    return true;
  }

  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "wedding-event.ics";
  anchor.rel = "noopener noreferrer";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  return true;
}
