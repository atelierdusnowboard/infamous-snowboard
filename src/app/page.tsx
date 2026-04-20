import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ManifestoSection } from "@/components/home/ManifestoSection";
import { LifestyleGrid } from "@/components/home/LifestyleGrid";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/queries/products";
import type { ProductWithImages } from "@/types/product";

export default async function HomePage() {
  let featuredProducts: ProductWithImages[] = [];
  try {
    featuredProducts = await getFeaturedProducts();
  } catch {
    // Supabase not configured yet — use empty array
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="absolute top-0 left-0 right-0 z-40">
        <Header />
      </div>

      <main className="flex-1">
        <HeroSection />

        <div className="relative">
          <FeaturedProducts products={featuredProducts} />
          <ManifestoSection />
          <LifestyleGrid />

          {/* Blog CTA */}
          <section className="py-16 border-t border-black">
            <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest">
                  From The Mountain
                </h2>
                <p className="text-sm text-black/60 mt-2 uppercase tracking-widest">
                  Rider stories, board breakdowns, and field notes.
                </p>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:!text-white transition-colors shrink-0"
              >
                Read The Blog &rarr;
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
