export const EVENT = {
  name: "Gala Excellence 2024",
  tagline:
    "Kehadiran Anda diminta untuk malam penuh keistimewaan dan perayaan.",
  organizer: "Royal Event Management",
  organizerTagline: "Keunggulan dalam setiap detail sejak 1998.",
  supportEmail: "support@royalevents.com",
  date: "Sabtu, 14 Desember 2024",
  time: "19:00 - 00:00",
  location: "The Imperial Grand Hall",
  address: "450 Prestige Blvd, Jakarta",
  dressCode: "Black Tie & Formal",
  dressNote: "Navy & Gold Preferred",
  heroImage:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b8?w=1920&q=80&auto=format&fit=crop",
} as const;

export function formatRegNumber(barcode: string | null): string {
  if (!barcode) return "-";
  return barcode.replace("INV-", "RE-2024-");
}
