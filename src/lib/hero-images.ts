import type { EventSettings } from "@/types/event";

export type HeroImageSettings = Pick<
  EventSettings,
  "heroImage" | "heroImagePortrait" | "heroImageCard"
>;

export function resolveHeroImages(settings: HeroImageSettings) {
  const landscape = settings.heroImage;
  const portrait = settings.heroImagePortrait || landscape;
  const cardUpload = settings.heroImageCard?.trim() || "";

  // Opening card uses Cover Card Photo (second landscape), falling back to hero landscape.
  const card = cardUpload || landscape || portrait;

  return { landscape, portrait, card, cardUpload };
}
