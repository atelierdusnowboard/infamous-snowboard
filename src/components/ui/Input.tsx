import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-widest text-black"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={cn(
          "w-full px-4 py-3",
          "border border-black bg-white text-black",
          "placeholder:text-black/40",
          "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0",
          "transition-colors duration-150",
          error && "border-black ring-2 ring-black",
          className
        )}
      />
      {error && (
        <p className="text-xs font-medium text-black uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-widest text-black"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={cn(
          "w-full px-4 py-3",
          "border border-black bg-white text-black",
          "placeholder:text-black/40",
          "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0",
          "transition-colors duration-150 resize-none",
          error && "ring-2 ring-black",
          className
        )}
      />
      {error && (
        <p className="text-xs font-medium text-black uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}
