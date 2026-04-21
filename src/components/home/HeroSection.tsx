import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-black flex flex-col items-start justify-end overflow-hidden">
      {/* Background lifestyle image */}
      <div className="absolute inset-0">
        <Image
          src="https://cawrucyjiyrsctbqewtt.supabase.co/storage/v1/object/public/lifestyle/_DSC3365-2 - Grande.jpeg"
          alt="Infamous Snowboard rider"
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale opacity-40"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 pb-16 md:pb-24 max-w-screen-xl w-full">
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-6">
          Est. &mdash; Infamous Snowboard
        </p>
        <h1 className="text-white text-5xl md:text-7xl lg:text-9xl font-black uppercase tracking-wider leading-none mb-8">
          Less Noise.<br />More Shapes.
        </h1>
        <p className="text-white/60 text-sm md:text-base max-w-sm mb-10 uppercase tracking-widest">
          We build boards for riders who don&apos;t need a backstory.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/shop">
            <Button size="lg" className="bg-white text-black border border-white hover:bg-transparent hover:text-white">
              Shop Boards
            </Button>
          </Link>
          <Link href="/blog">
            <Button
              variant="ghost"
              size="lg"
              className="bg-transparent text-white border border-white hover:bg-white hover:!text-black"
            >
              About Infamous
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-0 right-0 p-6 md:p-12 z-10">
        <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em] text-right">
          2026 Collection
        </p>
      </div>
    </section>
  );
}
