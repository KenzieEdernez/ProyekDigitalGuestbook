"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import CountdownTimer from "@/components/invitation/CountdownTimer";
import FlyingBirds from "@/components/invitation/FlyingBirds";
import InvitationHeroBackground from "@/components/invitation/InvitationHeroBackground";
import InvitationMonogram from "@/components/invitation/InvitationMonogram";
import Reveal from "@/components/invitation/Reveal";
import { addToCalendar } from "@/lib/calendar-event";
import { resolveCeremonyEventDetails } from "@/lib/ceremony-event";
import { parseEventDateTime } from "@/lib/event-datetime";
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
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/55 to-navy-900/85" />
      <div className="absolute inset-0 bg-radial-gold opacity-45" />
      {showBirds && <FlyingBirds />}

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center sm:px-8">
        <Reveal direction="blur" duration={900}>
          <InvitationMonogram initials={copy.initials} />
        </Reveal>

        <Reveal direction="up" delay={150} duration={1000}>
          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.45em] text-royal-200">
            {copy.engagementTitle}
          </p>
        </Reveal>

        <Reveal direction="up" delay={280} duration={1000}>
          <h2 className="mt-5 font-display text-4xl font-light leading-[1.1] text-white sm:text-5xl md:text-6xl">
            {getCoupleDisplayName(wedding)}
          </h2>
        </Reveal>

        <Reveal direction="up" delay={420}>
          <p className="mt-6 font-display text-lg tracking-[0.35em] text-white/80 sm:text-xl">
            {copy.displayDate}
          </p>
        </Reveal>

        {guestName && (
          <Reveal direction="up" delay={520}>
            <p className="mt-6 text-sm font-light text-white/65">
              For{" "}
              <span className="font-display text-xl text-white">{guestName}</span>
            </p>
          </Reveal>
        )}

        <Reveal direction="up" delay={650}>
          <div className="mt-12 w-full max-w-2xl">
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.35em] text-white/40">
              Countdown to Our Big Day
            </p>
            {eventDetails && (
              <p className="mb-4 text-xs text-white/55">
                {eventDetails.dateLabel} · {eventDetails.time}
              </p>
            )}
            <CountdownTimer
              target={countdownTarget}
              settingsReady={weddingReady}
            />
          </div>
        </Reveal>

        <Reveal direction="up" delay={780}>
          <button
            type="button"
            onClick={handleAddToCalendar}
            disabled={!eventDetails}
            className="btn-invite-primary mt-10 inline-flex w-full max-w-xs items-center justify-center gap-2 px-8 sm:w-auto sm:max-w-none sm:px-12 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Calendar className="h-4 w-4" />
            Add to Calendar
          </button>
        </Reveal>
      </div>
    </section>
  );
}
