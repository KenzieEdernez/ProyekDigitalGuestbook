import fs from "fs";
import path from "path";
import { DEFAULT_EVENT_SETTINGS } from "./event-config";
import { getDataDir } from "./paths";
import type { EventSettings } from "@/types/event";

const SETTINGS_PATH = path.join(getDataDir(), "event-settings.json");

function toDateInputValue(value?: string) {
  if (!value) return DEFAULT_EVENT_SETTINGS.date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return DEFAULT_EVENT_SETTINGS.date;
  return parsed.toISOString().slice(0, 10);
}

function formatDateDisplay(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return DEFAULT_EVENT_SETTINGS.dateDisplay;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function sanitizeSettings(input: Partial<EventSettings>): EventSettings {
  const date = toDateInputValue(input.date);

  return {
    name: String(input.name ?? DEFAULT_EVENT_SETTINGS.name).trim(),
    date,
    dateDisplay: formatDateDisplay(date),
    time: String(input.time ?? DEFAULT_EVENT_SETTINGS.time).trim(),
    location: String(input.location ?? DEFAULT_EVENT_SETTINGS.location).trim(),
    address: String(input.address ?? DEFAULT_EVENT_SETTINGS.address).trim(),
    dressCode: String(input.dressCode ?? DEFAULT_EVENT_SETTINGS.dressCode).trim(),
    dressNote: String(input.dressNote ?? DEFAULT_EVENT_SETTINGS.dressNote).trim(),
  };
}

export function getEventSettings(): EventSettings {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) return DEFAULT_EVENT_SETTINGS;
    const raw = fs.readFileSync(SETTINGS_PATH, "utf8");
    return sanitizeSettings(JSON.parse(raw) as Partial<EventSettings>);
  } catch {
    return DEFAULT_EVENT_SETTINGS;
  }
}

export function saveEventSettings(input: Partial<EventSettings>): EventSettings {
  const settings = sanitizeSettings(input);
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
