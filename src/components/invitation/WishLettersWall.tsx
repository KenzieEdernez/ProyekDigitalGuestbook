"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Mail, X } from "lucide-react";
import type { Wish } from "@/types/wish";

interface WishLettersWallProps {
  refreshKey?: number;
}

function isAttending(attendance: string | null | undefined) {
  return attendance === "attending" || attendance === "hadir";
}

function getBubbleSize(message: string) {
  const len = message.length;
  if (len < 40) return 88;
  if (len < 100) return 100;
  return 112;
}

function getBubblePosition(index: number, total: number) {
  const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(total))));
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const left = 8 + (col / Math.max(cols - 1, 1)) * 72;
  const top = 8 + (row / Math.max(rows - 1, 1)) * 68;
  return {
    left: `${left}%`,
    top: `${top}%`,
    delay: `${index * 0.35}s`,
    duration: `${4.5 + (index % 3)}s`,
  };
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

  const positions = useMemo(
    () => wishes.map((_, i) => getBubblePosition(i, wishes.length)),
    [wishes]
  );

  if (loading) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-royal/30 border-t-royal" />
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <div className="wish-letter-empty flex h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-royal/20 bg-white/50 px-8 text-center">
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
      <div className="wish-bubble-field relative h-[420px] overflow-hidden rounded-3xl border border-royal/10 bg-gradient-to-br from-white/80 via-[#fffdf8] to-blush/40 md:h-[480px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(197,160,89,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,240,237,0.9),transparent_55%)]" />

        {wishes.map((wish, i) => {
          const pos = positions[i];
          const size = getBubbleSize(wish.message);
          const attending = isAttending(wish.attendance);
          const ringClass = wish.attendance
            ? attending
              ? "ring-4 ring-emerald-400/80"
              : "ring-4 ring-red-400/80"
            : "ring-2 ring-royal/20";

          return (
            <button
              key={wish.id}
              type="button"
              onClick={() => setSelected(wish)}
              className={`wish-bubble absolute flex items-center justify-center rounded-full bg-white/90 text-center shadow-card backdrop-blur-sm transition-transform duration-300 hover:scale-110 hover:z-20 ${ringClass}`}
              style={{
                left: pos.left,
                top: pos.top,
                width: size,
                height: size,
                animationDelay: pos.delay,
                animationDuration: pos.duration,
              }}
              aria-label={`Open wish from ${wish.guest_name}`}
            >
              <span className="px-3 text-[10px] font-semibold leading-tight text-navy">
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
