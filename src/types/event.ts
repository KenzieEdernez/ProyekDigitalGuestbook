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
  /** Primary bird video (MP4 with greenscreen). */
  birdImage: string;
  /** Optional legacy / alternate bird video URL. */
  birdImageIos: string;
  /**
   * Transparent PNG frames extracted from the greenscreen MP4.
   * Preferred on all devices (especially iOS) for real alpha.
   */
  birdFrames: string[];
  /** How many flying birds to show on the invitation (1–12). */
  birdCount: number;
}
