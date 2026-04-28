"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; name: string; slug: string };

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => select("")}
        className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-black transition-colors ${
          active === "" ? "bg-black text-white" : "hover:bg-black hover:text-white"
        }`}
      >
        Tous
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => select(cat.slug)}
          className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-black transition-colors ${
            active === cat.slug ? "bg-black text-white" : "hover:bg-black hover:text-white"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
