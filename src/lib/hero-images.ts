export type HeroImageSettings = {
  heroImage: string;
  heroImagePortrait?: string;
};

export function resolveHeroImages(settings: HeroImageSettings) {
  const landscape = settings.heroImage;
  const portrait = settings.heroImagePortrait || landscape;

  return { landscape, portrait };
}
