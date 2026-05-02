"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { OrderStatus } from "@/lib/supabase/types";

const STATUSES: { value: OrderStatus; label: string }[] = [
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
  const rawParam = searchParams.get("status");

  // null = default (confirmed), "all" = tout, sinon liste séparée par virgules
  const active: string[] =
    rawParam === null ? ["confirmed"] : rawParam === "all" ? [] : rawParam.split(",");

  function toggle(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const next = active.includes(value)
      ? active.filter((s) => s !== value)
      : [...active, value];

    if (next.length === 0) {
      params.set("status", "all");
    } else {
      params.set("status", next.join(","));
    }
    router.push(`?${params.toString()}`);
  }

  function selectAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", "all");
    router.push(`?${params.toString()}`);
  }

  const allActive = active.length === 0;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={selectAll}
        className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-black transition-colors ${
          allActive ? "bg-black text-white" : "hover:bg-black hover:text-white"
        }`}
      >
        Tous
      </button>
      {STATUSES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-black transition-colors ${
            active.includes(value)
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
