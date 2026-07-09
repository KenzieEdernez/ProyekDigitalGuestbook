"use client";

import { Instagram } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";

export default function CoupleSection() {
  return (
    <section id="couple" className="invitation-section bg-cream px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-16 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
            Mempelai
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy md:text-4xl">
            Bride & Groom
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone-500">
            Dua hati yang dipersatukan dalam cinta dan kasih sayang, siap
            melangkah menuju jenjang baru bersama.
          </p>
        </header>

        <div className="grid gap-12 md:grid-cols-2">
          {[WEDDING.groom, WEDDING.bride].map((person, i) => (
            <div
              key={person.name}
              className={`group relative ${i === 1 ? "md:mt-16" : ""}`}
            >
              <div className="card-premium overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={person.photo}
                    alt={person.fullName}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-royal-200">
                      {i === 0 ? "The Groom" : "The Bride"}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold">
                      {person.fullName}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">
                      @{person.nickname}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-sm text-stone-600">
                    <span className="font-semibold text-navy">Putra dari</span>
                    <br />
                    {person.father}
                    <br />
                    {person.mother}
                  </p>
                  <a
                    href={`https://instagram.com/${person.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-royal transition hover:text-royal-600"
                  >
                    <Instagram className="h-4 w-4" />
                    {person.instagram}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Love story timeline */}
        <div className="mt-20">
          <h3 className="mb-10 text-center font-serif text-2xl font-bold text-navy">
            Kisah Cinta Kami
          </h3>
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-royal/30 md:left-1/2" />
            {WEDDING.loveStory.map((item, i) => (
              <div
                key={item.year}
                className={`relative mb-10 flex items-start gap-6 md:gap-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="hidden flex-1 md:block" />
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-royal bg-cream md:absolute md:left-1/2 md:-translate-x-1/2">
                  <span className="h-2 w-2 rounded-full bg-royal" />
                </div>
                <div className="flex-1 rounded-xl border border-royal/15 bg-white p-5 shadow-card md:max-w-[calc(50%-2rem)]">
                  <p className="text-xs font-bold text-royal">{item.year}</p>
                  <h4 className="mt-1 font-serif text-lg font-bold text-navy">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
