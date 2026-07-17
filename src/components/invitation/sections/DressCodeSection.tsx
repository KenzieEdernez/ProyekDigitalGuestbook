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
      className="invitation-section invitation-section-pad relative overflow-hidden bg-champagne"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-35" />

      <div className="relative mx-auto max-w-4xl lg:max-w-5xl">
        <Reveal direction="up">
          <div className="overflow-hidden rounded-[2rem] border border-royal/15 bg-white/75 p-6 shadow-card backdrop-blur-sm sm:p-10">
            <div className="text-center">
              <p className="font-display text-3xl text-royal sm:text-4xl">
                {copy.dressCodeTitle}
              </p>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-stone-600">
                {copy.dressCodeDescription}
              </p>
              <p className="mt-6 font-display text-2xl uppercase tracking-[0.2em] text-navy sm:text-3xl">
                {copy.dressCodeTheme}
              </p>
              {copy.dressCodeNote && (
                <p className="mt-2 text-sm italic text-royal">{copy.dressCodeNote}</p>
              )}
            </div>

            {event.dressCodeImage ? (
              <Reveal direction="scale" delay={120}>
                <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-2xl border border-royal/10 bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.dressCodeImage}
                    alt="Dress code reference"
                    className="h-auto w-full object-cover"
                  />
                </div>
              </Reveal>
            ) : (
              <div className="mx-auto mt-8 flex h-56 max-w-xl items-center justify-center rounded-2xl border border-dashed border-royal/20 bg-cream/80 text-sm text-stone-400">
                Dress code reference image can be uploaded in Admin Settings
              </div>
            )}

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Reveal direction="up" delay={180}>
                <div className="rounded-2xl border border-royal/10 bg-cream/70 p-6 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
                    Ladies
                  </p>
                  <p className="mt-3 font-display text-xl leading-relaxed text-navy">
                    {event.dressLadies}
                  </p>
                </div>
              </Reveal>
              <Reveal direction="up" delay={240}>
                <div className="rounded-2xl border border-royal/10 bg-cream/70 p-6 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
                    Gentlemen
                  </p>
                  <p className="mt-3 font-display text-xl leading-relaxed text-navy">
                    {event.dressGentlemen}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
