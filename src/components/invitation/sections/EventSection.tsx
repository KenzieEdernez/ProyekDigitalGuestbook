"use client";

import { Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import type { CeremonyItem } from "@/types/wedding";
import type { mergeEventSettings } from "@/lib/event-config";

type EventSettings = ReturnType<typeof mergeEventSettings>;

interface EventSectionProps {
  event: EventSettings;
  ceremonies: CeremonyItem[];
}

export default function EventSection({ event, ceremonies }: EventSectionProps) {
  return (
    <section
      id="event"
      className="invitation-section relative overflow-hidden bg-navy px-6 py-28 text-white"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
      <div className="grain-overlay absolute inset-0" />

      <div className="relative mx-auto max-w-5xl lg:max-w-6xl">
        <SectionHeader
          label="Wedding Events"
          title="Wedding Event"
          light
        />

        <div className="space-y-6">
          {ceremonies.map((ceremony, i) => (
            <Reveal key={ceremony.id} direction="up" delay={i * 120}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-500 hover:border-royal/30 hover:bg-white/8">
                <h3 className="font-display text-3xl font-light text-royal">
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
                      <p className="mt-1 text-sm">{ceremony.date}</p>
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
                      <p className="mt-1 text-sm">{ceremony.time}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal/15">
                    <MapPin className="h-4 w-4 text-royal" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                      Location
                    </p>
                    <p className="mt-1 font-medium">{ceremony.location}</p>
                    <p className="mt-0.5 text-sm text-white/50">
                      {ceremony.address}
                    </p>
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
                    Open in Maps
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal direction="up" delay={300}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-royal/25 bg-gradient-to-br from-royal/15 to-royal/5 p-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
              Dress Code
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40">
                  Ladies
                </p>
                <p className="mt-2 font-display text-xl">{event.dressLadies}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40">
                  Gentlemen
                </p>
                <p className="mt-2 font-display text-xl">
                  {event.dressGentlemen}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
