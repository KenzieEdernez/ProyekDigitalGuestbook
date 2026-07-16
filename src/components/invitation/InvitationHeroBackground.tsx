"use client";

type InvitationHeroBackgroundProps = {
  src: string;
  scrollY?: number;
  animateIn?: boolean;
  isExiting?: boolean;
};

export default function InvitationHeroBackground({
  src,
  scrollY = 0,
  animateIn = true,
  isExiting = false,
}: InvitationHeroBackgroundProps) {
  const isDesktop =
    typeof window !== "undefined" && window.innerWidth >= 768;

  let transform = "translateX(-50%)";

  if (isDesktop && scrollY > 0) {
    transform = `translateX(-50%) translateY(${scrollY * 0.25}px) scale(1.03)`;
  } else if (isDesktop && animateIn && !isExiting) {
    transform = "translateX(-50%) scale(1)";
  } else if (isDesktop && animateIn) {
    transform = "translateX(-50%) scale(1.08)";
  } else if (isDesktop) {
    transform = "translateX(-50%) scale(1.05)";
  }

  return (
    <div className="invitation-hero-frame absolute inset-0 overflow-hidden">
      <img
        src={src}
        alt=""
        aria-hidden
        className="invitation-hero-image pointer-events-none select-none"
        style={{ transform }}
      />
      <div className="invitation-hero-fill absolute inset-0 md:hidden" />
    </div>
  );
}
