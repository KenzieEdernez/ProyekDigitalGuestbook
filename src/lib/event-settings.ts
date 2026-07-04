import { getSupabaseAdmin } from "./supabase-server";
import type { EventSettings } from "@/types/event";

function toDateInputValue(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function formatDateDisplay(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function textValue(value: unknown) {
  return String(value ?? "").trim();
}

function sanitizeSettings(input: Partial<EventSettings> & Record<string, unknown>): EventSettings {
  const date = toDateInputValue(textValue(input.date));
  const settings = {
    name: textValue(input.name),
    date,
    dateDisplay: formatDateDisplay(date),
    time: textValue(input.time),
    location: textValue(input.location),
    address: textValue(input.address),
    dressCode: textValue(input.dressCode ?? input.dress_code),
    dressNote: textValue(input.dressNote ?? input.dress_note),
  };

  const requiredFields = [
    settings.name,
    settings.date,
    settings.time,
    settings.location,
    settings.address,
    settings.dressCode,
  ];

  if (requiredFields.some((value) => !value)) {
    throw new Error("Pengaturan event belum lengkap.");
  }

  return settings;
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
