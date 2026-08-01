"use client";

import Reveal from "@/components/invitation/Reveal";
import InvitationLogo from "@/components/invitation/InvitationLogo";
import { formatSpacedDisplayDate } from "@/lib/invitation-format";
import { getCoupleDisplayName } from "@/lib/wedding-config";
import type { InvitationCopy, WeddingSettings } from "@/types/wedding";

interface ClosingSectionProps {
  wedding: WeddingSettings;
  copy: InvitationCopy;
  logoImage?: string;
  organizer?: string;
}

export default function ClosingSection({
  wedding,
  copy,
  logoImage,
  organizer,
}: ClosingSectionProps) {
  const coupleName = getCoupleDisplayName(wedding);
  const initials = `${wedding.groom.name?.[0] ?? "L"}${wedding.bride.name?.[0] ?? "A"}`;
  const spacedDate = formatSpacedDisplayDate(copy.displayDate);

  return (
    <section
      id="closing"
      className="invitation-section relative overflow-hidden bg-navy px-6 py-24 text-center text-white sm:py-28 lg:py-32"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-35" />
      <div className="grain-overlay absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-royal/15 blur-3xl" />

      <div className="relative mx-auto max-w-lg">
        <Reveal direction="blur" duration={800}>
          <div className="mb-8 flex justify-center opacity-90">
            <InvitationLogo src={logoImage} fallbackInitials={initials} />
          </div>
        </Reveal>

        <Reveal direction="up" delay={120} duration={900}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-royal/80">
            With love
          </p>
          <h2 className="mt-4 font-display text-4xl font-light tracking-wide sm:text-5xl">
            {coupleName}
          </h2>
          <div className="mx-auto my-7 h-px w-24 bg-gradient-to-r from-transparent via-royal/60 to-transparent" />
          <p className="font-display text-base tracking-[0.35em] text-white/70">
            {spacedDate}
          </p>
          <p className="mx-auto mt-8 max-w-sm text-sm font-light leading-relaxed text-white/55">
            Thank you for your love, blessings, and presence on our journey
            together. We cannot wait to celebrate with you.
          </p>
          {organizer ? (
            <p className="mt-12 text-[10px] uppercase tracking-[0.3em] text-white/25">
              {organizer}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
