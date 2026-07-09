"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Mail, X } from "lucide-react";
import type { Wish } from "@/types/wish";

interface WishLettersWallProps {
  refreshKey?: number;
}

const BUBBLE_SIZE = 100;
const BUBBLE_RADIUS = BUBBLE_SIZE / 2;

type BubblePhysics = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  paused: boolean;
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

function createBubblePhysics(
  wishes: Wish[],
  width: number,
  height: number
): BubblePhysics[] {
  const margin = BUBBLE_RADIUS + 6;
  const placed: { x: number; y: number }[] = [];

  return wishes.map((wish, index) => {
    const seed = hashString(wish.id);

    let x = margin;
    let y = margin;

    for (let attempt = 0; attempt < 50; attempt++) {
      x =
        margin +
        seededRandom(seed + attempt * 13 + index) * (width - margin * 2);
      y =
        margin +
        seededRandom(seed + attempt * 29 + index * 7) * (height - margin * 2);

      const collides = placed.some((p) => {
        const dx = x - p.x;
        const dy = y - p.y;
        return Math.sqrt(dx * dx + dy * dy) < BUBBLE_SIZE + 4;
      });

      if (!collides) break;
    }

    placed.push({ x, y });

    const speed = 0.5 + seededRandom(seed + 40) * 0.55;
    const angle = seededRandom(seed + 41) * Math.PI * 2;

    return {
      id: wish.id,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      paused: false,
    };
  });
}

function applyTransform(node: HTMLDivElement, x: number, y: number) {
  node.style.transform = `translate3d(${x - BUBBLE_RADIUS}px, ${y - BUBBLE_RADIUS}px, 0)`;
}

export default function WishLettersWall({ refreshKey = 0 }: WishLettersWallProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Wish | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const physicsRef = useRef<BubblePhysics[]>([]);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rafRef = useRef<number | null>(null);

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

  const initPhysics = useCallback(() => {
    const box = containerRef.current;
    if (!box || !wishes.length) return;

    const width = box.clientWidth;
    const height = box.clientHeight;
    if (width <= 0 || height <= 0) return;

    physicsRef.current = createBubblePhysics(wishes, width, height);

    for (const bubble of physicsRef.current) {
      const node = nodeRefs.current.get(bubble.id);
      if (node) applyTransform(node, bubble.x, bubble.y);
    }
  }, [wishes]);

  useEffect(() => {
    initPhysics();

    const box = containerRef.current;
    if (!box) return;

    const observer = new ResizeObserver(() => {
      initPhysics();
    });
    observer.observe(box);

    return () => observer.disconnect();
  }, [initPhysics]);

  useEffect(() => {
    const step = () => {
      const box = containerRef.current;
      const bubbles = physicsRef.current;

      if (box && bubbles.length) {
        const width = box.clientWidth;
        const height = box.clientHeight;
        const pad = BUBBLE_RADIUS + 2;

        for (const bubble of bubbles) {
          if (bubble.paused) continue;

          bubble.x += bubble.vx;
          bubble.y += bubble.vy;

          if (bubble.x <= pad) {
            bubble.x = pad;
            bubble.vx = Math.abs(bubble.vx) * 0.985;
          } else if (bubble.x >= width - pad) {
            bubble.x = width - pad;
            bubble.vx = -Math.abs(bubble.vx) * 0.985;
          }

          if (bubble.y <= pad) {
            bubble.y = pad;
            bubble.vy = Math.abs(bubble.vy) * 0.985;
          } else if (bubble.y >= height - pad) {
            bubble.y = height - pad;
            bubble.vy = -Math.abs(bubble.vy) * 0.985;
          }

          const node = nodeRefs.current.get(bubble.id);
          if (node) applyTransform(node, bubble.x, bubble.y);
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [wishes.length]);

  const setBubblePaused = (id: string, paused: boolean) => {
    const bubble = physicsRef.current.find((b) => b.id === id);
    if (bubble) bubble.paused = paused;
  };

  if (loading) {
    return (
      <div className="wish-field-loading flex h-[420px] items-center justify-center md:h-[500px]">
        <div className="wish-loading-orb h-10 w-10 rounded-full border-2 border-royal/25 border-t-royal" />
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
      <div
        ref={containerRef}
        className="wish-bubble-field relative h-[420px] overflow-hidden rounded-3xl border border-royal/10 bg-gradient-to-br from-[#fffdf8] via-white/70 to-blush/50 md:h-[500px]"
      >
        <div className="wish-field-glow pointer-events-none absolute inset-0" />
        <div className="wish-field-dots pointer-events-none absolute inset-0" />
        <div className="wish-field-sparkle wish-field-sparkle-a pointer-events-none absolute" />
        <div className="wish-field-sparkle wish-field-sparkle-b pointer-events-none absolute" />
        <div className="wish-field-sparkle wish-field-sparkle-c pointer-events-none absolute" />

        {wishes.map((wish, i) => {
          const attending = isAttending(wish.attendance);
          const ringClass = wish.attendance
            ? attending
              ? "wish-bubble-ring-attending"
              : "wish-bubble-ring-absent"
            : "wish-bubble-ring-neutral";

          return (
            <div
              key={wish.id}
              ref={(node) => {
                if (node) nodeRefs.current.set(wish.id, node);
                else nodeRefs.current.delete(wish.id);
              }}
              className="wish-bubble-wrap absolute left-0 top-0 will-change-transform"
              style={{
                width: BUBBLE_SIZE,
                height: BUBBLE_SIZE,
              }}
            >
              <button
                type="button"
                onClick={() => setSelected(wish)}
                onMouseEnter={() => setBubblePaused(wish.id, true)}
                onMouseLeave={() => setBubblePaused(wish.id, false)}
                className={`wish-bubble wish-bubble-pop-in ${ringClass} group relative flex h-full w-full items-center justify-center rounded-full text-center`}
                style={{
                  ["--enter-delay" as string]: `${(i * 0.06).toFixed(2)}s`,
                }}
                aria-label={`Open wish from ${wish.guest_name}`}
              >
                <span className="wish-bubble-ring pointer-events-none absolute inset-0 rounded-full" />
                <span className="wish-bubble-glass pointer-events-none absolute inset-[3px] rounded-full" />
                <span className="wish-bubble-name relative z-10 px-2 font-display text-base font-semibold leading-tight text-navy">
                  {wish.guest_name.split(" ")[0]}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {selected && (
        <div
          className="wish-modal-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-navy-900/60 p-6 backdrop-blur-sm"
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
