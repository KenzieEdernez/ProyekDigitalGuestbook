import { getPhotoBucket, getSupabaseAdmin } from "./supabase-server";
import {
  formatEventTimeAt,
  parseLegacyTimeValue,
  parseTime12,
  formatTime12,
} from "./event-time";
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

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function textValue(value: unknown) {
  return String(value ?? "").trim();
}

async function saveHeroImage(value: string) {
  if (!value.startsWith("data:image/")) return value;

  const matches = value.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid hero image format.");
  }

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const supabase = getSupabaseAdmin();
  const bucket = getPhotoBucket();
  const filename = `event/hero-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
    contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

function resolveTimeFields(input: Partial<EventSettings> & Record<string, unknown>) {
  const rawFrom = textValue(input.timeFrom ?? input.time_from);
  const legacyTime = textValue(input.time);

  let timeFrom = rawFrom;
  if (!timeFrom && legacyTime) {
    timeFrom = parseLegacyTimeValue(legacyTime);
  }

  const fromParts = parseTime12(timeFrom);
  if (fromParts) {
    timeFrom = formatTime12(fromParts);
  }

  const time = formatEventTimeAt(timeFrom);
  return { timeFrom, time };
}

function sanitizeSettings(input: Partial<EventSettings> & Record<string, unknown>): EventSettings {
  const date = toDateInputValue(textValue(input.date));
  const { timeFrom, time } = resolveTimeFields(input);
  const settings = {
    name: textValue(input.name),
    date,
    dateDisplay: formatDateDisplay(date),
    timeFrom,
    time,
    location: textValue(input.location),
    address: textValue(input.address),
    dressLadies: textValue(
      input.dressLadies ?? input.dress_ladies ?? input.dressCode ?? input.dress_code
    ),
    dressGentlemen: textValue(
      input.dressGentlemen ??
        input.dress_gentlemen ??
        input.dressNote ??
        input.dress_note
    ),
    heroImage: textValue(input.heroImage ?? input.hero_image),
  };

  const requiredFields = [
    settings.name,
    settings.date,
    settings.timeFrom,
    settings.location,
    settings.address,
    settings.dressLadies,
    settings.dressGentlemen,
  ];

  if (requiredFields.some((value) => !value)) {
    throw new Error("Event settings are incomplete.");
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
  const heroImage = await saveHeroImage(settings.heroImage);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("event_settings").upsert({
    id: "default",
    name: settings.name,
    date: settings.date,
    time: settings.time,
    time_from: settings.timeFrom,
    location: settings.location,
    address: settings.address,
    dress_code: settings.dressLadies,
    dress_note: settings.dressGentlemen,
    dress_ladies: settings.dressLadies,
    dress_gentlemen: settings.dressGentlemen,
    hero_image: heroImage || null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  return { ...settings, heroImage };
}
