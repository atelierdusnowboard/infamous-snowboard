"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = typeof STATUSES[number];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

interface OrderStatusPanelProps {
  orderId: string;
  initialStatus: string;
}

export function OrderStatusPanel({ orderId, initialStatus }: OrderStatusPanelProps) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(status: string) {
    if (status === currentStatus) return;
    setPendingStatus(status);
  }

  function handleConfirm() {
    if (!pendingStatus) return;
    const next = pendingStatus;
    setPendingStatus(null);
    setCurrentStatus(next); // optimistic update
    startTransition(async () => {
      await updateOrderStatus(orderId, next);
    });
  }

  function handleCancel() {
    setPendingStatus(null);
  }

  return (
    <div className="border border-black">
      <div className="px-4 py-3 border-b border-black">
        <h3 className="text-xs font-bold uppercase tracking-widest">Update Status</h3>
      </div>

      <div className="p-4 space-y-2">
        {STATUSES.map((status) => {
          const isActive = currentStatus === status;
          const isConfirming = pendingStatus === status;

          return (
            <div key={status}>
              {isConfirming ? (
                <div className="border border-black p-2 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-center font-bold">
                    Set to {STATUS_LABELS[status]}?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirm}
                      disabled={isPending}
                      className="flex-1 px-3 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-3 py-1.5 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:!text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleClick(status)}
                  disabled={isPending}
                  className={`w-full px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors disabled:opacity-50 ${
                    isActive
                      ? "bg-black text-white border-black cursor-default"
                      : "bg-white text-black border-black hover:bg-black hover:!text-white"
                  }`}
                >
                  {STATUS_LABELS[status]}
                  {isActive && " ✓"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
