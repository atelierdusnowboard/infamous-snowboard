"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types/database";
import type { FilterSection } from "@/lib/utils/productFilters";

interface ProductFiltersProps {
  categories: Category[];
  sections: FilterSection[];
  showCategoryFilter?: boolean;
  resetHref: string;
}

export function ProductFilters({
  categories,
  sections,
  showCategoryFilter = true,
  resetHref,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key);

    if (key === "category") {
      const next = current === value ? null : value;
      const nextParams = new URLSearchParams();
      if (next) {
        nextParams.set("category", next);
      }
      router.push(`?${nextParams.toString()}`, { scroll: false });
      return;
    }

    if (current === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  }

  function isActive(key: string, value: string) {
    return searchParams.get(key) === value;
  }

  const activeCategory = searchParams.get("category");
  const hasActiveFilters = [...searchParams.keys()].length > 0;

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="lg:sticky lg:top-24 space-y-8">
        {showCategoryFilter && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">
              Category
            </h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activeCategory === category.slug}
                      onChange={() => toggle("category", category.slug)}
                      className="w-3 h-3 border border-black appearance-none checked:bg-black cursor-pointer shrink-0"
                    />
                    <span className="text-xs uppercase tracking-widest group-hover:opacity-60 transition-opacity">
                      {category.name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {sections.map((section) => (
          <div key={section.key}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">
              {section.label}
            </h3>
            <ul className="space-y-2">
              {section.options.map((option) => (
                <li key={`${section.key}-${option.value}`}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isActive(section.key, option.value)}
                      onChange={() => toggle(section.key, option.value)}
                      className="w-3 h-3 border border-black appearance-none checked:bg-black cursor-pointer shrink-0"
                    />
                    <span className="flex-1 text-xs uppercase tracking-widest group-hover:opacity-60 transition-opacity">
                      {option.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-black/40">
                      {option.count}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="pt-2">
          <Link
            href={resetHref}
            className={cn(
              "text-xs font-bold uppercase tracking-widest transition-opacity",
              hasActiveFilters ? "opacity-100 hover:opacity-60" : "opacity-40 pointer-events-none"
            )}
          >
            Reset Filters
          </Link>
        </div>
      </div>
    </aside>
  );
}
