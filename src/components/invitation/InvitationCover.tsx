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
        className="invitation-cover-bg absolute inset-0 scale-110 md:hidden"
        style={{ backgroundImage: `url('${heroes.portrait}')` }}
      />
      <div
        className="invitation-cover-bg absolute inset-0 hidden scale-110 md:block"
        style={{ backgroundImage: `url('${heroes.landscape}')` }}
      />
      <div className="absolute inset-0 bg-navy-900/55 backdrop-blur-[6px]" />
      <div className="absolute inset-0 bg-radial-gold opacity-40" />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-10 sm:px-6">
        <div
          className={`invitation-cover-card w-full max-w-md overflow-hidden transition-all duration-[1.2s] ease-out-expo ${
            visible && !isExiting
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-navy-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroes.card}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative bg-cream px-6 py-7 text-center sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute left-3 top-3 h-10 w-10 rounded-full border border-royal/15" />
            <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 rounded-full border border-royal/10" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-royal">
              {copy.engagementTitle}
            </p>

            <h1 className="mt-4 font-display text-3xl font-light leading-tight text-navy sm:text-4xl">
              {coupleName}
            </h1>

            <div className="my-5 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-royal/50" />
              <span className="font-display text-base text-royal">♥</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-royal/50" />
            </div>

            {guestName && (
              <div className="mb-4 rounded-full border border-royal/15 bg-white/70 px-4 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-stone-400">
                  Dear
                </p>
                <p className="mt-1 font-display text-lg text-navy">{guestName}</p>
              </div>
            )}

            <p className="mx-auto max-w-sm text-sm font-light leading-relaxed text-stone-600">
              {copy.coverMessage}
            </p>

            <button
              onPointerDown={onPrimeMusic}
              onClick={handleOpen}
              disabled={btnPressed}
              className={`btn-invite-primary group mt-7 inline-flex w-full max-w-xs items-center justify-center gap-2 px-8 sm:mt-8 ${
                btnPressed ? "scale-95 opacity-70" : ""
              }`}
            >
              <span>{copy.openButtonLabel}</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-500 group-hover:translate-y-1" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-700"
        style={{ opacity: visible && !btnPressed ? 1 : 0 }}
      >
        <p className="text-[8px] uppercase tracking-[0.4em] text-white/35">
          Tap to open
        </p>
      </div>
    </div>
  );
}
