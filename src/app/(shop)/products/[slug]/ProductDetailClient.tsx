"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils/format";
import { ProductSizeSelector } from "@/components/product/ProductSizeSelector";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
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
    <div className="space-y-8">
      {/* Category tag */}
      {product.categories && (
        <p className="text-xs font-bold uppercase tracking-widest text-black/40">
          {product.categories.name}
        </p>
      )}

      {/* Name */}
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest leading-none">
        {product.name}
      </h1>

      {/* Tagline */}
      {product.tagline && (
        <p className="text-sm uppercase tracking-widest text-black/60">
          {product.tagline}
        </p>
      )}

      {/* Price */}
      <p className="text-2xl font-black">{formatPrice(displayPrice)}</p>

      {/* Description */}
      {product.description && (
        <p className="text-sm leading-relaxed text-black/80">
          {product.description}
        </p>
      )}

      {/* Size selector */}
      {product.product_variants && product.product_variants.length > 0 && (
        <ProductSizeSelector
          variants={product.product_variants}
          selectedVariantId={selectedVariant?.id ?? null}
          onSelect={setSelectedVariant}
        />
      )}

      {/* CTA row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            selectedVariant={selectedVariant}
            basePrice={product.price}
            imageUrl={imageUrl}
          />
        </div>
        <AddToWishlistButton productId={product.id} />
      </div>

      {/* Shipping note */}
      <p className="text-xs text-black/40 uppercase tracking-widest">
        Free shipping on orders over 300€
      </p>
    </div>
  );
}
