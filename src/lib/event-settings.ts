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

const MAX_BIRD_LOTTIE_BYTES = 5 * 1024 * 1024;

export type BirdVideoFormat = "main" | "ios";

function assertValidLottieJson(buffer: Buffer) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(buffer.toString("utf8"));
  } catch {
    throw new Error("Bird file must be valid Lottie JSON (.json).");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("layers" in (parsed as Record<string, unknown>))
  ) {
    throw new Error("Invalid Lottie file. Export a bird animation as .json.");
  }

  return parsed as Record<string, unknown>;
}

/** Upload a Lottie bird animation (.json) with transparent background. */
export async function uploadBirdLottieBuffer(buffer: Buffer) {
  if (buffer.length > MAX_BIRD_LOTTIE_BYTES) {
    throw new Error("Lottie bird file must be under 5MB.");
  }

  assertValidLottieJson(buffer);

  const supabase = getSupabaseAdmin();
  const bucket = getPhotoBucket();
  const filename = `event/bird-lottie-${Date.now()}.json`;

  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
    contentType: "application/json",
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

async function saveBirdAsset(value: string, _format: BirdVideoFormat = "main") {
  if (!value) return "";
  if (!value.startsWith("data:")) return value;

  const matches = value.match(
    /^data:(application\/json|text\/plain|video\/[\w.+-]+|image\/\w+);base64,(.+)$/
  );
  if (!matches) {
    throw new Error("Invalid bird media format.");
  }

  const mime = matches[1].toLowerCase();
  const buffer = Buffer.from(matches[2], "base64");

  if (mime.includes("json") || mime.includes("text/plain")) {
    return uploadBirdLottieBuffer(buffer);
  }

  if (mime.startsWith("video/")) {
    throw new Error("Please upload a Lottie .json file (not video).");
  }

  return saveHeroImage(value);
}

export async function uploadBirdFrameBuffer(buffer: Buffer, index: number) {
  if (buffer.length > 2 * 1024 * 1024) {
    throw new Error("Bird frame is too large.");
  }

  const supabase = getSupabaseAdmin();
  const bucket = getPhotoBucket();
  const filename = `event/bird-frame-${Date.now()}-${String(index).padStart(2, "0")}.png`;

  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
    contentType: "image/png",
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

function parseBirdFrames(input: Partial<EventSettings> & Record<string, unknown>) {
  const raw = input.birdFrames ?? input.bird_frames;
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item ?? "").trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item ?? "").trim()).filter(Boolean);
      }
    } catch {
      return [raw.trim()];
    }
  }
  return [];
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
    birdFrames: parseBirdFrames(input),
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
  const birdImage = await saveBirdAsset(settings.birdImage, "main");
  const birdImageIos = await saveBirdAsset(settings.birdImageIos, "ios");
  const birdFrames = settings.birdFrames
    .map((frame) => String(frame ?? "").trim())
    .filter(Boolean);
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
    bird_frames: birdFrames,
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
    birdFrames,
    birdCount: settings.birdCount,
  };
}
