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

export function buildIcsContent(input: CalendarEventInput) {
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

export function addToCalendar(input: CalendarEventInput) {
  const params = new URLSearchParams({
    title: input.title,
    date: input.date,
    time: input.time,
    location: input.location,
  });

  if (input.description) {
    params.set("description", input.description);
  }

  window.location.assign(`/api/calendar/download?${params.toString()}`);
  return true;
}
