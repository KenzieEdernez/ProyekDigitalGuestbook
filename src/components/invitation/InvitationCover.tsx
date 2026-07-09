"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { getCoupleDisplayName } from "@/lib/wedding-config";

interface InvitationCoverProps {
  guestName: string | null;
  heroImage: string;
  weddingDate: string;
  onOpen: () => void;
  isExiting?: boolean;
}

export default function InvitationCover({
  guestName,
  heroImage,
  weddingDate,
  onOpen,
  isExiting = false,
}: InvitationCoverProps) {
  const [visible, setVisible] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const dateParts = weddingDate.match(/(\d{1,2})/g);
  const dayMonth = dateParts ? `${dateParts[0]}/${dateParts[1]}` : "12/12";
  const year = weddingDate.match(/\d{4}/)?.[0] ?? "2025";

  const handleOpen = () => {
    setBtnPressed(true);
    setTimeout(onOpen, 200);
  };

  return (
    <div
      className={`invitation-cover grain-overlay relative flex min-h-screen flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Ken Burns background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[3s] ease-out-expo"
        style={{
          backgroundImage: `url('${heroImage}')`,
          transform: visible && !isExiting ? "scale(1)" : "scale(1.12)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/85 via-navy-900/40 to-navy-900/95" />
      <div className="absolute inset-0 bg-radial-gold" />

      {/* Floating ornaments */}
      <div className="pointer-events-none absolute left-[10%] top-[20%] font-display text-6xl text-royal/10 float-slow select-none">
        &
      </div>
      <div className="pointer-events-none absolute bottom-[25%] right-[12%] font-display text-4xl text-white/5 float-delay select-none">
        ✦
      </div>

      <div
        className={`relative z-10 flex w-full max-w-xl flex-col items-center px-8 text-center transition-all duration-[1.2s] ease-out-expo ${
          visible && !isExiting
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        <div
          className="mb-10 flex w-full items-center justify-between text-xs font-light tracking-[0.35em] text-white/70 transition-all duration-1000 delay-300"
          style={{ transitionDelay: visible ? "400ms" : "0ms" }}
        >
          <span>{dayMonth}</span>
          <Sparkles className="h-3.5 w-3.5 text-royal/60" />
          <span>{year}</span>
        </div>

        <p
          className="text-[10px] font-semibold uppercase tracking-[0.5em] text-royal-200 transition-all duration-1000"
          style={{
            transitionDelay: visible ? "500ms" : "0ms",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          The Wedding of
        </p>

        <h1
          className="mt-5 font-display text-5xl font-light leading-[1.1] text-white md:text-7xl"
          style={{
            transitionDelay: visible ? "650ms" : "0ms",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {getCoupleDisplayName()}
        </h1>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-royal/50" />
          <span className="font-display text-lg text-royal">♥</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-royal/50" />
        </div>

        {guestName && (
          <div
            className="mb-8 transition-all duration-1000"
            style={{
              transitionDelay: visible ? "800ms" : "0ms",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-white/40">
              Dear
            </p>
            <p className="mt-3 font-display text-2xl font-light text-white md:text-3xl">
              {guestName}
            </p>
          </div>
        )}

        <p
          className="max-w-sm text-sm font-light leading-relaxed text-white/60"
          style={{
            transitionDelay: visible ? "950ms" : "0ms",
            opacity: visible ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        >
          With great joy, we invite you to attend and share your blessings on our
          special day.
        </p>

        <button
          onClick={handleOpen}
          disabled={btnPressed}
          className={`btn-invite-ghost group mt-12 px-12 ${
            btnPressed ? "scale-95 opacity-70" : ""
          }`}
        >
          <span className="relative z-10">Open Invitation</span>
          <ChevronDown className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover:translate-y-1.5" />
        </button>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-700"
        style={{ opacity: visible && !btnPressed ? 1 : 0 }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-[8px] uppercase tracking-[0.4em] text-white/30">
            Tap to open
          </span>
          <div className="relative h-10 w-5 rounded-full border border-white/20">
            <div className="absolute left-1/2 top-2 h-2 w-0.5 -translate-x-1/2 animate-pulse rounded-full bg-royal/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
