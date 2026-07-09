"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import { WEDDING } from "@/lib/wedding-config";

export default function GallerySection() {
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
    <section id="gallery" className="invitation-section bg-parchment px-6 py-28">
      <div className="mx-auto max-w-6xl lg:max-w-7xl">
        <SectionHeader
          label="Gallery"
          title="Prewedding Photos"
          subtitle="Beautiful moments from our journey together that we'd love to share with you."
        />

        <div className="columns-2 gap-4 md:columns-3">
          {WEDDING.gallery.map((photo, i) => (
            <Reveal key={photo.src} direction="scale" delay={i * 80}>
              <button
                onClick={() => setLightbox(photo.src)}
                className="gallery-item group relative mb-4 block w-full overflow-hidden rounded-2xl ring-1 ring-royal/10"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-navy/0 transition-all duration-500 group-hover:bg-navy/40">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/0 transition-all duration-500 group-hover:scale-100 group-hover:bg-white/20">
                    <ZoomIn className="h-5 w-5 text-white opacity-0 transition-all duration-500 group-hover:opacity-100" />
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center p-6 transition-all duration-400 ${
            lightboxVisible
              ? "bg-navy-900/95 backdrop-blur-md"
              : "bg-navy-900/0 backdrop-blur-none"
          }`}
          onClick={closeLightbox}
        >
          <button
            className="absolute right-6 top-6 rounded-full p-3 text-white/50 transition-all hover:bg-white/10 active:scale-90"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox}
            alt="Prewedding"
            className={`max-h-[85vh] max-w-full rounded-2xl object-contain shadow-card-lg transition-all duration-500 ease-out-expo ${
              lightboxVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
