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

function clampBirdCount(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 6;
  return Math.min(12, Math.max(1, Math.round(parsed)));
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

const MAX_BIRD_WEBM_BYTES = 8 * 1024 * 1024;
const MAX_BIRD_IOS_BYTES = 25 * 1024 * 1024;

export type BirdVideoFormat = "webm" | "ios";

/** Upload a looping bird clip (WebM alpha or HEVC/MOV alpha) to public storage. */
export async function uploadBirdVideoBuffer(
  buffer: Buffer,
  mimeType = "video/webm",
  format: BirdVideoFormat = "webm"
) {
  const maxBytes = format === "ios" ? MAX_BIRD_IOS_BYTES : MAX_BIRD_WEBM_BYTES;
  if (buffer.length > maxBytes) {
    throw new Error(
      format === "ios"
        ? "iOS bird video must be under 25MB."
        : "Bird video must be under 8MB."
    );
  }

  const supabase = getSupabaseAdmin();
  const bucket = getPhotoBucket();
  const mime = mimeType.toLowerCase();
  const ext =
    format === "ios"
      ? mime.includes("mp4") || mime.includes("m4v")
        ? "mp4"
        : "mov"
      : "webm";
  const filename = `event/bird-${format}-${Date.now()}.${ext}`;
  const contentType =
    format === "ios"
      ? ext === "mp4"
        ? "video/mp4"
        : "video/quicktime"
      : "video/webm";

  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

async function saveBirdAsset(value: string, format: BirdVideoFormat = "webm") {
  if (!value) return "";
  if (!value.startsWith("data:")) return value;

  const matches = value.match(/^data:(video\/[\w.+-]+|image\/\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid bird media format.");
  }

  const mime = matches[1].toLowerCase();
  const buffer = Buffer.from(matches[2], "base64");

  if (mime.startsWith("video/")) {
    return uploadBirdVideoBuffer(buffer, mime, format);
  }

  return saveHeroImage(value);
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
    logoImage: textValue(input.logoImage ?? input.logo_image),
    birdImage: textValue(input.birdImage ?? input.bird_image),
    birdImageIos: textValue(input.birdImageIos ?? input.bird_image_ios),
    birdCount: clampBirdCount(input.birdCount ?? input.bird_count ?? 6),
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
  const logoImage = await saveHeroImage(settings.logoImage);
  const birdImage = await saveBirdAsset(settings.birdImage, "webm");
  const birdImageIos = await saveBirdAsset(settings.birdImageIos, "ios");
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
    logo_image: logoImage || null,
    bird_image: birdImage || null,
    bird_image_ios: birdImageIos || null,
    bird_count: settings.birdCount,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  return {
    ...settings,
    heroImage,
    heroImagePortrait,
    heroImageCard,
    dressCodeImage,
    logoImage,
    birdImage,
    birdImageIos,
    birdCount: settings.birdCount,
  };
}
