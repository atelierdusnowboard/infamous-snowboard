"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";

const PAGE_SIZE = 11;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPageImages(images: string[], page: number): string[] {
  if (images.length <= PAGE_SIZE) return images;

  const start = page * PAGE_SIZE;
  return Array.from({ length: PAGE_SIZE }, (_, index) => {
    return images[(start + index) % images.length];
  });
}

export function LifestyleGrid({ images }: { images: string[] }) {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    setGalleryImages(shuffle(images.map((src) => encodeURI(src))));
    setPage(0);
  }, [images]);

  const displayed = useMemo(() => getPageImages(galleryImages, page), [galleryImages, page]);
  const pageCount = Math.max(1, Math.ceil(galleryImages.length / PAGE_SIZE));
  const hasMultiplePages = galleryImages.length > PAGE_SIZE;

  const showPreviousPage = useCallback(() => {
    setPage((current) => (current - 1 + pageCount) % pageCount);
  }, [pageCount]);

  const showNextPage = useCallback(() => {
    setPage((current) => (current + 1) % pageCount);
  }, [pageCount]);

  const activeIndex = activeImage ? galleryImages.indexOf(activeImage) : -1;
  const showPreviousImage = useCallback(() => {
    setActiveImage((current) => {
      if (!current || galleryImages.length === 0) return current;
      const index = galleryImages.indexOf(current);
      return galleryImages[(index - 1 + galleryImages.length) % galleryImages.length];
    });
  }, [galleryImages]);

  const showNextImage = useCallback(() => {
    setActiveImage((current) => {
      if (!current || galleryImages.length === 0) return current;
      const index = galleryImages.indexOf(current);
      return galleryImages[(index + 1) % galleryImages.length];
    });
  }, [galleryImages]);

  useEffect(() => {
    if (!activeImage) return;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage, showNextImage, showPreviousImage]);

  if (displayed.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-t border-black">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest">
            On Snow
          </h2>
          <p className="text-xs text-black/40 uppercase tracking-widest hidden md:block">
            2025/2026 Season
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black">
          {displayed.map((src, i) => (
            <button
              key={`${page}-${src}-${i}`}
              type="button"
              onClick={() => setActiveImage(src)}
              className={`relative overflow-hidden bg-white cursor-pointer group ${i === 0 ? "md:row-span-2" : "aspect-square"}`}
              style={i === 0 ? { aspectRatio: "1/2" } : undefined}
              aria-label="Afficher la photo en grand"
            >
              <Image
                src={src}
                alt="Infamous rider"
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
              />
            </button>
          ))}
        </div>

        {hasMultiplePages && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={showPreviousPage}
              className="h-10 w-10 border border-black flex items-center justify-center text-sm font-bold hover:bg-black hover:!text-white transition-colors"
              aria-label="Images précédentes"
            >
              ←
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-black/40">
              {page + 1} / {pageCount}
            </p>
            <button
              type="button"
              onClick={showNextPage}
              className="h-10 w-10 border border-black flex items-center justify-center text-sm font-bold hover:bg-black hover:!text-white transition-colors"
              aria-label="Images suivantes"
            >
              →
            </button>
          </div>
        )}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8"
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 z-20 h-10 w-10 border border-white/40 text-white flex items-center justify-center text-xl hover:bg-white hover:!text-black transition-colors"
            aria-label="Fermer l'image"
          >
            ×
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousImage();
                }}
                className="absolute left-4 top-1/2 z-20 h-10 w-10 -translate-y-1/2 border border-white/40 text-white flex items-center justify-center text-sm font-bold hover:bg-white hover:!text-black transition-colors"
                aria-label="Image précédente"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextImage();
                }}
                className="absolute right-4 top-1/2 z-20 h-10 w-10 -translate-y-1/2 border border-white/40 text-white flex items-center justify-center text-sm font-bold hover:bg-white hover:!text-black transition-colors"
                aria-label="Image suivante"
              >
                →
              </button>
            </>
          )}

          <div
            className="relative h-[82vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage}
              alt="Infamous rider"
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {activeIndex >= 0 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-white/60">
              {activeIndex + 1} / {galleryImages.length}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
