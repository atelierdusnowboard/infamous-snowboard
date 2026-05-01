import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { getCategories } from "@/lib/queries/categories";
import { getIsAdmin } from "@/lib/queries/auth";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, isAdmin] = await Promise.all([getCategories(true), getIsAdmin()]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={categories} isAdmin={isAdmin} />
      <MobileMenu categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
