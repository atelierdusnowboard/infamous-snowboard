"use client";

import { useState, useTransition } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { validatePromoCode, type AppliedPromo } from "@/lib/actions/promo";
import { useCartStore } from "@/lib/store/cart";
import { useToast } from "@/components/ui/Toast";

interface ShippingFormProps {
  appliedPromo: AppliedPromo | null;
  onPromoChange: (promo: AppliedPromo | null) => void;
}

export function ShippingForm({ appliedPromo, onPromoChange }: ShippingFormProps) {
  const items = useCartStore((s) => s.items);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isValidatingPromo, startPromoTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((val, key) => {
      data[key] = val as string;
    });

    startTransition(async () => {
      const result = await createCheckoutSession(items, data, appliedPromo?.id);
      if ("error" in result) {
        toast(result.error, "error");
        setErrors({ general: result.error });
      } else {
        window.location.href = result.url;
      }
    });
  }

  async function handleApplyPromo() {
    setPromoError("");
    startPromoTransition(async () => {
      const result = await validatePromoCode(promoInput);
      if ("error" in result) {
        setPromoError(result.error);
      } else {
        onPromoChange(result);
        setPromoInput("");
      }
    });
  }

  function handleRemovePromo() {
    onPromoChange(null);
    setPromoInput("");
    setPromoError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest mb-6">
          Shipping Information
        </h2>

        <div className="space-y-4">
          <Input
            name="name"
            label="Full Name"
            required
            placeholder="Jean-Paul Martin"
            error={errors.name}
          />
          <Input
            name="email"
            label="Email"
            type="email"
            required
            placeholder="you@example.com"
            error={errors.email}
          />
          <Input
            name="address"
            label="Address"
            required
            placeholder="123 Rue des Alpes"
            error={errors.address}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="city"
              label="City"
              required
              placeholder="Chamonix"
              error={errors.city}
            />
            <Input
              name="postal_code"
              label="Postal Code"
              required
              placeholder="74400"
              error={errors.postal_code}
            />
          </div>
          <Input
            name="country"
            label="Country"
            required
            placeholder="France"
            defaultValue="France"
            error={errors.country}
          />
          <Textarea
            name="notes"
            label="Order Notes (optional)"
            rows={3}
            placeholder="Any special instructions..."
          />
        </div>
      </div>

      <div className="border-t border-black pt-6">
        <p className="text-xs font-black uppercase tracking-widest mb-3">
          Discount Code
        </p>

        {appliedPromo ? (
          <div className="flex items-center justify-between px-4 py-3 border border-black bg-black text-white">
            <div>
              <span className="text-xs font-black uppercase tracking-widest">
                {appliedPromo.code}
              </span>
              <span className="text-xs text-white/60 ml-2">
                {appliedPromo.percentOff
                  ? `−${appliedPromo.percentOff}%`
                  : `−${appliedPromo.amountOff}€`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value.toUpperCase());
                setPromoError("");
              }}
              placeholder="WINTER25"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyPromo();
                }
              }}
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={!promoInput.trim() || isValidatingPromo}
              className="px-4 py-3 border border-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isValidatingPromo ? "..." : "Apply"}
            </button>
          </div>
        )}

        {promoError && (
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-black">
            {promoError}
          </p>
        )}
      </div>

      {errors.general && (
        <p className="text-xs font-bold uppercase text-black">{errors.general}</p>
      )}

      <Button
        type="submit"
        loading={isPending}
        size="lg"
        className="w-full"
        disabled={items.length === 0}
      >
        {items.length === 0 ? "Cart is empty" : "Payer"}
      </Button>
    </form>
  );
}
