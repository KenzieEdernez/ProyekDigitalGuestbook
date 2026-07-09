"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCoupleDisplayName } from "@/lib/wedding-config";

interface InvitationCoverProps {
  guestName: string | null;
  heroImage: string;
  weddingDate: string;
  onOpen: () => void;
}

export default function InvitationCover({
  guestName,
  heroImage,
  weddingDate,
  onOpen,
}: InvitationCoverProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const dateParts = weddingDate.match(/(\d{1,2})/g);
  const dayMonth = dateParts ? `${dateParts[0]}/${dateParts[1]}` : "12/12";
  const year = weddingDate.match(/\d{4}/)?.[0] ?? "2025";

  return (
    <div className="invitation-cover relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-[2s] ease-out"
        style={{
          backgroundImage: `url('${heroImage}')`,
          transform: visible ? "scale(1)" : "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/50 to-navy-900/90" />

      <div
        className={`relative z-10 flex w-full max-w-lg flex-col items-center px-8 text-center transition-all duration-1000 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mb-8 flex w-full items-center justify-between text-sm font-light tracking-[0.3em] text-white/80">
          <span>{dayMonth}</span>
          <span className="h-px flex-1 mx-6 bg-white/30" />
          <span>{year}</span>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-royal-200">
          The Wedding of
        </p>

        <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-white md:text-6xl">
          {getCoupleDisplayName()}
        </h1>

        <div className="my-8 h-px w-24 bg-gradient-to-r from-transparent via-royal to-transparent" />

        {guestName && (
          <div className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/50">
              Kepada Yth.
            </p>
            <p className="mt-2 font-serif text-xl text-white md:text-2xl">
              {guestName}
            </p>
          </div>
        )}

        <p className="max-w-sm text-sm leading-relaxed text-white/70">
          Dengan penuh sukacita, kami mengundang Anda untuk hadir dan memberikan
          doa restu di hari bahagia kami.
        </p>

        <button
          onClick={onOpen}
          className="group mt-10 inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/5 px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition hover:border-royal hover:bg-royal/20"
        >
          Buka Undangan
          <ChevronDown className="h-4 w-4 transition group-hover:translate-y-1" />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-white/40">
          <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="h-8 w-px animate-pulse bg-white/30" />
        </div>
      </div>
    </div>
  );
}
