"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function LifestyleGrid({ images }: { images: string[] }) {
  const [displayed, setDisplayed] = useState(images.slice(0, 8));

  useEffect(() => {
    if (images.length > 0) setDisplayed(shuffle(images).slice(0, 8));
  }, [images]);

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
            <div
              key={src}
              className={`relative overflow-hidden bg-white ${i === 0 ? "md:row-span-2" : "aspect-square"}`}
              style={i === 0 ? { aspectRatio: "1/2" } : undefined}
            >
              <Image
                src={src}
                alt="Infamous rider"
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
