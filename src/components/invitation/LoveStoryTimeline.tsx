"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Sparkles } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import type { LoveStoryItem } from "@/types/wedding";

interface LoveStoryTimelineProps {
  loveStory: LoveStoryItem[];
}

export default function LoveStoryTimeline({ loveStory }: LoveStoryTimelineProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const total = loveStory.length;

  const goTo = useCallback(
    (index: number, dir: "left" | "right") => {
      setDirection(dir);
      setActive((index + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(active + 1, "right"), [active, goTo]);
  const goPrev = useCallback(() => goTo(active - 1, "left"), [active, goTo]);

  useEffect(() => {
    const timer = setInterval(goNext, 7000);
    return () => clearInterval(timer);
  }, [goNext]);

  const item = loveStory[active];

  return (
    <div className="mt-28">
      <Reveal direction="blur" duration={900}>
        <div className="mb-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal">
            Our Journey
          </p>
          <h3 className="mt-4 font-display text-4xl font-light text-navy md:text-5xl">
            Our Love Story
          </h3>
          <div className="ornament-line mx-auto mt-6 max-w-xs" />
        </div>
      </Reveal>

      <div className="relative mx-auto max-w-3xl px-4 md:px-12">
        {/* Slide track */}
        <div className="love-story-slider relative overflow-hidden rounded-3xl">
          <div
            key={item.id}
            className={`love-story-slide love-story-slide-${direction} relative min-h-[320px] border border-royal/15 bg-white p-8 shadow-card md:min-h-[360px] md:p-12`}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-royal/[0.04] via-transparent to-blush/60" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/5 px-4 py-1.5">
                  <Sparkles className="h-3 w-3 text-royal" />
                  <span className="text-[10px] font-bold tracking-[0.25em] text-royal">
                    {item.year}
                  </span>
                </span>
                <span className="font-display text-sm text-stone-300">
                  {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>

              <div className="my-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-royal/25 bg-blush shadow-glow">
                  <Heart className="h-5 w-5 fill-royal/15 text-royal" />
                </div>
              </div>

              <h4 className="text-center font-display text-3xl text-navy md:text-4xl">
                {item.title}
              </h4>
              <p className="mx-auto mt-5 max-w-lg text-center text-sm leading-relaxed text-stone-500 md:text-base">
                {item.text}
              </p>

              <div className="mt-auto pt-8">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-royal/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous story"
          className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-royal/20 bg-white/90 text-navy shadow-soft backdrop-blur-sm transition-all hover:border-royal/40 hover:bg-white active:scale-95 md:-left-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next story"
          className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-royal/20 bg-white/90 text-navy shadow-soft backdrop-blur-sm transition-all hover:border-royal/40 hover:bg-white active:scale-95 md:-right-2"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {loveStory.map((story, i) => (
            <button
              key={story.year}
              type="button"
              aria-label={`Go to ${story.title}`}
              onClick={() => goTo(i, i > active ? "right" : "left")}
              className={`love-story-dot h-2 rounded-full transition-all duration-500 ${
                i === active
                  ? "w-8 bg-royal"
                  : "w-2 bg-royal/25 hover:bg-royal/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
