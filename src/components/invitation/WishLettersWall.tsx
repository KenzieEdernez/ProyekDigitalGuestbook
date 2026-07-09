"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Mail, X } from "lucide-react";
import type { Wish } from "@/types/wish";

interface WishLettersWallProps {
  refreshKey?: number;
}

type BubbleLayout = {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  floatClass: string;
  drift: number;
};

function isAttending(attendance: string | null | undefined) {
  return attendance === "attending" || attendance === "hadir";
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function scatterBubbles(wishes: Wish[]): BubbleLayout[] {
  const margin = 10;
  const placed: { x: number; y: number; r: number }[] = [];

  return wishes.map((wish, index) => {
    const seed = hashString(wish.id);
    const size = 76 + Math.floor(seededRandom(seed) * 44);
    const radius = (size / 420) * 50;

    let x = margin;
    let y = margin;

    for (let attempt = 0; attempt < 60; attempt++) {
      x =
        margin +
        seededRandom(seed + attempt * 13 + index) * (100 - margin * 2);
      y =
        margin +
        seededRandom(seed + attempt * 29 + index * 7) * (100 - margin * 2);

      const collides = placed.some((p) => {
        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < radius + p.r + 1.5;
      });

      if (!collides) break;
    }

    placed.push({ x, y, r: radius });

    const floatVariant = Math.floor(seededRandom(seed + 3) * 3);

    return {
      left: `${x}%`,
      top: `${y}%`,
      size,
      delay: `${(seededRandom(seed + 5) * 2.5).toFixed(2)}s`,
      duration: `${(4.2 + seededRandom(seed + 7) * 3.5).toFixed(2)}s`,
      floatClass: `wish-bubble-float-${floatVariant}`,
      drift: Math.floor(seededRandom(seed + 11) * 28) - 14,
    };
  });
}

export default function WishLettersWall({ refreshKey = 0 }: WishLettersWallProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Wish | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/wishes");
        if (res.ok) {
          const data = await res.json();
          setWishes(data.wishes ?? []);
        }
      } catch {
        // unavailable
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  const layouts = useMemo(() => scatterBubbles(wishes), [wishes]);

  if (loading) {
    return (
      <div className="flex h-[420px] items-center justify-center md:h-[500px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-royal/30 border-t-royal" />
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <div className="wish-letter-empty flex h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-royal/20 bg-white/50 px-8 text-center md:h-[500px]">
        <Mail className="h-10 w-10 text-royal/40" />
        <p className="mt-4 font-display text-xl text-navy">No letters yet</p>
        <p className="mt-2 text-sm text-stone-500">
          Be the first to leave a wish after confirming your attendance.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="wish-bubble-field relative h-[420px] overflow-hidden rounded-3xl border border-royal/10 bg-gradient-to-br from-[#fffdf8] via-white/70 to-blush/50 md:h-[500px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(197,160,89,0.12),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(249,240,237,0.8),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(197,160,89,0.15)_1px,transparent_1px)] [background-size:24px_24px]" />

        {wishes.map((wish, i) => {
          const layout = layouts[i];
          const attending = isAttending(wish.attendance);
          const ringClass = wish.attendance
            ? attending
              ? "ring-[3px] ring-emerald-400/90"
              : "ring-[3px] ring-red-400/90"
            : "ring-2 ring-royal/25";

          return (
            <button
              key={wish.id}
              type="button"
              onClick={() => setSelected(wish)}
              className={`wish-bubble ${layout.floatClass} group absolute flex items-center justify-center rounded-full text-center shadow-[0_8px_24px_rgba(26,35,50,0.12)] transition-transform duration-500 hover:z-30 hover:scale-110 ${ringClass}`}
              style={{
                left: layout.left,
                top: layout.top,
                width: layout.size,
                height: layout.size,
                animationDelay: layout.delay,
                animationDuration: layout.duration,
                ["--bubble-drift" as string]: `${layout.drift}px`,
              }}
              aria-label={`Open wish from ${wish.guest_name}`}
            >
              <span className="wish-bubble-shine pointer-events-none absolute inset-1 rounded-full" />
              <span className="relative z-10 px-2 font-display text-[11px] font-light leading-tight text-navy/90">
                {wish.guest_name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-900/60 p-6 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="wish-popout relative max-w-md rounded-3xl border border-royal/20 bg-[#fffdf8] p-8 shadow-card-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start justify-between gap-3 pr-8">
              <div>
                <p className="font-display text-2xl text-navy">{selected.guest_name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-400">
                  {new Date(selected.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {selected.attendance && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wide ${
                    isAttending(selected.attendance)
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <Heart className="h-3 w-3" />
                  {isAttending(selected.attendance) ? "Attending" : "Not Attending"}
                </span>
              )}
            </div>

            <span className="mt-6 block font-display text-5xl leading-none text-royal/25">
              &ldquo;
            </span>
            <p className="-mt-2 text-base leading-relaxed text-stone-600">
              {selected.message}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
