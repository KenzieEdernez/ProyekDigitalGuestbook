import type { EventSettings } from "@/types/event";

export type HeroImageSettings = Pick<
  EventSettings,
  "heroImage" | "heroImagePortrait" | "heroImageCard"
>;

export function resolveHeroImages(settings: HeroImageSettings) {
  const landscape = settings.heroImage;
  const portrait = settings.heroImagePortrait || landscape;
  const card = settings.heroImageCard || landscape;

  return { landscape, portrait, card };
}
