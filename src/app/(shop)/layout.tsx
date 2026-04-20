import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { getCategories } from "@/lib/queries/categories";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories(true);

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={categories} />
      <MobileMenu categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
