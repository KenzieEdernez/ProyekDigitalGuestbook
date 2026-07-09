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

export function buildGoogleCalendarUrl(input: CalendarEventInput) {
  const event = buildCalendarEvent(input);
  if (!event) return "";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toGoogleCalendarUtc(event.start)}/${toGoogleCalendarUtc(event.end)}`,
    location: event.location,
    details: event.description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(input: CalendarEventInput) {
  const event = buildCalendarEvent(input);
  if (!event) return false;

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
    `SUMMARY:${event.title.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location.replace(/\n/g, "\\n")}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  const blob = new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "wedding-event.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
}

export function addToCalendar(input: CalendarEventInput) {
  const googleUrl = buildGoogleCalendarUrl(input);
  if (googleUrl) {
    window.open(googleUrl, "_blank", "noopener,noreferrer");
    return true;
  }

  return downloadIcsFile(input);
}
