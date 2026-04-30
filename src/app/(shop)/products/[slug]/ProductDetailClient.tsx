"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils/format";
import { ProductSizeSelector } from "@/components/product/ProductSizeSelector";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
import { ShareButtons } from "@/components/blog/ShareButtons";
import type { ProductWithVariants } from "@/types/product";
import type { ProductVariant } from "@/types/database";

interface ProductDetailClientProps {
  product: ProductWithVariants;
  imageUrl: string | null;
}

export default function ProductDetailClient({
  product,
  imageUrl,
}: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  const displayPrice = selectedVariant
    ? product.price + selectedVariant.price_delta
    : product.price;

  return (
    <div>
      {/* Category tag */}
      {product.categories && (
        <p className="text-xs font-bold uppercase tracking-widest text-black/40">
          {product.categories.name}
        </p>
      )}

      {/* Name */}
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest leading-none mt-3">
        {product.name}
      </h1>

      {/* Tagline */}
      {product.tagline && (
        <p className="text-sm uppercase tracking-widest text-black/60 mt-4">
          {product.tagline}
        </p>
      )}

      {/* Price */}
      <p className="text-2xl font-black mt-6">{formatPrice(displayPrice)}</p>

      {/* Description */}
      {product.description && (
        <p className="text-sm leading-relaxed text-black/70 mt-5">
          {product.description}
        </p>
      )}

      {/* Size selector */}
      {product.product_variants && product.product_variants.length > 0 && (
        <div className="mt-12">
          <ProductSizeSelector
            variants={product.product_variants}
            selectedVariantId={selectedVariant?.id ?? null}
            onSelect={setSelectedVariant}
          />
        </div>
      )}

      {/* CTA row */}
      <div className="mt-12 pt-10 border-t border-black">
        <div className="flex gap-3">
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            selectedVariant={selectedVariant}
            basePrice={product.price}
            imageUrl={imageUrl}
          />
          <AddToWishlistButton productId={product.id} />
        </div>

        {/* Shipping note */}
        <p className="text-xs text-black/40 uppercase tracking-widest mt-5">
          Free shipping on orders over 300€
        </p>
      </div>

      {/* Share */}
      <ShareButtons
        url={`https://www.infamous-snowboard.com/products/${product.slug}`}
        title={product.name}
        imageUrl={imageUrl ?? undefined}
        className="flex items-center gap-3 mt-12 pt-8 border-t border-black/20"
      />
    </div>
  );
}
