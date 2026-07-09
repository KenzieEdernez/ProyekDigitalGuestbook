"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Heart, MessageCircle } from "lucide-react";
import type { Wish } from "@/types/wish";

interface WishesWallProps {
  open: boolean;
  onToggle: () => void;
  refreshKey?: number;
}

export default function WishesWall({
  open,
  onToggle,
  refreshKey = 0,
}: WishesWallProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;

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
        setLoaded(true);
      }
    }
    load();
  }, [open, refreshKey]);

  return (
    <div className="overflow-hidden rounded-2xl border border-royal/15 bg-white/60 backdrop-blur-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-royal/5"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-royal" />
          <span className="text-sm font-semibold text-navy">
            View Other Guests&apos; Wishes
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-stone-400 transition-transform duration-400 ease-out-expo ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-500 ease-out-expo ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-royal/10 px-6 py-5">
            {loading && (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-royal/30 border-t-royal" />
              </div>
            )}

            {!loading && loaded && wishes.length === 0 && (
              <p className="py-8 text-center text-sm text-stone-400">
                No wishes from other guests yet.
              </p>
            )}

            <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
              {wishes.map((wish, i) => (
                <div
                  key={wish.id}
                  className="rounded-xl border border-royal/10 bg-white p-4 shadow-soft transition-all duration-400"
                  style={{
                    animationDelay: `${i * 50}ms`,
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 0.4s ease ${i * 50}ms, transform 0.4s ease ${i * 50}ms`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-navy">{wish.guest_name}</p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(wish.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {(wish.attendance === "attending" ||
                      wish.attendance === "hadir") && (
                      <span className="badge bg-emerald-50 text-emerald-600">
                        <Heart className="mr-1 h-3 w-3" />
                        Attending
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {wish.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
