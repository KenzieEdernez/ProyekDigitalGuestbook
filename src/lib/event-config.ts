import type { EventSettings } from "@/types/event";

export const EVENT = {
  name: "Gala Excellence 2024",
  tagline:
    "Kehadiran Anda diminta untuk malam penuh keistimewaan dan perayaan.",
  organizer: "EdernDigital",
  organizerTagline: "Digital guestbook dan event system.",
  supportEmail: "support@ederndigital.com",
  date: "Sabtu, 14 Desember 2024",
  time: "19:00 - 00:00",
  location: "The Imperial Grand Hall",
  address: "450 Prestige Blvd, Jakarta",
  dressLadies: "Evening dress",
  dressGentlemen: "Formal suit",
  heroImage:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b8?w=1920&q=80&auto=format&fit=crop",
} as const;

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  name: EVENT.name,
  date: "2024-12-14",
  dateDisplay: EVENT.date,
  time: EVENT.time,
  location: EVENT.location,
  address: EVENT.address,
  dressLadies: EVENT.dressLadies,
  dressGentlemen: EVENT.dressGentlemen,
  heroImage: EVENT.heroImage,
};

export function mergeEventSettings(settings?: Partial<EventSettings>) {
  return {
    ...EVENT,
    ...DEFAULT_EVENT_SETTINGS,
    ...settings,
  };
}

export function formatRegNumber(barcode: string | null): string {
  if (!barcode) return "-";
  return barcode.replace("INV-", "RE-2024-");
}
