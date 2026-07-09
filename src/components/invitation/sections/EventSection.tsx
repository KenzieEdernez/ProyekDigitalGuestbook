"use client";

import { Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";
import type { mergeEventSettings } from "@/lib/event-config";

type EventSettings = ReturnType<typeof mergeEventSettings>;

interface EventSectionProps {
  event: EventSettings;
}

export default function EventSection({ event }: EventSectionProps) {
  return (
    <section id="event" className="invitation-section bg-navy px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-14 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
            Rangkaian Acara
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
            Wedding Event
          </h2>
        </header>

        <div className="space-y-8">
          {WEDDING.ceremonies.map((ceremony, i) => (
            <div
              key={ceremony.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
            >
              <div className="absolute -right-8 -top-8 font-serif text-[8rem] font-bold leading-none text-white/[0.03]">
                {String(i + 1).padStart(2, "0")}
              </div>

              <h3 className="font-serif text-2xl font-bold text-royal">
                {ceremony.title}
              </h3>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                      Tanggal
                    </p>
                    <p className="mt-1 text-sm">{ceremony.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                      Waktu
                    </p>
                    <p className="mt-1 text-sm">{ceremony.time}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    Lokasi
                  </p>
                  <p className="mt-1 font-semibold">{ceremony.location}</p>
                  <p className="mt-1 text-sm text-white/60">{ceremony.address}</p>
                </div>
              </div>

              <a
                href={ceremony.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-royal/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-royal transition hover:bg-royal/10"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka di Maps
              </a>
            </div>
          ))}
        </div>

        {/* Dress code from admin settings */}
        <div className="mt-10 rounded-2xl border border-royal/30 bg-royal/10 p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-royal">
            Dress Code
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-white/50">Wanita</p>
              <p className="mt-1 font-semibold">{event.dressLadies}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Pria</p>
              <p className="mt-1 font-semibold">{event.dressGentlemen}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
