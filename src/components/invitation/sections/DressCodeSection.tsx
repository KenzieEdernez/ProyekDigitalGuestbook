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
  const combinedLooks = [event.dressLadies, event.dressGentlemen]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <section
      id="dresscode"
      className="invitation-section invitation-section-pad dresscode-section relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-40" />
      <div className="dresscode-glow pointer-events-none absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-royal/10 blur-3xl" />

      <div className="relative mx-auto max-w-md px-5 sm:max-w-lg">
        <Reveal direction="blur" duration={900}>
          <div className="dresscode-card text-center">
            <div className="dresscode-ornament mx-auto mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-royal/50" />
              <span className="font-display text-lg text-royal">✦</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-royal/50" />
            </div>

            <p className="font-display text-4xl font-light tracking-wide text-royal sm:text-5xl">
              {copy.dressCodeTitle}
            </p>

            <p className="mx-auto mt-5 max-w-sm text-sm font-light leading-relaxed text-stone-600">
              {copy.dressCodeDescription}
            </p>

            <p className="mt-7 font-display text-2xl uppercase tracking-[0.28em] text-navy sm:text-[1.7rem]">
              {copy.dressCodeTheme}
            </p>

            {copy.dressCodeNote && (
              <p className="mt-3 font-display text-base italic text-royal/90 sm:text-lg">
                {copy.dressCodeNote.startsWith("(")
                  ? copy.dressCodeNote
                  : `(${copy.dressCodeNote})`}
              </p>
            )}

            <div className="dresscode-figure mx-auto mt-8">
              {event.dressCodeImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={event.dressCodeImage}
                  alt="Dress code reference"
                  className="dresscode-figure-img mx-auto h-auto w-full max-w-[18rem] object-contain sm:max-w-[20rem]"
                />
              ) : (
                <div className="dresscode-figure-placeholder mx-auto flex min-h-[14rem] max-w-[18rem] items-center justify-center px-6 text-center text-xs leading-relaxed text-stone-400 sm:max-w-[20rem]">
                  Upload a combined couple outfit image in Admin Settings
                </div>
              )}
            </div>

            {combinedLooks && (
              <p className="mx-auto mt-7 max-w-xs font-display text-xl leading-snug text-navy sm:text-2xl">
                {combinedLooks}
              </p>
            )}

            <div className="dresscode-ornament mx-auto mt-8 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-royal/40" />
              <span className="h-1.5 w-1.5 rounded-full bg-royal/50" />
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-royal/40" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
