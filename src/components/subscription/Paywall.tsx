"use client";

import { useState } from "react";
import { configurePurchases } from "@/lib/revenuecat/client";
import { PlanCard } from "./PlanCard";

interface PaywallProps {
  userId: string;
}

const staticPlans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "€9.99",
    period: "/ month",
    features: [
      "Exclusive rider content",
      "Early access to new boards",
      "Pro tips & tutorials",
      "10% discount on orders",
    ],
    isPopular: false,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "€79.99",
    period: "/ year",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Priority support",
      "Exclusive pro colorways",
      "15% discount on orders",
    ],
    isPopular: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "€199.99",
    period: "one time",
    features: [
      "Everything forever",
      "Founding member status",
      "20% discount on all orders",
      "Board customization access",
      "Exclusive events invite",
    ],
    isPopular: false,
  },
];

export function Paywall({ userId }: PaywallProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSelectPlan(planId: string) {
    setLoadingPlan(planId);
    try {
      const purchases = configurePurchases(userId);
      const offerings = await purchases.getOfferings();
      const offering = offerings.current;
      if (!offering) {
        alert("No offerings available at this time.");
        return;
      }
      // Find the package matching the plan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pkg = offering.availablePackages.find((p: any) =>
        p.identifier.toLowerCase().includes(planId)
      );
      if (pkg) {
        await purchases.purchasePackage(pkg);
        window.location.reload();
      } else {
        alert(`Plan not found: ${planId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black uppercase tracking-widest">
          Go Pro.
        </h1>
        <p className="text-sm text-black/60 mt-3 max-w-sm mx-auto">
          Unlock exclusive content, early access, and discounts reserved for
          real riders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black max-w-3xl mx-auto">
        {staticPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            isPopular={plan.isPopular}
            loading={loadingPlan === plan.id}
            onSelect={() => handleSelectPlan(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}
