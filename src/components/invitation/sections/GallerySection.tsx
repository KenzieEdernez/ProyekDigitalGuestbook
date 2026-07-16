"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import type { GalleryImage } from "@/types/wedding";

interface GallerySectionProps {
  gallery: GalleryImage[];
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  useEffect(() => {
    if (lightbox) {
      requestAnimationFrame(() => setLightboxVisible(true));
      document.body.style.overflow = "hidden";
    } else {
      setLightboxVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const closeLightbox = () => {
    setLightboxVisible(false);
    setTimeout(() => setLightbox(null), 300);
  };

  return (
    <section id="gallery" className="invitation-section invitation-section-pad bg-parchment">
      <div className="mx-auto max-w-6xl lg:max-w-7xl">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {gallery.map((photo, i) => {
              const isPortrait = photo.orientation === "portrait";

              return (
                <Reveal
                  key={photo.id}
                  direction="scale"
                  delay={i * 80}
                  className={
                    isPortrait ? "sm:row-span-2 lg:row-span-2" : "sm:col-span-2 lg:col-span-2"
                  }
                >
                  <button
                    onClick={() => setLightbox(photo.src)}
                    className={`gallery-item group relative block h-full w-full overflow-hidden rounded-2xl ring-1 ring-royal/10 ${
                      isPortrait
                        ? "aspect-[3/4] sm:aspect-auto sm:min-h-[320px] lg:min-h-[420px]"
                        : "aspect-[16/10] sm:aspect-auto sm:min-h-[220px]"
                    }`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className={`h-full w-full transition-transform duration-700 ease-out-expo group-hover:scale-105 ${
                        isPortrait ? "invitation-portrait-photo" : "invitation-photo"
                      }`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-navy/0 transition-all duration-500 group-hover:bg-navy/40 group-active:bg-navy/30">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 opacity-100 transition-all duration-500 sm:bg-white/0 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:bg-white/20 sm:group-hover:opacity-100">
                        <ZoomIn className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 transition-all duration-400 ${
            lightboxVisible
              ? "bg-navy-900/95 backdrop-blur-md"
              : "bg-navy-900/0 backdrop-blur-none"
          }`}
          onClick={closeLightbox}
        >
          <button
            className="absolute right-4 top-4 rounded-full p-3 text-white/50 transition-all hover:bg-white/10 active:scale-90 sm:right-6 sm:top-6"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox}
            alt="Prewedding"
            className={`max-h-[82dvh] w-full max-w-full rounded-2xl object-contain shadow-card-lg transition-all duration-500 ease-out-expo sm:max-h-[85vh] ${
              lightboxVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
