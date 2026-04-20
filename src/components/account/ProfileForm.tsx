"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { Profile } from "@/types/database";

interface ProfileFormProps {
  profile: Profile;
}

const ridingLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [data, setData] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    riding_level: profile.riding_level ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", profile.id);

      if (error) {
        toast(error.message, "error");
      } else {
        toast("Profile updated", "success");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <Input
        label="Full Name"
        name="full_name"
        value={data.full_name}
        onChange={handleChange}
        placeholder="Your name"
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={profile.email}
        disabled
        className="opacity-50 cursor-not-allowed"
      />
      <Input
        label="Phone"
        name="phone"
        type="tel"
        value={data.phone}
        onChange={handleChange}
        placeholder="+33 6 00 00 00 00"
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-widest">
          Riding Level
        </label>
        <select
          name="riding_level"
          value={data.riding_level}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Select level</option>
          {ridingLevels.map((level) => (
            <option key={level} value={level.toLowerCase()}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" loading={isPending} size="md">
        Save Changes
      </Button>
    </form>
  );
}
