import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single() as any;

  if (!profile?.is_admin) redirect("/");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="px-8 py-6 border-b border-black flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-black/40">
            Admin Panel
          </span>
        </div>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
