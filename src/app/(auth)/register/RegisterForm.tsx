"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { register } from "@/lib/actions/auth";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="full_name" label="Full Name" required />
      <Input name="email" label="Email" type="email" required />
      <Input
        name="password"
        label="Password"
        type="password"
        required
        placeholder="Min 8 characters"
      />
      {error && (
        <p className="text-xs font-bold uppercase tracking-widest text-black">
          {error}
        </p>
      )}
      <Button type="submit" size="md" className="w-full mt-6" loading={isPending}>
        Create Account
      </Button>
    </form>
  );
}
