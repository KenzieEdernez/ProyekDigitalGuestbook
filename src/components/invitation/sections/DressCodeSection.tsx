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
  return (
    <section
      id="dresscode"
      className="invitation-section invitation-section-pad dresscode-section relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-30" />

      <div className="relative mx-auto max-w-lg px-4 sm:max-w-xl sm:px-0">
        <Reveal direction="up">
          <div className="dresscode-frame">
            <div className="dresscode-border dresscode-border-left" aria-hidden />
            <div className="dresscode-border dresscode-border-right" aria-hidden />

            <div className="dresscode-arch">
              <div className="dresscode-arch-inner px-6 pb-8 pt-10 text-center sm:px-8 sm:pb-10 sm:pt-12">
                <p className="font-display text-3xl text-royal sm:text-4xl">
                  {copy.dressCodeTitle}
                </p>

                <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
                  {copy.dressCodeDescription}
                </p>

                <p className="mt-6 font-display text-xl uppercase tracking-[0.22em] text-navy sm:text-2xl">
                  {copy.dressCodeTheme}
                </p>

                {copy.dressCodeNote && (
                  <p className="mt-2 font-display text-sm italic text-royal">
                    {copy.dressCodeNote}
                  </p>
                )}

                <div className="mx-auto mt-7 max-w-xs sm:max-w-sm">
                  {event.dressCodeImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={event.dressCodeImage}
                      alt="Dress code reference"
                      className="mx-auto h-auto w-full object-contain"
                    />
                  ) : (
                    <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-royal/20 bg-cream/60 px-4 text-xs leading-relaxed text-stone-400">
                      Upload a combined outfit reference image in Admin Settings
                    </div>
                  )}
                </div>

                <div className="dresscode-outfits mt-7 space-y-3 border-t border-royal/15 pt-6">
                  <p className="font-display text-lg leading-relaxed text-navy">
                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.35em] text-royal">
                      Ladies
                    </span>
                    {event.dressLadies}
                  </p>
                  <p className="font-display text-lg leading-relaxed text-navy">
                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.35em] text-royal">
                      Gentlemen
                    </span>
                    {event.dressGentlemen}
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
