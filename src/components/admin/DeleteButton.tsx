"use client";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
}

export function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Confirmer la suppression ?",
}: DeleteButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(e) => {
          if (!window.confirm(confirmMessage)) {
            e.preventDefault();
          }
        }}
        className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
      >
        {label}
      </button>
    </form>
  );
}
