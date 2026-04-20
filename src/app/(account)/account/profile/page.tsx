import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "Edit Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="py-8">
        <p className="text-xs text-black/40 uppercase tracking-widest">
          Profile not found. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-black pb-8 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Edit Profile
        </h1>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
