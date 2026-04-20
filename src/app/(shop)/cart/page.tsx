import type { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="mb-8 border-b border-black pb-8">
        <h1 className="text-4xl font-black uppercase tracking-widest">
          Your Cart
        </h1>
      </div>
      <CartPageClient />
    </div>
  );
}
