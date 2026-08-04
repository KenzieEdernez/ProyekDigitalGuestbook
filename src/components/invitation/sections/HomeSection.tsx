"use client";

import { useEffect, useState } from "react";
import InvitationHeroBackground from "@/components/invitation/InvitationHeroBackground";
import InvitationLogo from "@/components/invitation/InvitationLogo";
import Reveal from "@/components/invitation/Reveal";
import { formatSpacedDisplayDate } from "@/lib/invitation-format";
import { getCoupleDisplayName } from "@/lib/wedding-config";
import type { InvitationCopy, WeddingSettings } from "@/types/wedding";
import type { mergeEventSettings } from "@/lib/event-config";

type EventSettings = ReturnType<typeof mergeEventSettings>;

interface HomeSectionProps {
  event: EventSettings;
  wedding: WeddingSettings;
  copy: InvitationCopy;
  guestName: string | null;
}

export default function HomeSection({
  event,
  wedding,
  copy,
  guestName,
}: HomeSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const spacedDate = formatSpacedDisplayDate(copy.displayDate);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="home" className="invitation-section relative min-h-[100dvh] overflow-hidden">
      <InvitationHeroBackground
        landscapeSrc={event.heroImage}
        portraitSrc={event.heroImagePortrait}
        scrollY={scrollY}
      />
      <div className="invitation-hero-vignette absolute inset-0" />

      <div className="invitation-hero-stage relative z-10 min-h-[100dvh] px-6 text-center text-white sm:px-8">
        {/* Logo + engagement line stay high */}
        <div className="invitation-hero-cluster mx-auto flex w-full max-w-lg flex-col items-center">
          <div className="invitation-hero-copy w-full">
            {wedding.heroLogoImage ? (
              <Reveal direction="blur" duration={900}>
                <div className="invitation-hero-logo-wrap mb-2 flex justify-center bg-transparent sm:mb-4">
                  <InvitationLogo src={wedding.heroLogoImage} size="hero" />
                </div>
              </Reveal>
            ) : null}

            <Reveal direction="up" delay={120} duration={1000}>
              <p className="invitation-hero-kicker mt-1 whitespace-pre-line text-[10px] font-light tracking-[0.28em] text-white/80 sm:mt-4 sm:text-[11px]">
                {copy.engagementTitle}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Name + date sit lower on their own band */}
        <div className="invitation-hero-meta mx-auto w-full max-w-lg">
          <Reveal direction="up" delay={240} duration={1000}>
            <h2 className="invitation-hero-names font-display text-white">
              {getCoupleDisplayName(wedding)}
            </h2>
          </Reveal>

          <Reveal direction="up" delay={360}>
            <p className="invitation-hero-date font-display tracking-[0.38em] text-white/90">
              {spacedDate}
            </p>
          </Reveal>
        </div>

        {/* Dear box pinned to the bottom of the first slide */}
        {guestName ? (
          <Reveal direction="up" delay={460} className="invitation-home-guest-wrap">
            <div className="invitation-home-guest mx-auto w-full max-w-xs rounded-xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Dear,
              </p>
              <p className="mt-1.5 font-display text-xl font-light text-white sm:text-2xl">
                {guestName}
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="invitation-home-guest-spacer" aria-hidden />
        )}
      </div>
    </section>
  );
}
