import type { EventSettings } from "@/types/event";

export type HeroImageSettings = Pick<
  EventSettings,
  "heroImage" | "heroImagePortrait" | "heroImageCard"
>;

export function resolveHeroImages(settings: HeroImageSettings) {
  const landscape = settings.heroImage;
  const portrait = settings.heroImagePortrait || landscape;
  const cardUpload = settings.heroImageCard?.trim() || "";

  // Opening card uses the landscape hero, shown fully (no crop) edge-to-edge.
  const card = landscape || cardUpload || portrait;

  return { landscape, portrait, card, cardUpload };
}
