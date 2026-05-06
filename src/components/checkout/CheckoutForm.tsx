"use client";

import { useState } from "react";
import { ShippingForm } from "./ShippingForm";
import { OrderSummary } from "./OrderSummary";
import type { AppliedPromo } from "@/lib/actions/promo";

export function CheckoutForm() {
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
      <div className="lg:col-span-2">
        <ShippingForm appliedPromo={appliedPromo} onPromoChange={setAppliedPromo} />
      </div>
      <div className="lg:col-span-1">
        <OrderSummary appliedPromo={appliedPromo} />
      </div>
    </div>
  );
}
