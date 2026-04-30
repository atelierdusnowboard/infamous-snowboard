"use client";

import { useState } from "react";
import { syncAllProductsToStripe } from "@/lib/actions/products";

export function SyncStripeButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ synced: number; errors: number } | null>(null);

  async function handleSync() {
    setState("loading");
    try {
      const res = await syncAllProductsToStripe();
      setResult(res);
      setState(res.errors === 0 ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSync}
        disabled={state === "loading"}
        className="text-xs font-bold uppercase tracking-widest px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
      >
        {state === "loading" ? "Syncing…" : "Sync Stripe"}
      </button>
      {result && (
        <span className="text-xs text-black/50 uppercase tracking-widest">
          {result.synced} synced{result.errors > 0 ? `, ${result.errors} errors` : ""}
        </span>
      )}
    </div>
  );
}
