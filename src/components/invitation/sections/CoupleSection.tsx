"use client";

import { Instagram } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import LoveStoryTimeline from "@/components/invitation/LoveStoryTimeline";
import type { WeddingSettings } from "@/types/wedding";

interface CoupleSectionProps {
  wedding: WeddingSettings;
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
      <div className="couple-photo-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={person.photo}
          alt={person.fullName}
          className="couple-photo"
        />
      </div>

      <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.32em] text-royal">
        {isGroom ? "The Groom" : "The Bride"}
      </p>
      <h3 className="mt-1.5 font-display text-[1.55rem] font-light leading-tight text-navy sm:text-[1.7rem]">
        {person.fullName}
      </h3>

      <p className="mx-auto mt-3 max-w-[15rem] text-[12px] leading-relaxed text-stone-500">
        <span className="font-medium text-navy/80">
          {isGroom ? "Son of" : "Daughter of"}
        </span>
        <br />
        {person.father}
        <br />
        {person.mother}
      </p>

      <a
        href={`https://instagram.com/${person.instagram.replace("@", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-royal transition-opacity hover:opacity-70"
      >
        <Instagram className="h-3.5 w-3.5" />
        {person.instagram}
      </a>
    </article>
  );
}

export default function CoupleSection({ wedding }: CoupleSectionProps) {
  return (
    <section
      id="couple"
      className="invitation-section invitation-section-pad relative overflow-hidden bg-blush"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-35" />

      <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8">
        <Reveal direction="blur" duration={700}>
          <header className="mb-8 text-center md:mb-10">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-royal" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-royal">
                The Couple
              </p>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-royal" />
            </div>
            <h2 className="mt-3 font-display text-[2rem] font-light text-navy sm:text-[2.35rem]">
              Bride & Groom
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-[13px] font-light leading-relaxed text-stone-500">
              Two hearts united in love, ready to begin a new chapter together.
            </p>
          </header>
        </Reveal>

        <div className="couple-stage">
          <Reveal direction="up" duration={850}>
            <CouplePerson person={wedding.groom} role="groom" />
          </Reveal>

          <div className="couple-ampersand" aria-hidden>
            &
          </div>

          <Reveal direction="up" delay={120} duration={850}>
            <CouplePerson person={wedding.bride} role="bride" />
          </Reveal>
        </div>

        <LoveStoryTimeline loveStory={wedding.loveStory} />
      </div>
    </section>
  );
}
