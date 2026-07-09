"use client";

import { Heart } from "lucide-react";
import CountdownTimer from "@/components/invitation/CountdownTimer";
import { getCoupleDisplayName, WEDDING } from "@/lib/wedding-config";
import type { mergeEventSettings } from "@/lib/event-config";

type EventSettings = ReturnType<typeof mergeEventSettings>;

interface HomeSectionProps {
  event: EventSettings;
  guestName: string | null;
  onNavigateRsvp: () => void;
}

export default function HomeSection({
  event,
  guestName,
  onNavigateRsvp,
}: HomeSectionProps) {
  return (
    <section
      id="home"
      className="invitation-section relative min-h-screen"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${event.heroImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/40 to-cream" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-200">
          Undangan Pernikahan
        </p>

        <h2 className="mt-4 font-serif text-4xl font-bold text-white md:text-6xl">
          {getCoupleDisplayName()}
        </h2>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px w-16 bg-royal/50" />
          <Heart className="h-4 w-4 fill-royal text-royal" />
          <span className="h-px w-16 bg-royal/50" />
        </div>

        {guestName && (
          <p className="text-sm text-white/80">
            Untuk <span className="font-serif text-lg text-white">{guestName}</span>
          </p>
        )}

        <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
          {WEDDING.quote}
        </p>
        <p className="mt-2 text-xs italic text-royal-200">{WEDDING.quoteSource}</p>

        <div className="mt-12 w-full max-w-md">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
            Menuju Hari Bahagia
          </p>
          <CountdownTimer targetDate={event.date} />
        </div>

        <button
          onClick={onNavigateRsvp}
          className="btn-gold mt-10 px-10"
        >
          Konfirmasi Kehadiran
        </button>
      </div>
    </section>
  );
}
