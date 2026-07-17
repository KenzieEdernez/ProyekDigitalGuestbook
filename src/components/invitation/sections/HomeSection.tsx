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
  const fallbackInitials = `${wedding.groom.name?.[0] ?? "L"}${wedding.bride.name?.[0] ?? "A"}`;

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

      <div className="invitation-hero-stage relative z-10 min-h-[100dvh] px-6 pb-8 pt-14 text-center text-white sm:px-8 sm:pb-10 sm:pt-16">
        <Reveal direction="blur" duration={900}>
          <div className="invitation-hero-logo-wrap flex justify-center">
            <InvitationLogo
              src={event.logoImage}
              fallbackInitials={fallbackInitials}
            />
          </div>
        </Reveal>

        <div className="invitation-hero-copy mx-auto w-full max-w-lg">
          <Reveal direction="up" delay={160} duration={1000}>
            <p className="text-[9px] font-light uppercase tracking-[0.46em] text-white/80 sm:text-[10px]">
              {copy.engagementTitle}
            </p>
          </Reveal>

          <Reveal direction="up" delay={280} duration={1000}>
            <h2 className="invitation-hero-names mt-4 font-display text-white">
              {getCoupleDisplayName(wedding)}
            </h2>
          </Reveal>

          <Reveal direction="up" delay={400}>
            <p className="mt-5 font-display text-[0.95rem] tracking-[0.38em] text-white/90 sm:text-base">
              {spacedDate}
            </p>
          </Reveal>

          {guestName && (
            <Reveal direction="up" delay={500}>
              <p className="mt-5 text-xs font-light text-white/55">
                For{" "}
                <span className="font-display text-lg text-white">{guestName}</span>
              </p>
            </Reveal>
          )}

          <Reveal direction="up" delay={620}>
            <div className="invitation-hero-actions mt-9 w-full">
              <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.3em] text-white/30">
                Countdown to Our Big Day
              </p>
              {eventDetails && (
                <p className="mb-3 text-[11px] text-white/40">
                  {eventDetails.dateLabel} · {eventDetails.time}
                </p>
              )}
              <CountdownTimer
                target={countdownTarget}
                settingsReady={weddingReady}
              />
              <button
                type="button"
                onClick={handleAddToCalendar}
                disabled={!eventDetails}
                className="btn-invite-ghost mt-7 inline-flex w-full max-w-[14rem] items-center justify-center gap-2 border-white/25 px-6 py-2.5 text-[10px] text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Calendar className="h-3.5 w-3.5" />
                Add to Calendar
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
