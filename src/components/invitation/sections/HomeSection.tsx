"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import CountdownTimer from "@/components/invitation/CountdownTimer";
import Reveal from "@/components/invitation/Reveal";
import { getCoupleDisplayName } from "@/lib/wedding-config";
import type { WeddingSettings } from "@/types/wedding";
import type { mergeEventSettings } from "@/lib/event-config";

type EventSettings = ReturnType<typeof mergeEventSettings>;

interface HomeSectionProps {
  event: EventSettings;
  wedding: WeddingSettings;
  guestName: string | null;
  onNavigateRsvp: () => void;
}

export default function HomeSection({
  event,
  wedding,
  guestName,
  onNavigateRsvp,
}: HomeSectionProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="home" className="invitation-section relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url('${event.heroImage}')`,
          transform: `scale(1.05) translateY(${scrollY * 0.25}px)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/75 via-navy-900/35 to-champagne" />
      <div className="absolute inset-0 bg-radial-gold opacity-60" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-28 text-center lg:max-w-6xl lg:px-10 lg:py-32">
        <Reveal direction="blur" duration={900}>
          <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-royal-200">
            Wedding Invitation
          </p>
        </Reveal>

        <Reveal direction="up" delay={150} duration={1000}>
          <h2 className="mt-5 font-display text-5xl font-light leading-[1.1] text-white md:text-7xl">
            {getCoupleDisplayName(wedding)}
          </h2>
        </Reveal>

        <Reveal direction="scale" delay={300}>
          <div className="my-8 flex items-center gap-5">
            <span className="h-px w-20 bg-gradient-to-r from-transparent to-royal/60" />
            <Heart className="h-4 w-4 fill-royal/80 text-royal animate-pulse-soft" />
            <span className="h-px w-20 bg-gradient-to-l from-transparent to-royal/60" />
          </div>
        </Reveal>

        {guestName && (
          <Reveal direction="up" delay={400}>
            <p className="text-sm font-light text-white/70">
              For{" "}
              <span className="font-display text-xl text-white">
                {guestName}
              </span>
            </p>
          </Reveal>
        )}

        <Reveal direction="up" delay={500}>
          <blockquote className="mt-8 max-w-md">
            <p className="text-sm font-light italic leading-relaxed text-white/60">
              &ldquo;{wedding.quote}&rdquo;
            </p>
            <cite className="mt-3 block text-[10px] not-italic tracking-widest text-royal/70">
              {wedding.quoteSource}
            </cite>
          </blockquote>
        </Reveal>

        <Reveal direction="up" delay={650}>
          <div className="mt-14 w-full max-w-lg">
            <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.35em] text-white/40">
              Countdown to Our Big Day
            </p>
            <CountdownTimer targetDate={event.date} />
          </div>
        </Reveal>

        <Reveal direction="up" delay={800}>
          <button
            onClick={onNavigateRsvp}
            className="btn-invite-primary mt-12 px-12"
          >
            Confirm Attendance
          </button>
        </Reveal>
      </div>
    </section>
  );
}
