import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getAllProductSlugs } from "@/lib/queries/products";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductSizeSelector } from "@/components/product/ProductSizeSelector";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { formatPrice } from "@/lib/utils/format";
import { generateProductMetadata } from "@/lib/utils/seo";
import ProductDetailClient from "./ProductDetailClient";
import type { ProductWithImages } from "@/types/product";

// Static fallback data when Supabase is not configured
const BOARD_IMAGE_MAP: Record<string, string> = {
  gun: "/boards/2026 Infamous Gun-01.JPG",
  "team-ripper": "/boards/2026 Infamous Ripper-01.JPG",
  "nervous-love": "/boards/2026 Infamous Nervous Love-01.JPG",
  "sanglier-sauvage": "/boards/2026 Infamous Sanglier Sauvage-01.JPG",
  "dreamy-panda": "/boards/2026 Infamous Dreamy Panda-01.JPG",
  "punk-cat": "/boards/2026 Infamous Punk Cat-01.JPG",
  "park-rat": "/boards/2026 Infamous Park Rat-01.JPG",
  "night-queen": "/boards/2026 Infamous Night Queen-01.JPG",
  "lipstick-cam": "/boards/2026 Infamous LipStick Cam-01.JPG",
  "kids-boards": "/boards/2026 Infamous Kids Boards-01.JPG",
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Return all board slugs as fallback
    return Object.keys(BOARD_IMAGE_MAP).map((slug) => ({ slug }));
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return {};
    return generateProductMetadata({
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      price: product.price,
      slug: product.slug,
    });
  } catch {
    return { title: slug };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product = null;
  try {
    product = await getProductBySlug(slug);
  } catch {
    // DB not configured
  }

  if (!product) {
    // Check if it's a known slug
    if (!BOARD_IMAGE_MAP[slug]) {
      notFound();
    }
    // Render static fallback
    return <StaticProductFallback slug={slug} />;
  }

  const primaryImage =
    product.product_images.find((i) => i.is_primary) ??
    product.product_images[0];
  const imageUrl = primaryImage?.storage_path
    ? primaryImage.storage_path.startsWith("http")
      ? primaryImage.storage_path
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${primaryImage.storage_path}`
    : BOARD_IMAGE_MAP[slug] ?? null;

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.description ?? undefined}
        price={product.price}
        slug={product.slug}
        imageUrl={imageUrl ?? undefined}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          { name: product.name, href: `/products/${product.slug}` },
        ]}
      />

      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-black/40 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Left: gallery */}
          <ProductImageGallery
            images={product.product_images}
            productName={product.name}
            fallbackImage={BOARD_IMAGE_MAP[slug]}
          />

          {/* Right: info */}
          <ProductDetailClient product={product} imageUrl={imageUrl} />
        </div>

        {/* Specs */}
        {product.specs && (
          <div className="mt-16 border-t border-black pt-12">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">
              Technical Specs
            </h2>
            <ProductSpecs specs={product.specs} />
          </div>
        )}
      </div>
    </>
  );
}

function StaticProductFallback({ slug }: { slug: string }) {
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const image = BOARD_IMAGE_MAP[slug];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <nav className="flex items-center gap-2 text-xs text-black/40 uppercase tracking-widest mb-8">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-black">{name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square border border-black overflow-hidden bg-white">
          {image && (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover grayscale"
            />
          )}
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-black uppercase tracking-widest">{name}</h1>
          <p className="text-sm text-black/60 uppercase tracking-widest">
            Connect Supabase to see full product details.
          </p>
        </div>
      </div>
    </div>
  );
}
