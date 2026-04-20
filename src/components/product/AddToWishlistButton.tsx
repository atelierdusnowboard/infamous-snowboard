"use client";

import { useState, useTransition } from "react";
import { addToWishlist, removeFromWishlist } from "@/lib/actions/cart";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

interface AddToWishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
}

export function AddToWishlistButton({
  productId,
  initialWishlisted = false,
}: AddToWishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleToggle() {
    startTransition(async () => {
      if (wishlisted) {
        const result = await removeFromWishlist(productId);
        if (result?.error) {
          toast(result.error, "error");
        } else {
          setWishlisted(false);
          toast("Removed from wishlist", "info");
        }
      } else {
        const result = await addToWishlist(productId);
        if (result?.error) {
          toast(result.error === "Must be logged in" ? "Sign in to save items" : result.error, "error");
        } else {
          setWishlisted(true);
          toast("Added to wishlist", "success");
        }
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex items-center justify-center",
        "w-12 h-12 border border-black",
        "transition-colors duration-150",
        "disabled:opacity-50",
        wishlisted
          ? "bg-black text-white hover:bg-white hover:text-black"
          : "bg-white text-black hover:bg-black hover:!text-white"
      )}
    >
      <svg
        className="w-5 h-5"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="square"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
