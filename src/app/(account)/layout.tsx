import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccountNav } from "@/components/account/AccountNav";
import { getIsAdmin } from "@/lib/queries/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await getIsAdmin();

  return (
    <div className="flex flex-col min-h-screen">
      <Header isAdmin={isAdmin} />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-12">
        <div className="flex gap-12">
          <AccountNav />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
