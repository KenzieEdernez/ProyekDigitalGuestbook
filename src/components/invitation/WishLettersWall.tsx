"use client";

import { useEffect, useState } from "react";
import { Heart, Mail } from "lucide-react";
import type { Wish } from "@/types/wish";

interface WishLettersWallProps {
  refreshKey?: number;
}

export default function WishLettersWall({ refreshKey = 0 }: WishLettersWallProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-royal/30 border-t-royal" />
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <div className="wish-letter-empty rounded-2xl border border-dashed border-royal/20 bg-white/50 px-8 py-16 text-center">
        <Mail className="mx-auto h-10 w-10 text-royal/40" />
        <p className="mt-4 font-display text-xl text-navy">No letters yet</p>
        <p className="mt-2 text-sm text-stone-500">
          Be the first to leave a wish after confirming your attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {wishes.map((wish, i) => (
        <article
          key={wish.id}
          className="wish-letter-card group relative overflow-hidden rounded-2xl border border-royal/12 bg-[#fffdf8] p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-royal/25 hover:shadow-card"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="pointer-events-none absolute right-4 top-0 h-16 w-12 rounded-b-md bg-royal/10 shadow-inner" />
          <div className="pointer-events-none absolute right-5 top-1 h-3 w-8 rounded-sm bg-royal/20" />

          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-lg text-navy">{wish.guest_name}</p>
              <p className="text-[10px] uppercase tracking-wider text-stone-400">
                {new Date(wish.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {(wish.attendance === "attending" || wish.attendance === "hadir") && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                <Heart className="h-3 w-3" />
                Attending
              </span>
            )}
          </div>

          <div className="relative">
            <span className="font-display text-4xl leading-none text-royal/20">&ldquo;</span>
            <p className="-mt-3 text-sm leading-relaxed text-stone-600">
              {wish.message}
            </p>
          </div>

          <div className="mt-5 h-px bg-gradient-to-r from-royal/20 via-royal/5 to-transparent" />
        </article>
      ))}
    </div>
  );
}
