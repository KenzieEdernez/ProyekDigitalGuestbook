"use client";

import { useMemo } from "react";
import { Calendar, Instagram } from "lucide-react";
import CouplePhoto from "@/components/invitation/CouplePhoto";
import CountdownTimer from "@/components/invitation/CountdownTimer";
import InvitationLogo from "@/components/invitation/InvitationLogo";
import Reveal from "@/components/invitation/Reveal";
import { addToCalendar } from "@/lib/calendar-event";
import { resolveCeremonyEventDetails } from "@/lib/ceremony-event";
import { parseEventDateTime } from "@/lib/event-datetime";
import type { WeddingSettings } from "@/types/wedding";

interface CoupleSectionProps {
  wedding: WeddingSettings;
  logoImage?: string;
  weddingReady?: boolean;
}

function CouplePerson({
  person,
  role,
}: {
  person: WeddingSettings["groom"];
  role: "groom" | "bride";
}) {
  const isGroom = role === "groom";

  return (
    <article className="couple-person">
      <CouplePhoto src={person.photo} alt={person.fullName} />

      <p className="couple-role">{isGroom ? "The Groom" : "The Bride"}</p>
      <h3 className="couple-name">{person.fullName}</h3>

      <div className="couple-divider" aria-hidden />

      <p className="couple-parents">
        <span>{isGroom ? "Son of" : "Daughter of"}</span>
        {person.father}
        <br />
        {person.mother}
      </p>

      <a
        href={`https://instagram.com/${person.instagram.replace("@", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="couple-ig"
      >
        <Instagram className="h-3.5 w-3.5" />
        {person.instagram}
      </a>
    </article>
  );
}

export default function CoupleSection({
  wedding,
  logoImage,
  weddingReady = true,
}: CoupleSectionProps) {
  const initials = `${wedding.groom.name?.[0] ?? "L"}${wedding.bride.name?.[0] ?? "A"}`;
  const brideFirst = wedding.coupleOrder === "bride-first";
  const left = brideFirst
    ? { person: wedding.bride, role: "bride" as const }
    : { person: wedding.groom, role: "groom" as const };
  const right = brideFirst
    ? { person: wedding.groom, role: "groom" as const }
    : { person: wedding.bride, role: "bride" as const };

  const eventDetails = useMemo(() => {
    if (!weddingReady) return null;
    return resolveCeremonyEventDetails(wedding);
  }, [weddingReady, wedding]);

  const countdownTarget = useMemo(
    () =>
      eventDetails
        ? parseEventDateTime(eventDetails.date, eventDetails.time)
        : null,
    [eventDetails]
  );

  const handleAddToCalendar = () => {
    if (!eventDetails) return;
    addToCalendar(eventDetails);
  };

  return (
    <section
      id="couple"
      className="invitation-section invitation-section-pad couple-section relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-40" />
      <div className="pointer-events-none absolute left-[12%] top-24 h-56 w-56 rounded-full bg-royal/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-[10%] h-64 w-64 rounded-full bg-navy/5 blur-3xl" />

      <div className="relative mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal direction="blur" duration={700}>
          <header className="couple-header">
            <div className="couple-logo-wrap">
              <InvitationLogo
                src={logoImage}
                fallbackInitials={initials}
                size="couple"
              />
            </div>
            {wedding.invitationCopy.coupleSectionTitle?.trim() ? (
              <h2 className="couple-title whitespace-pre-line">
                {wedding.invitationCopy.coupleSectionTitle}
              </h2>
            ) : null}
            {wedding.invitationCopy.coupleSectionSubtitle?.trim() ? (
              <p className="couple-subtitle whitespace-pre-line">
                {wedding.invitationCopy.coupleSectionSubtitle}
              </p>
            ) : null}
          </header>
        </Reveal>

        <div className="couple-stage">
          <Reveal direction="up" duration={900}>
            <CouplePerson person={left.person} role={left.role} />
          </Reveal>

          <div className="couple-ampersand" aria-hidden>
            <span>&</span>
          </div>

          <Reveal direction="up" delay={140} duration={900}>
            <CouplePerson person={right.person} role={right.role} />
          </Reveal>
        </div>

        <Reveal direction="up" delay={200} duration={900}>
          <div className="couple-countdown mt-12 sm:mt-14">
            {wedding.quote?.trim() ? (
              <div className="mx-auto mb-8 max-w-xl text-center">
                <p className="whitespace-pre-line font-display text-base font-light leading-relaxed text-navy sm:text-lg">
                  {wedding.quote}
                </p>
              </div>
            ) : null}

            <p className="mb-2 text-center text-[8px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              Countdown to Our Big Day
            </p>
            {eventDetails && (
              <p className="mb-3 text-center text-[11px] text-stone-400">
                {eventDetails.dateLabel} · {eventDetails.time}
              </p>
            )}
            <CountdownTimer
              target={countdownTarget}
              settingsReady={weddingReady}
              variant="light"
            />
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleAddToCalendar}
                disabled={!eventDetails}
                className="btn-invite-ghost inline-flex w-full max-w-[14rem] items-center justify-center gap-2 border-navy/20 px-6 py-2.5 text-[10px] text-navy disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Calendar className="h-3.5 w-3.5" />
                Add to Calendar
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
