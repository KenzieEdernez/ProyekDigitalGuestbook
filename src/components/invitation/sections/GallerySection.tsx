"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import type { GalleryImage } from "@/types/wedding";

interface GallerySectionProps {
  gallery: GalleryImage[];
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [gallery.length]);

  useEffect(() => {
    if (gallery.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % gallery.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [gallery.length, paused]);

  const goTo = (next: number) => {
    if (!gallery.length) return;
    setIndex((next + gallery.length) % gallery.length);
  };

  const current = gallery[index];

  return (
    <section id="gallery" className="invitation-section invitation-section-pad bg-parchment">
      <div className="mx-auto max-w-5xl lg:max-w-6xl">
        <SectionHeader
          label="Gallery"
          title="Prewedding Photos"
          subtitle="Beautiful moments from our journey together that we'd love to share with you."
        />

        {gallery.length === 0 ? (
          <p className="text-center text-sm text-stone-500">
            Photos will appear here once added from admin settings.
          </p>
        ) : (
          <Reveal direction="up" duration={800}>
            <div
              className="relative mx-auto w-full max-w-3xl"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
              <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl bg-navy/[0.03] ring-1 ring-royal/10 sm:aspect-[16/11]">
                {gallery.map((photo, i) => {
                  const isActive = i === index;
                  const isPortrait = photo.orientation === "portrait";
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={photo.id}
                      src={photo.src}
                      alt={photo.alt}
                      className={`absolute inset-0 m-auto transition-opacity duration-700 ease-out-expo ${
                        isPortrait
                          ? "h-full max-h-full w-auto max-w-full object-contain"
                          : "h-auto max-h-full w-full object-contain"
                      } ${isActive ? "opacity-100" : "opacity-0"}`}
                    />
                  );
                })}

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      onClick={() => goTo(index - 1)}
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-navy/35 text-white backdrop-blur-sm transition hover:bg-navy/55 active:scale-95"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next photo"
                      onClick={() => goTo(index + 1)}
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-navy/35 text-white backdrop-blur-sm transition hover:bg-navy/55 active:scale-95"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  {gallery.map((photo, i) => (
                    <button
                      key={photo.id}
                      type="button"
                      aria-label={`Go to photo ${i + 1}`}
                      onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === index
                          ? "w-7 bg-royal"
                          : "w-1.5 bg-stone-300 hover:bg-stone-400"
                      }`}
                    />
                  ))}
                </div>
              )}

              {current ? (
                <p className="mt-3 text-center text-xs text-stone-400">
                  {index + 1} / {gallery.length}
                </p>
              ) : null}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
