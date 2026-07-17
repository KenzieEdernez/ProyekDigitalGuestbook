import type { InvitationCopy, WeddingSettings } from "@/types/wedding";

export const DEFAULT_INVITATION_COPY: InvitationCopy = {
  engagementTitle: "The Sangjit Engagement of",
  coverMessage:
    "With great joy, we invite you to attend and share your blessings on our special day.",
  openButtonLabel: "Open Invitation",
  displayDate: "06.09.2026",
  dressCodeTitle: "Dress Code",
  dressCodeDescription:
    "To support our wedding theme, we kindly request our guests to dress as follows on our special day:",
  dressCodeTheme: "Elegant Formal",
  dressCodeNote: "",
  giftTitle: "Gift",
  giftMessage:
    "Your love, kind wishes and prayer on our wedding day is the greatest gift of all. However, should you wish to send us blessings via online registry, you can conveniently transfer through our bank account.",
};

export const DEFAULT_WEDDING: WeddingSettings = {
  groom: {
    name: "William",
    fullName: "William Alexander",
    nickname: "Will",
    father: "Mr. Robert Anderson",
    mother: "Mrs. Sarah Anderson",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop&crop=face",
    instagram: "@william.a",
  },
  bride: {
    name: "Jessica",
    fullName: "Jessica Marie",
    nickname: "Jess",
    father: "Mr. David Thompson",
    mother: "Mrs. Emily Thompson",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop&crop=face",
    instagram: "@jessica.m",
  },
  quote:
    "And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them.",
  quoteSource: "QS. Ar-Rum: 21",
  invitationCopy: DEFAULT_INVITATION_COPY,
  loveStory: [
    {
      id: "story-1",
      year: "2024",
      title: "Our Beginning",
      text: "Every love story is beautiful, but ours is our favorite. This is where our journey began.",
    },
  ],
  ceremonies: [
    {
      id: "ceremony-1",
      title: "Wedding Ceremony",
      date: "Thursday, 12 December 2025",
      time: "09:00 AM",
      location: "Grand Ballroom",
      address: "Jakarta, Indonesia",
      mapUrl: "https://maps.google.com",
    },
  ],
  gallery: [
    {
      id: "gallery-1",
      src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&auto=format&fit=crop",
      alt: "Prewedding 1",
      orientation: "landscape",
    },
  ],
  gifts: [
    {
      id: "gift-1",
      bank: "BCA",
      accountName: "William Alexander",
      accountNumber: "1234567890",
    },
  ],
  giftAddress: {
    name: "William & Jessica",
    address: "Senayan Residence Apartment, Unit 12B",
    city: "South Jakarta, 12190",
    phone: "+62 812-3456-7890",
  },
  musicUrl: "",
};

/** @deprecated Use DEFAULT_WEDDING or merged settings from API */
export const WEDDING = DEFAULT_WEDDING;

export type InvitationSection =
  | "home"
  | "couple"
  | "event"
  | "dresscode"
  | "gallery"
  | "rsvp"
  | "gift"
  | "wishes";

export const NAV_ITEMS: { id: InvitationSection; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "couple", label: "Couple" },
  { id: "event", label: "Event" },
  { id: "dresscode", label: "Dress Code" },
  { id: "gallery", label: "Gallery" },
  { id: "rsvp", label: "RSVP" },
  { id: "wishes", label: "Wishes" },
  { id: "gift", label: "Gift" },
];

export function getCoupleDisplayName(wedding: WeddingSettings = DEFAULT_WEDDING) {
  return `${wedding.groom.name} & ${wedding.bride.name}`;
}

export function parseGuestName(searchParams: URLSearchParams | null) {
  if (!searchParams) return null;
  const to = searchParams.get("to");
  if (!to) return null;
  return decodeURIComponent(to.replace(/\+/g, " ")).trim() || null;
}

export function mergeWeddingSettings(
  stored: Partial<WeddingSettings> | null | undefined
): WeddingSettings {
  if (!stored) return DEFAULT_WEDDING;

  return {
    groom: { ...DEFAULT_WEDDING.groom, ...stored.groom },
    bride: { ...DEFAULT_WEDDING.bride, ...stored.bride },
    quote: stored.quote?.trim() || DEFAULT_WEDDING.quote,
    quoteSource: stored.quoteSource?.trim() || DEFAULT_WEDDING.quoteSource,
    invitationCopy: {
      ...DEFAULT_WEDDING.invitationCopy,
      ...stored.invitationCopy,
    },
    loveStory:
      stored.loveStory?.length ? stored.loveStory : DEFAULT_WEDDING.loveStory,
    ceremonies:
      stored.ceremonies?.length ? stored.ceremonies : DEFAULT_WEDDING.ceremonies,
    gallery: stored.gallery ?? DEFAULT_WEDDING.gallery,
    gifts: stored.gifts?.length ? stored.gifts : DEFAULT_WEDDING.gifts,
    giftAddress: { ...DEFAULT_WEDDING.giftAddress, ...stored.giftAddress },
    musicUrl:
      stored.musicUrl !== undefined
        ? stored.musicUrl.trim()
        : DEFAULT_WEDDING.musicUrl,
  };
}
