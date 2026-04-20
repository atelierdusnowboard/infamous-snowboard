"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updatePassword } from "@/lib/actions/auth";

export default function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="password"
        label="New Password"
        type="password"
        required
        placeholder="Min 8 characters"
      />
      <Input
        name="confirm"
        label="Confirm Password"
        type="password"
        required
      />
      {error && (
        <p className="text-xs font-bold uppercase tracking-widest text-black">
          {error}
        </p>
      )}
      <Button type="submit" size="md" className="w-full mt-6" loading={isPending}>
        Update Password
      </Button>
    </form>
  );
}
