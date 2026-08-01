"use client";

import { Instagram } from "lucide-react";
import CouplePhoto from "@/components/invitation/CouplePhoto";
import InvitationLogo from "@/components/invitation/InvitationLogo";
import Reveal from "@/components/invitation/Reveal";
import type { WeddingSettings } from "@/types/wedding";

interface CoupleSectionProps {
  wedding: WeddingSettings;
  logoImage?: string;
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

export default function CoupleSection({ wedding, logoImage }: CoupleSectionProps) {
  const initials = `${wedding.groom.name?.[0] ?? "L"}${wedding.bride.name?.[0] ?? "A"}`;

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
            <p className="couple-kicker">The Couple</p>
            <div className="couple-logo-wrap">
              <InvitationLogo
                src={logoImage}
                fallbackInitials={initials}
                size="couple"
              />
            </div>
            <h2 className="couple-title">Bride & Groom</h2>
            <p className="couple-subtitle">
              Two hearts united in love, ready to begin a new chapter together.
            </p>
          </header>
        </Reveal>

        <div className="couple-stage">
          <Reveal direction="up" duration={900}>
            <CouplePerson person={wedding.groom} role="groom" />
          </Reveal>

          <div className="couple-ampersand" aria-hidden>
            <span>&</span>
          </div>

          <Reveal direction="up" delay={140} duration={900}>
            <CouplePerson person={wedding.bride} role="bride" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
