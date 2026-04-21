"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/types/database";
import { DEFAULT_FALLBACK, getProductImageUrl } from "@/lib/utils/image";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  fallbackImage?: string;
}

function getImageSrc(img: ProductImage | undefined, fallback: string): string {
  if (!img) return fallback;
  return getProductImageUrl(img.storage_path) ?? fallback;
}

export function ProductImageGallery({
  images,
  productName,
  fallbackImage = DEFAULT_FALLBACK,
}: ProductImageGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const active = sorted[activeIdx];
  const total = sorted.length;

  const prev = useCallback(() => {
    setActiveIdx((i) => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setActiveIdx((i) => (i + 1) % total);
  }, [total]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="relative border border-black bg-white overflow-hidden"
        style={{ aspectRatio: "808/1280" }}
      >
        <Image
          src={getImageSrc(active, fallbackImage)}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain grayscale"
          priority
        />

        {/* Arrows — only when multiple images */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center group"
            >
              <span className="bg-white border border-black w-8 h-8 flex items-center justify-center text-black text-sm font-bold transition-colors group-hover:bg-black group-hover:!text-white">
                ←
              </span>
            </button>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center group"
            >
              <span className="bg-white border border-black w-8 h-8 flex items-center justify-center text-black text-sm font-bold transition-colors group-hover:bg-black group-hover:!text-white">
                →
              </span>
            </button>

            {/* Counter */}
            <div className="absolute bottom-3 right-3 bg-white border border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              {activeIdx + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-2">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "relative w-16 h-16 border border-black overflow-hidden shrink-0 transition-opacity duration-150",
                idx === activeIdx
                  ? "opacity-100 outline outline-2 outline-black outline-offset-1"
                  : "opacity-50 hover:opacity-80"
              )}
            >
              <Image
                src={getImageSrc(img, fallbackImage)}
                alt={`${productName} vue ${idx + 1}`}
                fill
                sizes="64px"
                className="object-contain grayscale"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
