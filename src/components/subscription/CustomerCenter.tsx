import { formatDate } from "@/lib/utils/format";
import { ProBadge } from "./ProBadge";
import { Button } from "@/components/ui/Button";
import type { Subscription } from "@/types/database";

interface CustomerCenterProps {
  subscription: Subscription;
}

export function CustomerCenter({ subscription }: CustomerCenterProps) {
  return (
    <div className="border border-black max-w-md">
      <div className="p-6 border-b border-black flex items-center gap-3">
        <h2 className="text-sm font-black uppercase tracking-widest">
          Your Subscription
        </h2>
        <ProBadge />
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-black">
          <span className="text-xs font-bold uppercase tracking-widest text-black/60">
            Plan
          </span>
          <span className="text-xs font-black uppercase tracking-widest">
            {subscription.plan}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-black">
          <span className="text-xs font-bold uppercase tracking-widest text-black/60">
            Status
          </span>
          <span className="text-xs font-black uppercase tracking-widest">
            {subscription.status}
          </span>
        </div>

        {subscription.current_period_end && (
          <div className="flex justify-between items-center py-3 border-b border-black">
            <span className="text-xs font-bold uppercase tracking-widest text-black/60">
              Next Billing
            </span>
            <span className="text-xs font-black uppercase tracking-widest">
              {formatDate(subscription.current_period_end)}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 pt-0">
        <p className="text-xs text-black/40 mb-4">
          To manage or cancel your subscription, contact us or use the RevenueCat
          customer portal.
        </p>
        <Button variant="outline" size="sm">
          Manage Subscription
        </Button>
      </div>
    </div>
  );
}
