"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/lib/actions/auth";

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="border border-black p-4">
        <p className="text-xs font-bold uppercase tracking-widest">
          Check your email for a reset link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="email" label="Email" type="email" required />
      {error && (
        <p className="text-xs font-bold uppercase tracking-widest text-black">
          {error}
        </p>
      )}
      <Button type="submit" size="md" className="w-full mt-6" loading={isPending}>
        Send Reset Link
      </Button>
    </form>
  );
}
