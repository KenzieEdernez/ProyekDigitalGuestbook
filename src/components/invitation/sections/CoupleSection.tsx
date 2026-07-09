"use client";

import { Instagram } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import { WEDDING } from "@/lib/wedding-config";

export default function CoupleSection() {
  return (
    <section id="couple" className="invitation-section relative bg-blush px-6 py-28">
      <div className="absolute inset-0 bg-radial-gold opacity-40" />

      <div className="relative mx-auto max-w-5xl">
        <SectionHeader
          label="Mempelai"
          title="Bride & Groom"
          subtitle="Dua hati yang dipersatukan dalam cinta dan kasih sayang, siap melangkah menuju jenjang baru bersama."
        />

        <div className="relative grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Center ampersand */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-royal/30 bg-white/90 font-display text-3xl text-royal shadow-glow backdrop-blur-sm">
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
                      {i === 0 ? "Putra" : "Putri"} dari
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

        {/* Love story */}
        <div className="mt-24">
          <Reveal direction="up">
            <h3 className="mb-12 text-center font-display text-3xl font-light text-navy">
              Kisah Cinta Kami
            </h3>
          </Reveal>

          <div className="relative mx-auto max-w-2xl">
            <div className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-transparent via-royal/30 to-transparent md:left-1/2" />

            {WEDDING.loveStory.map((item, i) => (
              <Reveal
                key={item.year}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 100}
                className={`relative mb-10 flex items-start gap-6 md:gap-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="hidden flex-1 md:block" />
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-royal/40 bg-white shadow-sm md:absolute md:left-1/2 md:-translate-x-1/2">
                  <span className="h-2 w-2 rounded-full bg-royal" />
                </div>
                <div className="glass-card-light flex-1 p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-card md:max-w-[calc(50%-2.5rem)]">
                  <p className="text-xs font-bold tracking-widest text-royal">
                    {item.year}
                  </p>
                  <h4 className="mt-1 font-display text-xl text-navy">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
