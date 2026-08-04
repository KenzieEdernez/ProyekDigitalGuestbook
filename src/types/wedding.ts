export interface InvitationCopy {
  engagementTitle: string;
  coverMessage: string;
  openButtonLabel: string;
  displayDate: string;
  eventSectionTitle: string;
  coupleSectionTitle: string;
  coupleSectionSubtitle: string;
  dressCodeTitle: string;
  dressCodeDescription: string;
  dressCodeTheme: string;
  dressCodeNote: string;
  giftTitle: string;
  giftMessage: string;
}

export interface CoupleProfile {
  name: string;
  fullName: string;
  nickname: string;
  father: string;
  mother: string;
  photo: string;
  instagram: string;
}

export interface LoveStoryItem {
  id: string;
  year: string;
  title: string;
  text: string;
}

export interface CeremonyItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  mapUrl: string;
  /** Transparent PNG (or other image) for the event card */
  image?: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  orientation: "portrait" | "landscape";
}

export interface GiftAccount {
  id: string;
  bank: string;
  accountName: string;
  accountNumber: string;
}

export interface GiftAddress {
  name: string;
  address: string;
  city: string;
  phone: string;
}

export type CoupleOrder = "groom-first" | "bride-first";

export interface WeddingSettings {
  groom: CoupleProfile;
  bride: CoupleProfile;
  quote: string;
  quoteSource: string;
  invitationCopy: InvitationCopy;
  loveStory: LoveStoryItem[];
  ceremonies: CeremonyItem[];
  gallery: GalleryImage[];
  gifts: GiftAccount[];
  giftAddress: GiftAddress;
  musicUrl: string;
  /** Logos shown on the closing / ending slide (any count). */
  closingLogos: string[];
  /**
   * White/light hero logo for dark backgrounds (open invitation hero).
   * Separate from couple logo.
   */
  heroLogoImage: string;
  /**
   * Black/dark hero logo for light backgrounds (cover card).
   * Falls back to heroLogoImage if empty.
   */
  heroLogoImageDark: string;
  /** Who appears on the left in the couple section. */
  coupleOrder: CoupleOrder;
}
