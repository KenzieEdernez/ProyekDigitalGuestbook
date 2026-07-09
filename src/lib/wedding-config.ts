export const WEDDING = {
  groom: {
    name: "William",
    fullName: "William Alexander",
    nickname: "Will",
    father: "Bapak Robert Anderson",
    mother: "Ibu Sarah Anderson",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop&crop=face",
    instagram: "@william.a",
  },
  bride: {
    name: "Jessica",
    fullName: "Jessica Marie",
    nickname: "Jess",
    father: "Bapak David Thompson",
    mother: "Ibu Emily Thompson",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop&crop=face",
    instagram: "@jessica.m",
  },
  quote:
    "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya.",
  quoteSource: "QS. Ar-Rum: 21",
  loveStory: [
    {
      year: "2019",
      title: "Pertemuan Pertama",
      text: "Kami bertemu di sebuah acara kampus. Sebuah percakapan singkat berubah menjadi malam yang tak terlupakan.",
    },
    {
      year: "2021",
      title: "Menjalin Komitmen",
      text: "Setelah melewati jarak dan waktu, kami memutuskan untuk melangkah bersama menuju masa depan.",
    },
    {
      year: "2024",
      title: "Lamaran",
      text: "Di bawah langit senja Paris, William melamar Jessica — dan jawabannya adalah ya.",
    },
    {
      year: "2025",
      title: "Hari Bahagia",
      text: "Kini kami mengundang Anda untuk menjadi bagian dari hari yang paling istimewa dalam hidup kami.",
    },
  ],
  ceremonies: [
    {
      id: "akad",
      title: "Akad Nikah",
      date: "Kamis, 12 Desember 2025",
      time: "09.00 WIB",
      location: "Masjid Al-Ikhlas",
      address: "Jl. Merdeka No. 45, Jakarta Selatan",
      mapUrl: "https://maps.google.com",
    },
    {
      id: "resepsi",
      title: "Resepsi Pernikahan",
      date: "Kamis, 12 Desember 2025",
      time: "11.00 – 14.00 WIB",
      location: "Grand Ballroom Hotel Mulia",
      address: "Jl. Asia Afrika Senayan, Jakarta Pusat",
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
    address: "Apartemen Senayan Residence, Unit 12B",
    city: "Jakarta Selatan, 12190",
    phone: "0812-3456-7890",
  },
  musicUrl: "/music/wedding.mp3",
} as const;

export type InvitationSection =
  | "home"
  | "couple"
  | "event"
  | "gallery"
  | "rsvp"
  | "gift"
  | "wishes";

export const NAV_ITEMS: { id: InvitationSection; label: string }[] = [
  { id: "home", label: "Beranda" },
  { id: "couple", label: "Mempelai" },
  { id: "event", label: "Acara" },
  { id: "gallery", label: "Galeri" },
  { id: "rsvp", label: "RSVP" },
  { id: "gift", label: "Hadiah" },
  { id: "wishes", label: "Ucapan" },
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
