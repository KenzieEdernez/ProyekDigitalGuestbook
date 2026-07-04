import { DEFAULT_EVENT_SETTINGS } from "./event-config";
import { getSupabaseAdmin } from "./supabase-server";
import type { EventSettings } from "@/types/event";

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

function sanitizeSettings(input: Partial<EventSettings> & Record<string, unknown>): EventSettings {
  const date = toDateInputValue(String(input.date ?? DEFAULT_EVENT_SETTINGS.date));

  return {
    name: String(input.name ?? DEFAULT_EVENT_SETTINGS.name).trim(),
    date,
    dateDisplay: formatDateDisplay(date),
    time: String(input.time ?? DEFAULT_EVENT_SETTINGS.time).trim(),
    location: String(input.location ?? DEFAULT_EVENT_SETTINGS.location).trim(),
    address: String(input.address ?? DEFAULT_EVENT_SETTINGS.address).trim(),
    dressCode: String(
      input.dressCode ?? input.dress_code ?? DEFAULT_EVENT_SETTINGS.dressCode
    ).trim(),
    dressNote: String(
      input.dressNote ?? input.dress_note ?? DEFAULT_EVENT_SETTINGS.dressNote
    ).trim(),
  };
}

export async function getEventSettings(): Promise<EventSettings | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return sanitizeSettings(data as Partial<EventSettings> & Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function saveEventSettings(
  input: Partial<EventSettings>
): Promise<EventSettings> {
  const settings = sanitizeSettings(input);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("event_settings").upsert({
    id: "default",
    name: settings.name,
    date: settings.date,
    time: settings.time,
    location: settings.location,
    address: settings.address,
    dress_code: settings.dressCode,
    dress_note: settings.dressNote,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  return settings;
}
