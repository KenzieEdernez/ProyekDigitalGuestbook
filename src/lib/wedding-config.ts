export const WEDDING = {
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
  loveStory: [
    {
      year: "2019",
      title: "First Meeting",
      text: "We met at a campus event. A brief conversation turned into an unforgettable evening.",
    },
    {
      year: "2021",
      title: "Building Commitment",
      text: "Through distance and time, we chose to walk together toward the future.",
    },
    {
      year: "2024",
      title: "The Proposal",
      text: "Beneath the Paris sunset, William proposed to Jessica — and she said yes.",
    },
    {
      year: "2025",
      title: "Our Big Day",
      text: "Now we invite you to be part of the most special day of our lives.",
    },
  ],
  ceremonies: [
    {
      id: "akad",
      title: "Holy Matrimony",
      date: "Thursday, December 12, 2025",
      time: "09:00 AM",
      location: "Al-Ikhlas Mosque",
      address: "45 Merdeka Street, South Jakarta",
      mapUrl: "https://maps.google.com",
    },
    {
      id: "resepsi",
      title: "Wedding Reception",
      date: "Thursday, December 12, 2025",
      time: "11:00 AM – 02:00 PM",
      location: "Grand Ballroom, Hotel Mulia",
      address: "Asia Afrika Senayan, Central Jakarta",
      mapUrl: "https://maps.google.com",
    },
  ],
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&auto=format&fit=crop",
      alt: "Prewedding 1",
    },
    {
      src: "https://images.unsplash.com/photo-1522673606300-8d9631af15b2?w=800&q=80&auto=format&fit=crop",
      alt: "Prewedding 2",
    },
    {
      src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80&auto=format&fit=crop",
      alt: "Prewedding 3",
    },
    {
      src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80&auto=format&fit=crop",
      alt: "Prewedding 4",
    },
    {
      src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80&auto=format&fit=crop",
      alt: "Prewedding 5",
    },
    {
      src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80&auto=format&fit=crop",
      alt: "Prewedding 6",
    },
  ],
  gifts: [
    {
      bank: "BCA",
      accountName: "William Alexander",
      accountNumber: "1234567890",
    },
    {
      bank: "Mandiri",
      accountName: "Jessica Marie",
      accountNumber: "0987654321",
    },
  ],
  giftAddress: {
    name: "William & Jessica",
    address: "Senayan Residence Apartment, Unit 12B",
    city: "South Jakarta, 12190",
    phone: "+62 812-3456-7890",
  },
  musicUrl: "/music/wedding.mp3",
} as const;

export type InvitationSection =
  | "home"
  | "couple"
  | "event"
  | "gallery"
  | "rsvp"
  | "gift";

export const NAV_ITEMS: { id: InvitationSection; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "couple", label: "Couple" },
  { id: "event", label: "Event" },
  { id: "gallery", label: "Gallery" },
  { id: "rsvp", label: "RSVP & Wishes" },
  { id: "gift", label: "Gift" },
];

export function getCoupleDisplayName() {
  return `${WEDDING.groom.name} & ${WEDDING.bride.name}`;
}

export function parseGuestName(searchParams: URLSearchParams | null) {
  if (!searchParams) return null;
  const to = searchParams.get("to");
  if (!to) return null;
  return decodeURIComponent(to.replace(/\+/g, " ")).trim() || null;
}
