"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { useToast } from "@/components/ui/Toast";
import type { ProductVariant } from "@/types/database";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productSlug: string;
  selectedVariant: ProductVariant | null;
  basePrice: number;
  imageUrl: string | null;
}

export function AddToCartButton({
  productId,
  productName,
  productSlug,
  selectedVariant,
  basePrice,
  imageUrl,
}: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const { setCartOpen } = useUIStore();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (!selectedVariant) {
      toast("Please select a size", "error");
      return;
    }

    addItem({
      productId,
      variantId: selectedVariant.id,
      name: productName,
      slug: productSlug,
      price: basePrice + selectedVariant.price_delta,
      size: selectedVariant.size,
      image: imageUrl,
      quantity: 1,
    });

    setAdded(true);
    toast(`${productName} added to cart`, "success");
    setTimeout(() => {
      setAdded(false);
      setCartOpen(true);
    }, 600);
  }

  return (
    <Button
      onClick={handleAddToCart}
      size="lg"
      className="w-full h-12"
    >
      {added ? "Added!" : "Add to Cart"}
    </Button>
  );
}
