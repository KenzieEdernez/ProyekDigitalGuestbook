"use client";

import { MapPinned } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import type { CeremonyItem } from "@/types/wedding";

interface EventSectionProps {
  ceremonies: CeremonyItem[];
}

function formatLocationTime(raw: string) {
  const value = raw.trim();
  const match = value.match(/^(.+?)\s*(AM|PM)$/i);
  if (!match) {
    return { clock: value, meridian: "" };
  }
  return {
    clock: match[1].trim(),
    meridian: match[2].toUpperCase(),
  };
}

export default function EventSection({ ceremonies }: EventSectionProps) {
  return (
    <section
      id="event"
      className="location-section invitation-section invitation-section-pad relative overflow-hidden"
    >
      <div className="location-section-glow pointer-events-none absolute inset-0" />
      <div className="grain-overlay absolute inset-0 opacity-40" />

      <div className="relative mx-auto w-full max-w-xl px-5 text-center sm:px-8">
        <Reveal direction="blur" duration={700}>
          <h2 className="location-section-title">Location</h2>
          <div className="location-section-rule" aria-hidden />
        </Reveal>

        <div className="mt-8 space-y-14 sm:mt-10 sm:space-y-16">
          {ceremonies.map((ceremony, i) => {
            const venueName = (ceremony.location || ceremony.title || "").trim();
            const timeLabel = ceremony.time?.trim()
              ? formatLocationTime(ceremony.time)
              : null;

            return (
              <Reveal key={ceremony.id} direction="up" delay={i * 100}>
                <article className="location-card">
                  {ceremony.image ? (
                    <div className="location-card-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ceremony.image}
                        alt={venueName || "Location"}
                        className="location-card-image"
                      />
                    </div>
                  ) : null}

                  {venueName ? (
                    <h3 className="location-card-venue whitespace-pre-line">
                      {venueName}
                    </h3>
                  ) : null}

                  {timeLabel ? (
                    <p className="location-card-time">
                      <span className="location-card-time-clock">
                        {timeLabel.clock}
                      </span>
                      {timeLabel.meridian ? (
                        <span className="location-card-time-meridian">
                          {timeLabel.meridian}
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  {ceremony.address?.trim() ? (
                    <p className="location-card-address whitespace-pre-line">
                      {ceremony.address}
                    </p>
                  ) : null}

                  {ceremony.mapUrl ? (
                    <a
                      href={ceremony.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="location-card-cta"
                    >
                      <MapPinned className="h-4 w-4 shrink-0" />
                      Navigate to Location
                    </a>
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
