"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import WishesForm from "@/components/invitation/WishesForm";
import WishLettersWall from "@/components/invitation/WishLettersWall";
import { getRsvpSession, type RsvpSession } from "@/lib/rsvp-session";

interface WishLettersSectionProps {
  onNavigateRsvp?: () => void;
}

export default function WishLettersSection({
  onNavigateRsvp,
}: WishLettersSectionProps) {
  const [session, setSession] = useState<RsvpSession | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const syncSession = useCallback(() => {
    setSession(getRsvpSession());
  }, []);

  useEffect(() => {
    syncSession();
    const onComplete = () => syncSession();
    window.addEventListener("wedding-rsvp-complete", onComplete);
    return () => window.removeEventListener("wedding-rsvp-complete", onComplete);
  }, [syncSession]);

  const canWrite = Boolean(session?.guestName);

  return (
    <section
      id="wishes"
      className="invitation-section relative overflow-hidden bg-[#f5f0ea] px-6 py-20 lg:py-28"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-25" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 28px, #c5a059 28px, #c5a059 29px)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          label="Guestbook"
          title="Wish Letters"
          subtitle="Read heartfelt messages from our guests. Share yours after confirming your attendance."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-5 lg:items-start">
          <Reveal direction="left" className="lg:col-span-3">
            <div className="mb-6 flex items-center gap-3">
              <Mail className="h-5 w-5 text-royal" />
              <p className="text-sm font-semibold text-navy">
                Letters from our guests
              </p>
            </div>
            <WishLettersWall refreshKey={refreshKey} />
          </Reveal>

          <Reveal direction="right" delay={150} className="lg:col-span-2">
            {canWrite && session ? (
              <WishesForm
                guestName={session.guestName}
                attendance={session.attendance}
                onSubmitted={() => setRefreshKey((k) => k + 1)}
              />
            ) : (
              <div className="wish-letter-locked overflow-hidden rounded-2xl border border-royal/15 bg-white/80 p-8 text-center shadow-soft backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-royal/10">
                  <Lock className="h-7 w-7 text-royal" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-navy">
                  Write Your Letter
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  Please complete your RSVP first — let us know whether you can
                  attend — then return here to leave your wish.
                </p>
                <button
                  type="button"
                  onClick={onNavigateRsvp}
                  className="btn-invite-primary mt-8 w-full"
                >
                  Go to RSVP
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
