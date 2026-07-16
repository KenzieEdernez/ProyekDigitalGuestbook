"use client";

type InvitationHeroBackgroundProps = {
  landscapeSrc: string;
  portraitSrc: string;
  scrollY?: number;
  animateIn?: boolean;
  isExiting?: boolean;
};

export default function InvitationHeroBackground({
  landscapeSrc,
  portraitSrc,
  scrollY = 0,
  animateIn,
  isExiting = false,
}: InvitationHeroBackgroundProps) {
  const landscape = landscapeSrc || portraitSrc;
  const portrait = portraitSrc || landscapeSrc;
  const hasKenBurns = animateIn !== undefined;

  const landscapeTransform = hasKenBurns
    ? animateIn && !isExiting
      ? "scale(1)"
      : "scale(1.12)"
    : `scale(1.05) translateY(${scrollY * 0.25}px)`;

  return (
    <>
      <div
        className="invitation-hero-bg invitation-hero-bg-portrait absolute inset-0 md:hidden"
        style={{ backgroundImage: `url('${portrait}')` }}
      />
      <div
        className={`invitation-hero-bg absolute inset-0 hidden md:block ${
          hasKenBurns
            ? "transition-transform duration-[3s] ease-out-expo"
            : "will-change-transform"
        }`}
        style={{
          backgroundImage: `url('${landscape}')`,
          transform: landscapeTransform,
        }}
      />
    </>
  );
}
