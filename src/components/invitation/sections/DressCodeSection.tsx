"use client";

import DressCodeArtwork from "@/components/invitation/DressCodeArtwork";
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
    .map((value) => value?.trim())
    .filter(Boolean)
    .join("  ·  ");

  return (
    <section
      id="dresscode"
      className="invitation-section invitation-section-pad dresscode-section relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-45" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-royal/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-8">
        <Reveal direction="up" duration={900}>
          <div className="dresscode-layout">
            <div className="dresscode-copy">
              <div className="dresscode-crest" aria-hidden>
                <span className="dresscode-crest-ring" />
                <span className="dresscode-crest-dot">✦</span>
              </div>

              <p className="mt-5 font-display text-[2.4rem] font-light leading-none tracking-wide text-royal md:text-5xl lg:text-[3.4rem]">
                {copy.dressCodeTitle}
              </p>

              <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed text-stone-500 md:mx-0 md:max-w-sm md:text-[0.95rem]">
                {copy.dressCodeDescription}
              </p>

              <div className="mx-auto my-6 h-px w-16 bg-gradient-to-r from-transparent via-royal/50 to-transparent md:mx-0" />

              <p className="font-display text-[1.45rem] uppercase tracking-[0.28em] text-navy md:text-2xl">
                {copy.dressCodeTheme}
              </p>
            </div>

            <div className="dresscode-visual">
              {event.dressCodeImage ? (
                <DressCodeArtwork src={event.dressCodeImage} />
              ) : (
                <div className="dresscode-visual-empty">
                  Upload a dress code outfit image in Admin Settings
                </div>
              )}

              {combinedLooks && (
                <p className="dresscode-looks-caption font-display">
                  {combinedLooks}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
