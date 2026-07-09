"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";

export default function GallerySection() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section id="gallery" className="invitation-section bg-parchment px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
            Galeri
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy md:text-4xl">
            Foto Prewedding
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-stone-500">
            Momen indah perjalanan cinta kami yang ingin kami bagikan dengan Anda.
          </p>
        </header>

        <div className="columns-2 gap-4 md:columns-3">
          {WEDDING.gallery.map((photo, i) => (
            <button
              key={photo.src}
              onClick={() => setLightbox(photo.src)}
              className={`group relative mb-4 block w-full overflow-hidden rounded-xl ${
                i % 3 === 0 ? "break-inside-avoid" : ""
              }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-navy/0 transition group-hover:bg-navy/30">
                <ZoomIn className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-900/95 p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 rounded-full p-2 text-white/60 hover:bg-white/10"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox}
            alt="Prewedding"
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
