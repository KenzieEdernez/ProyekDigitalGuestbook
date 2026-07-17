"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { resolveHeroImages } from "@/lib/hero-images";
import type { InvitationCopy } from "@/types/wedding";

interface InvitationCoverProps {
  guestName: string | null;
  heroImage: string;
  heroImagePortrait: string;
  heroImageCard: string;
  coupleName: string;
  copy: InvitationCopy;
  onOpen: () => void;
  onPrimeMusic?: () => void;
  isExiting?: boolean;
}

export default function InvitationCover({
  guestName,
  heroImage,
  heroImagePortrait,
  heroImageCard,
  coupleName,
  copy,
  onOpen,
  onPrimeMusic,
  isExiting = false,
}: InvitationCoverProps) {
  const [visible, setVisible] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const heroes = resolveHeroImages({
    heroImage,
    heroImagePortrait,
    heroImageCard,
  });

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setBtnPressed(true);
    onOpen();
  };

  return (
    <div
      className={`invitation-cover grain-overlay relative min-h-[100dvh] overflow-hidden transition-opacity duration-700 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="invitation-cover-bg absolute inset-0 scale-105 md:hidden"
        style={{ backgroundImage: `url('${heroes.portrait}')` }}
      />
      <div
        className="invitation-cover-bg absolute inset-0 hidden scale-105 md:block"
        style={{ backgroundImage: `url('${heroes.landscape}')` }}
      />
      <div className="absolute inset-0 bg-navy-900/38" />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-5 py-8">
        <div
          className={`invitation-cover-card w-[17.5rem] overflow-hidden sm:w-[19rem] ${
            visible && !isExiting
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          } transition-all duration-[1.1s] ease-out-expo`}
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-navy-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroes.card}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="bg-cream px-4 py-5 text-center">
            <p className="text-[8px] font-semibold uppercase tracking-[0.38em] text-royal">
              {copy.engagementTitle}
            </p>

            <h1 className="mt-3 font-display text-[1.65rem] font-light leading-tight text-navy">
              {coupleName}
            </h1>

            {guestName && (
              <div className="mx-auto mt-3 max-w-[13rem] rounded-full border border-royal/15 bg-white/80 px-3 py-1.5">
                <p className="text-[7px] font-semibold uppercase tracking-[0.32em] text-stone-400">
                  Dear
                </p>
                <p className="mt-0.5 font-display text-sm text-navy">{guestName}</p>
              </div>
            )}

            <p className="mx-auto mt-3 max-w-[14rem] text-[11px] font-light leading-relaxed text-stone-600">
              {copy.coverMessage}
            </p>

            <button
              onPointerDown={onPrimeMusic}
              onClick={handleOpen}
              disabled={btnPressed}
              className={`btn-invite-primary mt-5 inline-flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] ${
                btnPressed ? "scale-95 opacity-70" : ""
              }`}
            >
              <span>{copy.openButtonLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-700"
        style={{ opacity: visible && !btnPressed ? 1 : 0 }}
      >
        <p className="text-[7px] uppercase tracking-[0.38em] text-white/30">
          Tap to open
        </p>
      </div>
    </div>
  );
}
