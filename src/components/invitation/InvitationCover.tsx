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
      className={`invitation-cover relative min-h-[100dvh] overflow-hidden transition-opacity duration-700 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="invitation-cover-bg absolute inset-0 scale-[1.03] md:hidden"
        style={{ backgroundImage: `url('${heroes.portrait}')` }}
      />
      <div
        className="invitation-cover-bg absolute inset-0 hidden scale-[1.03] md:block"
        style={{ backgroundImage: `url('${heroes.landscape}')` }}
      />
      <div className="absolute inset-0 bg-navy-900/42" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/25 via-transparent to-navy-900/55" />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-5 py-10">
        <div
          className={`invitation-cover-card w-[16.75rem] overflow-hidden sm:w-[18.5rem] ${
            visible && !isExiting
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          } transition-all duration-[1.1s] ease-out-expo`}
        >
          <div className="invitation-cover-card-media bg-[#efe6d8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroes.card}
              alt=""
              className="block h-auto w-full object-contain"
            />
          </div>

          <div className="bg-[#f7f1e8] px-5 py-6 text-center">
            <p className="text-[8px] font-semibold uppercase tracking-[0.4em] text-royal">
              {copy.engagementTitle}
            </p>

            <h1 className="mt-3 font-display text-[1.7rem] font-light italic leading-[1.15] text-navy">
              {coupleName}
            </h1>

            <div className="mx-auto my-4 h-px w-10 bg-gradient-to-r from-transparent via-royal/50 to-transparent" />

            {guestName && (
              <p className="mb-3 font-display text-base text-navy/80">
                <span className="mr-1 text-[8px] font-sans font-semibold uppercase tracking-[0.28em] text-stone-400">
                  Dear
                </span>
                {guestName}
              </p>
            )}

            <p className="mx-auto max-w-[13.5rem] text-[11px] font-light leading-relaxed text-stone-500">
              {copy.coverMessage}
            </p>

            <button
              onPointerDown={onPrimeMusic}
              onClick={handleOpen}
              disabled={btnPressed}
              className={`btn-invite-primary mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[10px] tracking-[0.18em] ${
                btnPressed ? "scale-95 opacity-70" : ""
              }`}
            >
              <span>{copy.openButtonLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
