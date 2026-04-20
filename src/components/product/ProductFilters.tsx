"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/database";

interface ProductFiltersProps {
  categories: Category[];
}

const difficulties = ["Beginner", "Intermediate", "Advanced", "Expert"];
const terrains = ["Park", "Pipe", "All-Mountain", "Freeride", "Powder", "Carving"];

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key);
    if (current === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  const activeCat = searchParams.get("category");
  const activeDiff = searchParams.get("difficulty");
  const activeTerrain = searchParams.get("terrain");

  return (
    <aside className="w-48 shrink-0">
      <div className="sticky top-24">
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">
            Category
          </h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeCat === cat.slug}
                    onChange={() => toggle("category", cat.slug)}
                    className="w-3 h-3 border border-black appearance-none checked:bg-black cursor-pointer shrink-0"
                  />
                  <span className="text-xs uppercase tracking-widest group-hover:opacity-60 transition-opacity">
                    {cat.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">
            Difficulty
          </h3>
          <ul className="space-y-2">
            {difficulties.map((d) => (
              <li key={d}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeDiff === d.toLowerCase()}
                    onChange={() => toggle("difficulty", d.toLowerCase())}
                    className="w-3 h-3 border border-black appearance-none checked:bg-black cursor-pointer shrink-0"
                  />
                  <span className="text-xs uppercase tracking-widest group-hover:opacity-60 transition-opacity">
                    {d}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">
            Terrain
          </h3>
          <ul className="space-y-2">
            {terrains.map((t) => (
              <li key={t}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeTerrain === t.toLowerCase()}
                    onChange={() => toggle("terrain", t.toLowerCase())}
                    className="w-3 h-3 border border-black appearance-none checked:bg-black cursor-pointer shrink-0"
                  />
                  <span className="text-xs uppercase tracking-widest group-hover:opacity-60 transition-opacity">
                    {t}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
