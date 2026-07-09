"use client";

import { useRef } from "react";
import { Heart } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import { WEDDING } from "@/lib/wedding-config";

export default function LoveStoryTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mt-28">
      <Reveal direction="blur" duration={900}>
        <div className="mb-14 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal">
            Our Journey
          </p>
          <h3 className="mt-4 font-display text-4xl font-light text-navy md:text-5xl">
            Our Love Story
          </h3>
          <div className="ornament-line mx-auto mt-6 max-w-xs" />
        </div>
      </Reveal>

      {/* Desktop: vertical timeline */}
      <div className="relative mx-auto hidden max-w-3xl md:block">
        {/* Central spine */}
        <div className="absolute bottom-8 left-1/2 top-8 w-px -translate-x-1/2">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-royal/40 to-transparent" />
        </div>

        {WEDDING.loveStory.map((item, i) => (
          <Reveal
            key={item.year}
            direction={i % 2 === 0 ? "left" : "right"}
            delay={i * 120}
            duration={900}
            className={`relative mb-12 flex items-center ${
              i % 2 === 0 ? "flex-row" : "flex-row-reverse"
            }`}
          >
            {/* Content card */}
            <div className="w-[calc(50%-2.5rem)]">
              <div className="group relative overflow-hidden rounded-2xl border border-royal/15 bg-white p-7 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-royal/30 hover:shadow-card">
                <span className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-light leading-none text-royal/[0.07] transition-all duration-500 group-hover:text-royal/[0.12]">
                  {item.year}
                </span>
                <div className="relative">
                  <span className="inline-block rounded-full border border-royal/25 bg-royal/5 px-3 py-1 text-[10px] font-bold tracking-widest text-royal">
                    {item.year}
                  </span>
                  <h4 className="mt-3 font-display text-2xl text-navy">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-stone-500">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Center node */}
            <div className="absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-royal/30 bg-blush shadow-sm transition-transform duration-500 group-hover:scale-110">
                <Heart className="h-4 w-4 fill-royal/20 text-royal" />
              </div>
            </div>

            <div className="w-[calc(50%-2.5rem)]" />
          </Reveal>
        ))}
      </div>

      {/* Mobile: horizontal scroll cards */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          className="love-story-scroll flex gap-4 overflow-x-auto px-2 pb-4 snap-x snap-mandatory scrollbar-none"
        >
          {WEDDING.loveStory.map((item, i) => (
            <div
              key={item.year}
              className="love-story-card snap-center shrink-0"
              style={{ "--card-index": i } as React.CSSProperties}
            >
              <div className="relative flex h-full w-[280px] flex-col overflow-hidden rounded-2xl border border-royal/15 bg-white p-6 shadow-soft">
                <div className="absolute -right-4 -top-6 font-display text-8xl font-light text-royal/[0.08]">
                  {item.year.slice(2)}
                </div>
                <div className="mb-auto">
                  <span className="inline-flex items-center gap-2 rounded-full bg-royal/10 px-3 py-1">
                    <Heart className="h-3 w-3 text-royal" />
                    <span className="text-[10px] font-bold tracking-widest text-royal">
                      {item.year}
                    </span>
                  </span>
                  <h4 className="mt-4 font-display text-xl text-navy">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-stone-500">
                    {item.text}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-royal/30 to-transparent" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint dots */}
        <div className="mt-4 flex justify-center gap-2">
          {WEDDING.loveStory.map((item) => (
            <span
              key={item.year}
              className="h-1.5 w-1.5 rounded-full bg-royal/25"
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[9px] uppercase tracking-[0.3em] text-stone-400">
          Swipe to explore
        </p>
      </div>
    </div>
  );
}
