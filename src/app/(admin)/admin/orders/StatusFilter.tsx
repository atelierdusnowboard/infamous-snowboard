"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { OrderStatus } from "@/lib/supabase/types";

const STATUSES: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("status") ?? "";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {STATUSES.map(({ value, label }) => (
        <button
          key={value || "all"}
          onClick={() => select(value)}
          className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-black transition-colors ${
            active === value
              ? "bg-black text-white"
              : "hover:bg-black hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
