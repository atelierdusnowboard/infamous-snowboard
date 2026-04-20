"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/types/database";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  fallbackImage?: string;
}

function getImageSrc(
  img: ProductImage | undefined,
  fallback: string
): string {
  if (!img) return fallback;
  if (img.storage_path.startsWith("http")) return img.storage_path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img.storage_path}`;
}

export function ProductImageGallery({
  images,
  productName,
  fallbackImage = "/boards/2026 Infamous Gun-01.JPG",
}: ProductImageGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const active = sorted[activeIdx];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square border border-black bg-white overflow-hidden">
        <Image
          src={getImageSrc(active, fallbackImage)}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover grayscale"
          priority
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "relative w-16 h-16 border border-black overflow-hidden shrink-0",
                "transition-opacity duration-150",
                idx === activeIdx
                  ? "opacity-100 outline outline-2 outline-black outline-offset-1"
                  : "opacity-50 hover:opacity-80"
              )}
            >
              <Image
                src={getImageSrc(img, fallbackImage)}
                alt={`${productName} view ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover grayscale"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
