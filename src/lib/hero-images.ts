import type { EventSettings } from "@/types/event";

export type HeroImageSettings = Pick<
  EventSettings,
  "heroImage" | "heroImagePortrait" | "heroImageCard"
>;

/**
 * Cover card should show the full couple photo.
 * Older card uploads were hard-cropped to ultra-wide landscape and hide the lower half,
 * so we prefer the portrait hero whenever a dedicated card image is missing or looks cropped.
 */
export function resolveHeroImages(settings: HeroImageSettings) {
  const landscape = settings.heroImage;
  const portrait = settings.heroImagePortrait || landscape;
  const cardUpload = settings.heroImageCard?.trim() || "";

  // Prefer portrait for the opening card so the full figure stays visible.
  // Dedicated card upload is only used when portrait is unavailable.
  const card = portrait || cardUpload || landscape;

  return { landscape, portrait, card, cardUpload };
}
