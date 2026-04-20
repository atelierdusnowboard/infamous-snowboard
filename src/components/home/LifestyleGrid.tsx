import Image from "next/image";

const STORAGE = "https://cawrucyjiyrsctbqewtt.supabase.co/storage/v1/object/public/lifestyle";

const lifestyleImages = [
  { src: `${STORAGE}/_DSC3365 - Grande.jpeg`,   alt: "Infamous rider" },
  { src: `${STORAGE}/_DSC3365-2 - Grande.jpeg`, alt: "Infamous rider" },
  { src: `${STORAGE}/_DSC3407 - Grande.jpeg`,   alt: "Infamous snowboard" },
  { src: `${STORAGE}/_DSC3421 - Grande.jpeg`,   alt: "Infamous rider" },
  { src: `${STORAGE}/_DSC3432 - Grande.jpeg`,   alt: "Infamous snowboard" },
  { src: `${STORAGE}/_DSC3441 - Grande.jpeg`,   alt: "Infamous rider" },
  { src: `${STORAGE}/_DSC3454 - Grande.jpeg`,   alt: "Infamous snowboard" },
  { src: `${STORAGE}/_DSC3461 - Grande.jpeg`,   alt: "Infamous rider" },
];

export function LifestyleGrid() {
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
          {lifestyleImages.slice(0, 4).map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden bg-white ${i === 0 ? "md:row-span-2" : ""}`}
              style={{ aspectRatio: i === 0 ? "1/2" : "1/1" }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          ))}
          {lifestyleImages.slice(4).map((img, i) => (
            <div key={i + 4} className="relative aspect-square overflow-hidden bg-white">
              <Image
                src={img.src}
                alt={img.alt}
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
