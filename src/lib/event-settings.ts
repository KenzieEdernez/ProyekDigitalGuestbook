import { getPhotoBucket, getSupabaseAdmin } from "./supabase-server";
import {
  formatEventTimeAt,
  parseLegacyTimeValue,
  parseTime12,
  formatTime12,
  stripTimePrefix,
} from "./event-time";
import { isoDateFromLocalDate, localDateFromIso } from "./event-datetime";
import type { EventSettings } from "@/types/event";

function toDateInputValue(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return isoDateFromLocalDate(parsed);
}

function formatDateDisplay(date: string) {
  const parsed = localDateFromIso(date);
  if (!parsed) return "";

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

  let timeFrom = rawFrom ? stripTimePrefix(rawFrom) : "";
  if (!timeFrom && legacyTime) {
    timeFrom = parseLegacyTimeValue(legacyTime);
  }

  const fromParts = parseTime12(timeFrom);
  if (fromParts) {
    timeFrom = formatTime12(fromParts);
  }

  const time = formatEventTimeAt(timeFrom || legacyTime);
  return { timeFrom, time };
}

function buildSettings(input: Partial<EventSettings> & Record<string, unknown>): EventSettings {
  const date = toDateInputValue(textValue(input.date));
  const { timeFrom, time } = resolveTimeFields(input);

  return {
    name: textValue(input.name),
    date,
    dateDisplay: formatDateDisplay(date) || textValue(input.dateDisplay),
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
    heroImagePortrait: textValue(
      input.heroImagePortrait ?? input.hero_image_portrait
    ),
    heroImageCard: textValue(input.heroImageCard ?? input.hero_image_card),
    dressCodeImage: textValue(input.dressCodeImage ?? input.dress_code_image),
  };
}

function mapRowToInput(data: Record<string, unknown>): Partial<EventSettings> {
  return buildSettings(data);
}

function validatePresentationSettings(settings: EventSettings) {
  if (!settings.dressLadies || !settings.dressGentlemen) {
    throw new Error("Dress code for Ladies and Gentlemen is required.");
  }
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
    return buildSettings(data as Partial<EventSettings> & Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function saveEventSettings(
  input: Partial<EventSettings>
): Promise<EventSettings> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("event_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  const merged = {
    ...(existing
      ? mapRowToInput(existing as Record<string, unknown>)
      : {}),
    ...input,
  };
  const settings = buildSettings(merged);
  validatePresentationSettings(settings);
  const heroImage = await saveHeroImage(settings.heroImage);
  const heroImagePortrait = await saveHeroImage(settings.heroImagePortrait);
  const heroImageCard = await saveHeroImage(settings.heroImageCard);
  const dressCodeImage = await saveHeroImage(settings.dressCodeImage);
  const { error } = await supabase.from("event_settings").upsert({
    id: "default",
    name: settings.name,
    date: settings.date,
    time: settings.time,
    time_from: settings.timeFrom,
    location: settings.location,
    address: settings.address,
    dress_ladies: settings.dressLadies,
    dress_gentlemen: settings.dressGentlemen,
    hero_image: heroImage || null,
    hero_image_portrait: heroImagePortrait || null,
    hero_image_card: heroImageCard || null,
    dress_code_image: dressCodeImage || null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  return {
    ...settings,
    heroImage,
    heroImagePortrait,
    heroImageCard,
    dressCodeImage,
  };
}
