"use client";

import { useState, useTransition } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { useCartStore } from "@/lib/store/cart";
import { useToast } from "@/components/ui/Toast";

export function ShippingForm() {
  const items = useCartStore((s) => s.items);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((val, key) => {
      data[key] = val as string;
    });

    startTransition(async () => {
      const result = await createCheckoutSession(items, data);
      if ("error" in result) {
        toast(result.error, "error");
        setErrors({ general: result.error });
      } else {
        // Redirect to Stripe Checkout hosted page
        window.location.href = result.url;
      }
    });
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
