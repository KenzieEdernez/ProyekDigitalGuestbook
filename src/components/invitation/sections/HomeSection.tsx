"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import CountdownTimer from "@/components/invitation/CountdownTimer";
import FlyingBirds from "@/components/invitation/FlyingBirds";
import InvitationHeroBackground from "@/components/invitation/InvitationHeroBackground";
import InvitationLogo from "@/components/invitation/InvitationLogo";
import Reveal from "@/components/invitation/Reveal";
import { addToCalendar } from "@/lib/calendar-event";
import { resolveCeremonyEventDetails } from "@/lib/ceremony-event";
import { parseEventDateTime } from "@/lib/event-datetime";
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
  weddingReady: boolean;
  showBirds?: boolean;
}

export default function HomeSection({
  event,
  wedding,
  copy,
  guestName,
  weddingReady,
  showBirds = true,
}: HomeSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const eventDetails = useMemo(() => {
    if (!weddingReady) return null;
    return resolveCeremonyEventDetails(wedding);
  }, [weddingReady, wedding.ceremonies]);
  const countdownTarget = useMemo(
    () =>
      eventDetails
        ? parseEventDateTime(eventDetails.date, eventDetails.time)
        : null,
    [eventDetails]
  );
  const spacedDate = formatSpacedDisplayDate(copy.displayDate);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAddToCalendar = () => {
    if (!eventDetails) return;
    addToCalendar(eventDetails);
  };

  return (
    <section id="home" className="invitation-section relative min-h-[100dvh] overflow-hidden">
      <InvitationHeroBackground
        landscapeSrc={event.heroImage}
        portraitSrc={event.heroImagePortrait}
        scrollY={scrollY}
      />
      <div className="invitation-hero-vignette absolute inset-0" />
      {showBirds && <FlyingBirds birdImage={event.birdImage} />}

      <div className="invitation-hero-stage relative z-10 min-h-[100dvh] px-6 pb-10 pt-12 text-center text-white sm:px-8 sm:pb-12 sm:pt-14">
        <Reveal direction="blur" duration={900}>
          <div className="invitation-hero-logo-wrap flex justify-center">
            <InvitationLogo src={event.logoImage} />
          </div>
        </Reveal>

        <div className="invitation-hero-copy mx-auto w-full max-w-md">
          <Reveal direction="up" delay={180} duration={1000}>
            <p className="text-[9px] font-light uppercase tracking-[0.42em] text-white/75 sm:text-[10px]">
              {copy.engagementTitle}
            </p>
          </Reveal>

          <Reveal direction="up" delay={320} duration={1000}>
            <h2 className="invitation-hero-names mt-4 font-display text-white">
              {getCoupleDisplayName(wedding)}
            </h2>
          </Reveal>

          <Reveal direction="up" delay={460}>
            <p className="mt-5 font-display text-sm tracking-[0.32em] text-white/85 sm:text-base">
              {spacedDate}
            </p>
          </Reveal>

          {guestName && (
            <Reveal direction="up" delay={560}>
              <p className="mt-5 text-xs font-light text-white/60">
                For{" "}
                <span className="font-display text-lg text-white">{guestName}</span>
              </p>
            </Reveal>
          )}

          <Reveal direction="up" delay={680}>
            <div className="mt-10 w-full">
              <p className="mb-3 text-[8px] font-semibold uppercase tracking-[0.32em] text-white/35">
                Countdown to Our Big Day
              </p>
              {eventDetails && (
                <p className="mb-3 text-[11px] text-white/45">
                  {eventDetails.dateLabel} · {eventDetails.time}
                </p>
              )}
              <CountdownTimer
                target={countdownTarget}
                settingsReady={weddingReady}
              />
            </div>
          </Reveal>

          <Reveal direction="up" delay={820}>
            <button
              type="button"
              onClick={handleAddToCalendar}
              disabled={!eventDetails}
              className="btn-invite-primary mt-8 inline-flex w-full max-w-xs items-center justify-center gap-2 px-8 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Calendar className="h-4 w-4" />
              Add to Calendar
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
