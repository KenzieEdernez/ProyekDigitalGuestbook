"use client";

import Reveal from "@/components/invitation/Reveal";
import type { InvitationCopy } from "@/types/wedding";
import type { mergeEventSettings } from "@/lib/event-config";

type EventSettings = ReturnType<typeof mergeEventSettings>;

interface DressCodeSectionProps {
  event: EventSettings;
  copy: InvitationCopy;
}

export default function DressCodeSection({ event, copy }: DressCodeSectionProps) {
  const note = copy.dressCodeNote?.trim();
  const noteText = note
    ? note.startsWith("(")
      ? note
      : `(${note})`
    : null;

  return (
    <section
      id="dresscode"
      className="invitation-section invitation-section-pad dresscode-section relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-35" />

      <div className="relative mx-auto max-w-md px-4 sm:max-w-lg">
        <Reveal direction="up" duration={900}>
          <div className="dresscode-stage">
            <div className="dresscode-rail dresscode-rail-left" aria-hidden />
            <div className="dresscode-rail dresscode-rail-right" aria-hidden />

            <div className="dresscode-panel">
              <div className="dresscode-panel-inner text-center">
                <div className="dresscode-crest" aria-hidden>
                  <span className="dresscode-crest-ring" />
                  <span className="dresscode-crest-dot">✦</span>
                </div>

                <p className="mt-5 font-display text-[2.15rem] font-light leading-none tracking-wide text-royal sm:text-5xl">
                  {copy.dressCodeTitle}
                </p>

                <p className="mx-auto mt-4 max-w-[17rem] text-[13px] font-light leading-relaxed text-stone-500 sm:max-w-sm sm:text-sm">
                  {copy.dressCodeDescription}
                </p>

                <div className="mx-auto my-6 h-px w-16 bg-gradient-to-r from-transparent via-royal/45 to-transparent" />

                <p className="font-display text-[1.35rem] uppercase tracking-[0.3em] text-navy sm:text-2xl">
                  {copy.dressCodeTheme}
                </p>

                {noteText && (
                  <p className="mt-2.5 font-display text-base italic tracking-wide text-royal sm:text-lg">
                    {noteText}
                  </p>
                )}

                {event.dressCodeImage ? (
                  <div className="dresscode-artwork mt-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.dressCodeImage}
                      alt="Dress code reference"
                      className="dresscode-artwork-img"
                    />
                  </div>
                ) : null}

                <div className="dresscode-looks mt-8">
                  <p className="dresscode-looks-line font-display text-navy">
                    <span className="dresscode-look-inline">
                      <span className="dresscode-look-label">Ladies</span>
                      <span className="dresscode-look-value">
                        {event.dressLadies || "—"}
                      </span>
                    </span>
                    <span className="dresscode-look-divider" aria-hidden>
                      ·
                    </span>
                    <span className="dresscode-look-inline">
                      <span className="dresscode-look-label">Gentlemen</span>
                      <span className="dresscode-look-value">
                        {event.dressGentlemen || "—"}
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
