import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-black text-white border border-black hover:bg-white hover:text-black",
  outline:
    "bg-white text-black border border-black hover:bg-black hover:text-white",
  ghost:
    "bg-transparent text-black border border-transparent hover:border-black",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center",
        "font-bold uppercase tracking-widest",
        "transition-colors duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent animate-spin inline-block" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
