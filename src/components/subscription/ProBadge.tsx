import { cn } from "@/lib/utils/cn";

interface ProBadgeProps {
  className?: string;
}

export function ProBadge({ className }: ProBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5",
        "bg-black text-white",
        "text-[10px] font-black uppercase tracking-widest",
        className
      )}
    >
      PRO
    </span>
  );
}
