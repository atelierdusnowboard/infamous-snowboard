"use client";

import { ShippingForm } from "./ShippingForm";
import { OrderSummary } from "./OrderSummary";

export function CheckoutForm() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
      <div className="lg:col-span-2">
        <ShippingForm />
      </div>
      <div className="lg:col-span-1">
        <OrderSummary />
      </div>
    </div>
  );
}
