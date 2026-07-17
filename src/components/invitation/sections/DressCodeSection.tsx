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

  const combinedLooks = [event.dressLadies, event.dressGentlemen]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join("  ·  ");

  return (
    <section
      id="dresscode"
      className="invitation-section invitation-section-pad dresscode-section relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-40" />

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

                <p className="mt-5 font-display text-[2.25rem] font-light leading-none tracking-wide text-royal sm:text-5xl">
                  {copy.dressCodeTitle}
                </p>

                <p className="mx-auto mt-4 max-w-[17.5rem] text-[13px] font-light leading-relaxed text-stone-500 sm:max-w-sm sm:text-sm">
                  {copy.dressCodeDescription}
                </p>

                <p className="mt-7 font-display text-[1.4rem] uppercase tracking-[0.28em] text-navy sm:text-2xl">
                  {copy.dressCodeTheme}
                </p>

                {noteText && (
                  <p className="mt-2.5 font-display text-base italic tracking-wide text-royal sm:text-lg">
                    {noteText}
                  </p>
                )}

                {event.dressCodeImage ? (
                  <div className="dresscode-artwork mt-7">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.dressCodeImage}
                      alt="Dress code reference"
                      className="dresscode-artwork-img"
                    />
                  </div>
                ) : null}

                {combinedLooks && (
                  <p className="mx-auto mt-7 max-w-xs font-display text-[1.35rem] leading-snug text-navy sm:text-2xl">
                    {combinedLooks}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
