export interface InvitationCopy {
  engagementTitle: string;
  coverMessage: string;
  openButtonLabel: string;
  displayDate: string;
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
}
