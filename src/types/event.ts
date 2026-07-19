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
  /** Lottie bird animation URL (.json) — preferred for iOS transparency. */
  birdImage: string;
  /** Optional legacy bird video URL. */
  birdImageIos: string;
  /** Legacy transparent PNG frames (fallback if no Lottie). */
  birdFrames: string[];
  /** How many flying birds to show on the invitation (1–12). */
  birdCount: number;
}
