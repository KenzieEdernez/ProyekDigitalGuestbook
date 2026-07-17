import type { EventSettings } from "@/types/event";
import { formatEventTimeAt } from "@/lib/event-time";

export const EVENT = {
  name: "Gala Excellence 2024",
  organizer: "EdernDigital",
  organizerTagline: "Digital guestbook and event system.",
  supportEmail: "support@ederndigital.com",
  date: "Saturday, 14 December 2024",
  timeFrom: "7:00 PM",
  time: formatEventTimeAt("7:00 PM"),
  location: "The Imperial Grand Hall",
  address: "450 Prestige Blvd, Jakarta",
  dressLadies: "Evening dress",
  dressGentlemen: "Formal suit",
  heroImage:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b8?w=1920&q=80&auto=format&fit=crop",
  heroImagePortrait:
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1080&q=80&auto=format&fit=crop",
  heroImageCard:
    "https://images.unsplash.com/photo-1465495976277-8127bfd548f7?w=1200&q=80&auto=format&fit=crop",
} as const;

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  name: EVENT.name,
  date: "2024-12-14",
  dateDisplay: EVENT.date,
  timeFrom: EVENT.timeFrom,
  time: EVENT.time,
  location: EVENT.location,
  address: EVENT.address,
  dressLadies: EVENT.dressLadies,
  dressGentlemen: EVENT.dressGentlemen,
  heroImage: EVENT.heroImage,
  heroImagePortrait: EVENT.heroImagePortrait,
  heroImageCard: EVENT.heroImageCard,
  dressCodeImage: "",
  logoImage: "",
  birdImage: "",
};

export function mergeEventSettings(settings?: Partial<EventSettings>) {
  const merged = {
    ...EVENT,
    ...DEFAULT_EVENT_SETTINGS,
    ...settings,
  };

  const normalizedTime = formatEventTimeAt(merged.timeFrom || merged.time);

  return {
    ...merged,
    timeFrom: normalizedTime || merged.timeFrom,
    time: normalizedTime,
  };
}

export function formatRegNumber(barcode: string | null): string {
  if (!barcode) return "-";
  return barcode.replace("INV-", "RE-2024-");
}
