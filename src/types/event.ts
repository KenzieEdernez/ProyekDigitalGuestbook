export interface EventSettings {
  name: string;
  date: string;
  dateDisplay: string;
  timeFrom: string;
  time: string;
  location: string;
  address: string;
  dressLadies: string;
  dressGentlemen: string;
  heroImage: string;
  heroImagePortrait: string;
  heroImageCard: string;
  dressCodeImage: string;
  logoImage: string;
  birdImage: string;
  /** HEVC-with-alpha .mov/.mp4 for iOS/Safari transparency. */
  birdImageIos: string;
  /** How many flying birds to show on the invitation (1–12). */
  birdCount: number;
}
