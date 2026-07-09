"use client";

import { Instagram } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import LoveStoryTimeline from "@/components/invitation/LoveStoryTimeline";
import { WEDDING } from "@/lib/wedding-config";

export default function CoupleSection() {
  return (
    <section id="couple" className="invitation-section relative bg-blush px-6 py-28">
      <div className="absolute inset-0 bg-radial-gold opacity-40" />

      <div className="relative mx-auto max-w-6xl lg:max-w-7xl">
        <SectionHeader
          label="The Couple"
          title="Bride & Groom"
          subtitle="Two hearts united in love, ready to begin a new chapter together."
        />

        <div className="relative grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-royal/30 bg-white/90 font-display text-3xl text-royal shadow-glow backdrop-blur-sm float-slow">
              &
            </div>
          </div>

          {[WEDDING.groom, WEDDING.bride].map((person, i) => (
            <Reveal
              key={person.name}
              direction={i === 0 ? "left" : "right"}
              delay={i * 150}
              duration={900}
              className={i === 1 ? "md:mt-20" : ""}
            >
              <div className="group overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-royal/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-card-lg">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={person.photo}
                    alt={person.fullName}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-royal-200">
                      {i === 0 ? "The Groom" : "The Bride"}
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-light text-white">
                      {person.fullName}
                    </h3>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <p className="text-sm leading-relaxed text-stone-500">
                    <span className="font-semibold text-navy">
                      {i === 0 ? "Son of" : "Daughter of"}
                    </span>
                    <br />
                    {person.father}
                    <br />
                    {person.mother}
                  </p>
                  <a
                    href={`https://instagram.com/${person.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-royal/20 px-4 py-2 text-xs font-semibold text-royal transition-all duration-300 hover:border-royal/50 hover:bg-royal/5 active:scale-95"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    {person.instagram}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <LoveStoryTimeline />
      </div>
    </section>
  );
}
