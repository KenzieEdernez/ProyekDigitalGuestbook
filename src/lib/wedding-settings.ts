import { getPhotoBucket, getSupabaseAdmin } from "./supabase-server";
import { formatEventTimeAt, stripTimePrefix } from "./event-time";
import { DEFAULT_WEDDING, mergeWeddingSettings } from "./wedding-config";
import type {
  CeremonyItem,
  CoupleProfile,
  GalleryImage,
  GiftAccount,
  InvitationCopy,
  LoveStoryItem,
  WeddingSettings,
} from "@/types/wedding";
import { v4 as uuidv4 } from "uuid";

function textValue(value: unknown) {
  return String(value ?? "").trim();
}

/** Keep internal line breaks from admin textareas; only trim outer edges. */
function multilineValue(value: unknown) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/^\n+|\n+$/g, "")
    .trimEnd();
}

async function saveImage(value: string, folder: string) {
  if (!value.startsWith("data:image/")) return value;

  const matches = value.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format.");

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const supabase = getSupabaseAdmin();
  const bucket = getPhotoBucket();
  const filename = `wedding/${folder}/${Date.now()}-${uuidv4().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
    contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

const MAX_MUSIC_BYTES = 12 * 1024 * 1024;

function musicExtensionFromMime(mimeType: string) {
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  return "mp3";
}

async function saveMusic(value: string) {
  const trimmed = textValue(value);
  if (!trimmed) return "";
  if (!trimmed.startsWith("data:")) return trimmed;

  const matches = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid audio format.");

  const mimeType = matches[1].toLowerCase();
  if (
    !mimeType.startsWith("audio/") &&
    mimeType !== "application/octet-stream"
  ) {
    throw new Error("Please upload an MP3 or other supported audio file.");
  }

  const buffer = Buffer.from(matches[2], "base64");
  return uploadMusicBuffer(buffer, mimeType);
}

export async function uploadMusicBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (buffer.length > MAX_MUSIC_BYTES) {
    throw new Error("Music file must be under 12MB.");
  }

  const supabase = getSupabaseAdmin();
  const bucket = getPhotoBucket();
  const normalizedMime = mimeType.toLowerCase();
  const ext = musicExtensionFromMime(normalizedMime);
  const filename = `wedding/music/${Date.now()}-${uuidv4().slice(0, 8)}.${ext}`;
  const contentType = normalizedMime.startsWith("audio/")
    ? normalizedMime
    : "audio/mpeg";

  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

function sanitizeCouple(input: Partial<CoupleProfile>, fallback: CoupleProfile): CoupleProfile {
  return {
    name: textValue(input.name) || fallback.name,
    fullName: textValue(input.fullName) || fallback.fullName,
    nickname: textValue(input.nickname) || fallback.nickname,
    father: textValue(input.father) || fallback.father,
    mother: textValue(input.mother) || fallback.mother,
    photo: textValue(input.photo) || fallback.photo,
    instagram: textValue(input.instagram) || fallback.instagram,
  };
}

function sanitizeLoveStory(items: LoveStoryItem[] | undefined): LoveStoryItem[] {
  if (!items?.length) return [];
  return items
    .map((item) => ({
      id: textValue(item.id) || uuidv4(),
      year: textValue(item.year),
      title: textValue(item.title),
      text: textValue(item.text),
    }))
    .filter((item) => item.title && item.text);
}

function sanitizeCeremonies(items: CeremonyItem[] | undefined): CeremonyItem[] {
  if (!items?.length) return DEFAULT_WEDDING.ceremonies;
  return items
    .map((item) => ({
      id: textValue(item.id) || uuidv4(),
      title: textValue(item.title),
      date: textValue(item.date),
      time: textValue(item.time)
        ? formatEventTimeAt(stripTimePrefix(textValue(item.time)))
        : "",
      location: multilineValue(item.location),
      address: multilineValue(item.address),
      mapUrl: textValue(item.mapUrl) || "https://maps.google.com",
      image: textValue(item.image),
    }))
    .filter((item) => item.title);
}

function sanitizeGallery(items: GalleryImage[] | undefined): GalleryImage[] {
  if (!items?.length) return [];
  return items
    .map((item) => ({
      id: textValue(item.id) || uuidv4(),
      src: textValue(item.src),
      alt: textValue(item.alt) || "Prewedding photo",
      orientation:
        item.orientation === "portrait"
          ? ("portrait" as const)
          : ("landscape" as const),
    }))
    .filter((item) => item.src);
}

function sanitizeGifts(items: GiftAccount[] | undefined): GiftAccount[] {
  if (!items?.length) return DEFAULT_WEDDING.gifts;
  return items
    .map((item) => ({
      id: textValue(item.id) || uuidv4(),
      bank: textValue(item.bank),
      accountName: textValue(item.accountName),
      accountNumber: textValue(item.accountNumber),
    }))
    .filter((item) => item.bank && item.accountNumber);
}

function sanitizeInvitationCopy(
  input: Partial<InvitationCopy> | undefined
): InvitationCopy {
  const fallback = DEFAULT_WEDDING.invitationCopy;
  return {
    engagementTitle:
      multilineValue(input?.engagementTitle) || fallback.engagementTitle,
    coverMessage: multilineValue(input?.coverMessage) || fallback.coverMessage,
    openButtonLabel: textValue(input?.openButtonLabel) || fallback.openButtonLabel,
    displayDate: textValue(input?.displayDate) || fallback.displayDate,
    eventSectionTitle:
      textValue(input?.eventSectionTitle) || fallback.eventSectionTitle,
    coupleSectionTitle:
      multilineValue(input?.coupleSectionTitle) || fallback.coupleSectionTitle,
    coupleSectionSubtitle: multilineValue(input?.coupleSectionSubtitle),
    dressCodeTitle: textValue(input?.dressCodeTitle) || fallback.dressCodeTitle,
    dressCodeDescription:
      multilineValue(input?.dressCodeDescription) ||
      fallback.dressCodeDescription,
    dressCodeTheme: textValue(input?.dressCodeTheme) || fallback.dressCodeTheme,
    dressCodeNote: textValue(input?.dressCodeNote) || fallback.dressCodeNote,
    giftTitle: textValue(input?.giftTitle) || fallback.giftTitle,
    giftMessage: multilineValue(input?.giftMessage) || fallback.giftMessage,
    rsvpReminderEyebrow:
      textValue(input?.rsvpReminderEyebrow) || fallback.rsvpReminderEyebrow,
    rsvpReminderTitle:
      multilineValue(input?.rsvpReminderTitle) || fallback.rsvpReminderTitle,
    rsvpReminderMessage:
      multilineValue(input?.rsvpReminderMessage) ||
      fallback.rsvpReminderMessage,
  };
}

function sanitizeSettings(input: Partial<WeddingSettings>): WeddingSettings {
  const settings: WeddingSettings = {
    groom: sanitizeCouple(input.groom ?? {}, DEFAULT_WEDDING.groom),
    bride: sanitizeCouple(input.bride ?? {}, DEFAULT_WEDDING.bride),
    quote: multilineValue(input.quote),
    quoteSource: textValue(input.quoteSource),
    invitationCopy: sanitizeInvitationCopy(input.invitationCopy),
    loveStory: sanitizeLoveStory(input.loveStory),
    ceremonies: sanitizeCeremonies(input.ceremonies),
    gallery: sanitizeGallery(input.gallery),
    gifts: sanitizeGifts(input.gifts),
    giftAddress: {
      name: textValue(input.giftAddress?.name) || DEFAULT_WEDDING.giftAddress.name,
      address:
        textValue(input.giftAddress?.address) || DEFAULT_WEDDING.giftAddress.address,
      city: textValue(input.giftAddress?.city) || DEFAULT_WEDDING.giftAddress.city,
      phone: textValue(input.giftAddress?.phone) || DEFAULT_WEDDING.giftAddress.phone,
    },
    musicUrl: textValue(input.musicUrl) || DEFAULT_WEDDING.musicUrl,
    closingLogos: Array.isArray(input.closingLogos)
      ? input.closingLogos.map((url) => textValue(url)).filter(Boolean)
      : [],
    heroLogoImage: textValue(input.heroLogoImage),
    heroLogoImageDark: textValue(input.heroLogoImageDark),
    coupleOrder:
      input.coupleOrder === "bride-first" ? "bride-first" : "groom-first",
  };

  if (!settings.ceremonies.length) {
    throw new Error("At least one wedding event is required.");
  }

  return settings;
}

async function persistMedia(settings: WeddingSettings): Promise<WeddingSettings> {
  const groomPhoto = await saveImage(settings.groom.photo, "couple");
  const bridePhoto = await saveImage(settings.bride.photo, "couple");
  const gallery = await Promise.all(
    settings.gallery.map(async (item) => ({
      ...item,
      src: await saveImage(item.src, "gallery"),
    }))
  );
  const ceremonies = await Promise.all(
    settings.ceremonies.map(async (item) => ({
      ...item,
      image: item.image ? await saveImage(item.image, "ceremony") : "",
    }))
  );
  const closingLogos = await Promise.all(
    settings.closingLogos.map((url) => saveImage(url, "closing-logo"))
  );
  const heroLogoImage = settings.heroLogoImage
    ? await saveImage(settings.heroLogoImage, "hero-logo")
    : "";
  const heroLogoImageDark = settings.heroLogoImageDark
    ? await saveImage(settings.heroLogoImageDark, "hero-logo-dark")
    : "";
  const musicUrl = await saveMusic(settings.musicUrl);

  return {
    ...settings,
    groom: { ...settings.groom, photo: groomPhoto },
    bride: { ...settings.bride, photo: bridePhoto },
    gallery,
    ceremonies,
    closingLogos,
    heroLogoImage,
    heroLogoImageDark,
    musicUrl,
  };
}

export async function getWeddingSettings(): Promise<WeddingSettings> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_settings")
      .select("wedding_content")
      .eq("id", "default")
      .maybeSingle();

    if (error) throw error;
    return mergeWeddingSettings(
      (data?.wedding_content as Partial<WeddingSettings> | null) ?? null
    );
  } catch {
    return DEFAULT_WEDDING;
  }
}

function parseSupabaseStoragePath(url: string) {
  const publicMatch = url.match(
    /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
  );
  if (publicMatch) {
    return {
      bucket: publicMatch[1],
      path: decodeURIComponent(publicMatch[2]),
    };
  }

  const signedMatch = url.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+?)\?/);
  if (signedMatch) {
    return {
      bucket: signedMatch[1],
      path: decodeURIComponent(signedMatch[2]),
    };
  }

  return null;
}

export async function getMusicPlaybackUrl(): Promise<string | null> {
  const settings = await getWeddingSettings();
  const raw = textValue(settings.musicUrl);
  if (!raw || raw.startsWith("data:")) return null;
  if (raw.startsWith("/")) return raw;

  const storagePath = parseSupabaseStoragePath(raw);
  if (!storagePath) return raw;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(storagePath.bucket)
      .createSignedUrl(storagePath.path, 60 * 60 * 24 * 7);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  } catch {
    // fall through to raw public URL
  }

  return raw;
}

export function hasConfiguredMusic(settings: WeddingSettings) {
  const raw = textValue(settings.musicUrl);
  return Boolean(raw && !raw.startsWith("data:"));
}

export async function saveWeddingSettings(
  input: Partial<WeddingSettings>
): Promise<WeddingSettings> {
  const settings = sanitizeSettings(input);
  const withMedia = await persistMedia(settings);
  const supabase = getSupabaseAdmin();

  const { data: existing, error: readError } = await supabase
    .from("event_settings")
    .select("id")
    .eq("id", "default")
    .maybeSingle();

  if (readError) throw new Error(readError.message);

  if (!existing) {
    throw new Error(
      "Save event settings first before editing wedding content."
    );
  }

  const { error } = await supabase
    .from("event_settings")
    .update({
      wedding_content: withMedia,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");

  if (error) throw new Error(error.message);
  return withMedia;
}
