"use client";

import { Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import type { CeremonyItem } from "@/types/wedding";

interface EventSectionProps {
  ceremonies: CeremonyItem[];
}

export default function EventSection({ ceremonies }: EventSectionProps) {
  return (
    <section
      id="event"
      className="invitation-section invitation-section-pad relative overflow-hidden bg-navy text-white"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
      <div className="grain-overlay absolute inset-0" />

      <div className="relative mx-auto max-w-5xl lg:max-w-6xl">
        <SectionHeader label="Location" light />

        <div className="space-y-6">
          {ceremonies.map((ceremony, i) => (
            <Reveal key={ceremony.id} direction="up" delay={i * 120}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-royal/30 hover:bg-white/8 sm:p-8">
                {ceremony.image ? (
                  <div className="mb-6 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ceremony.image}
                      alt=""
                      className="h-auto w-full max-h-44 max-w-[13rem] object-contain sm:max-h-56 sm:max-w-[16rem] md:max-h-64 md:max-w-[18rem]"
                    />
                  </div>
                ) : null}

                <h3 className="font-display text-2xl font-light text-royal sm:text-3xl">
                  {ceremony.title}
                </h3>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal/15">
                      <Calendar className="h-4 w-4 text-royal" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                        Date
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-line">
                        {ceremony.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal/15">
                      <Clock className="h-4 w-4 text-royal" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                        Time
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-line">
                        {ceremony.time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal/15">
                    <MapPin className="h-4 w-4 text-royal" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                      Location
                    </p>
                    {ceremony.location ? (
                      <p className="mt-1 font-medium whitespace-pre-line">
                        {ceremony.location}
                      </p>
                    ) : null}
                    {ceremony.address ? (
                      <p className="mt-0.5 text-sm text-white/50 whitespace-pre-line">
                        {ceremony.address}
                      </p>
                    ) : null}
                  </div>
                </div>

                {ceremony.mapUrl && (
                  <a
                    href={ceremony.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-royal/30 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-royal transition-all duration-300 hover:bg-royal/15 active:scale-95"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Navigate to Location
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
