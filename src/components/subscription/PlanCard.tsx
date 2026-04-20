import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
  loading?: boolean;
}

export function PlanCard({
  name,
  price,
  period,
  features,
  isPopular,
  onSelect,
  loading,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative border flex flex-col",
        isPopular ? "border-black border-2" : "border-black"
      )}
    >
      {isPopular && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <div className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
            Most Popular
          </div>
        </div>
      )}

      <div className="p-6 border-b border-black">
        <h3 className="text-sm font-black uppercase tracking-widest">{name}</h3>
        <div className="mt-4">
          <span className="text-3xl font-black">{price}</span>
          <span className="text-xs text-black/40 uppercase tracking-widest ml-2">
            {period}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1">
        <ul className="space-y-3">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-3 text-xs uppercase tracking-widest"
            >
              <span className="text-black font-black shrink-0 mt-0.5">—</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 pt-0">
        <Button
          variant={isPopular ? "primary" : "outline"}
          size="md"
          onClick={onSelect}
          loading={loading}
          className="w-full"
        >
          Choose {name}
        </Button>
      </div>
    </div>
  );
}
