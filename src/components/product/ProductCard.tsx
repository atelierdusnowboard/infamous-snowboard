import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/format";
import type { ProductWithImages } from "@/types/product";
import { cn } from "@/lib/utils/cn";

interface ProductCardProps {
  product: ProductWithImages;
  className?: string;
}

function getImageUrl(product: ProductWithImages): string {
  const primary = product.product_images.find((img) => img.is_primary);
  const img = primary ?? product.product_images[0];
  if (!img) {
    // Fallback to local board image
    const slug = product.slug;
    const imageMap: Record<string, string> = {
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
    return imageMap[slug] ?? "/boards/2026 Infamous Gun-01.JPG";
  }
  if (img.storage_path.startsWith("http")) return img.storage_path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img.storage_path}`;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const imageUrl = getImageUrl(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group block border border-black bg-white",
        "hover:shadow-none transition-all duration-200",
        className
      )}
    >
      {/* Image — 808×1280 portrait ratio */}
      <div className="relative overflow-hidden bg-white" style={{ aspectRatio: '808/1280' }}>
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain grayscale transition-transform duration-300 group-hover:scale-105"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        {/* Add to cart button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <div className="bg-black text-white text-center py-3 text-xs font-bold uppercase tracking-widest">
            Add to Cart
          </div>
        </div>
        {product.is_featured && (
          <div className="absolute top-3 left-3 bg-black text-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 border-t border-black">
        <h3 className="text-sm font-black uppercase tracking-widest truncate">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="text-xs text-black/60 mt-1 truncate">{product.tagline}</p>
        )}
        <p className="text-sm font-bold mt-2">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
