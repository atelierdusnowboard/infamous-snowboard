import { formatBoardSize } from "@/lib/utils/format";
import type { Category } from "@/types/database";
import type { ProductWithImages } from "@/types/product";

export type ProductFamily = "boards" | "bindings" | "clothing" | "generic";

export interface FilterOption {
  label: string;
  value: string;
  count: number;
}

export interface FilterSection {
  key: string;
  label: string;
  options: FilterOption[];
}

const FAMILY_LABELS: Record<ProductFamily, string> = {
  boards: "Boards",
  bindings: "Bindings",
  clothing: "Clothing",
  generic: "Products",
};

const PREFERRED_SPEC_KEYS: Record<ProductFamily, string[]> = {
  boards: ["terrain", "difficulty", "flex", "shape", "camber", "profile"],
  bindings: ["size", "flex", "response", "compatibility", "mounting"],
  clothing: ["size", "fit", "layer", "gender", "color"],
  generic: [],
};

const SPEC_KEY_BLACKLIST = new Set([
  "description",
  "details",
  "feature",
  "features",
  "length",
  "size_cm",
  "sizes",
  "wide",
  "is_wide",
]);

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function formatSpecLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatSpecValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function extractSpecValues(product: ProductWithImages, key: string): string[] {
  if (!product.specs || typeof product.specs !== "object" || Array.isArray(product.specs)) {
    return [];
  }

  const rawValue = (product.specs as Record<string, unknown>)[key];
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((entry) => formatSpecValue(entry))
      .filter((entry): entry is string => Boolean(entry));
  }

  const formatted = formatSpecValue(rawValue);
  return formatted ? [formatted] : [];
}

export function getProductFamily(categorySlug?: string | null): ProductFamily {
  const slug = (categorySlug ?? "").toLowerCase();

  if (
    slug.includes("binding") ||
    slug.includes("fix")
  ) {
    return "bindings";
  }

  if (
    slug.includes("cloth") ||
    slug.includes("apparel") ||
    slug.includes("outerwear") ||
    slug.includes("hoodie") ||
    slug.includes("pant") ||
    slug.includes("tee") ||
    slug.includes("shirt") ||
    slug.includes("jacket")
  ) {
    return "clothing";
  }

  if (slug.length > 0) {
    return "boards";
  }

  return "generic";
}

export function getProductFamilyLabel(family: ProductFamily): string {
  return FAMILY_LABELS[family];
}

function buildSizeSection(products: ProductWithImages[]): FilterSection | null {
  const sizeCounts = new Map<number, number>();

  products.forEach((product) => {
    const sizes = new Set(
      (product.product_variants ?? []).map((variant) => variant.size_cm)
    );

    sizes.forEach((size) => {
      sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1);
    });
  });

  if (sizeCounts.size === 0) return null;

  return {
    key: "size",
    label: "Size",
    options: [...sizeCounts.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([size, count]) => ({
        label: formatBoardSize(size),
        value: String(size),
        count,
      })),
  };
}

function buildWideSection(products: ProductWithImages[]): FilterSection | null {
  const count = products.filter((product) =>
    (product.product_variants ?? []).some((variant) => variant.is_wide)
  ).length;

  if (count === 0) return null;

  return {
    key: "wide",
    label: "Width",
    options: [{ label: "Wide only", value: "true", count }],
  };
}

function buildSpecSections(
  products: ProductWithImages[],
  family: ProductFamily
): FilterSection[] {
  const keyToValues = new Map<string, Map<string, { label: string; count: number }>>();

  products.forEach((product) => {
    if (!product.specs || typeof product.specs !== "object" || Array.isArray(product.specs)) {
      return;
    }

    Object.keys(product.specs as Record<string, unknown>).forEach((key) => {
      const normalizedKey = key.trim().toLowerCase();
      if (!normalizedKey || SPEC_KEY_BLACKLIST.has(normalizedKey)) return;

      const values = extractSpecValues(product, key);
      if (values.length === 0) return;

      const valueMap = keyToValues.get(normalizedKey) ?? new Map<string, { label: string; count: number }>();
      const seenInProduct = new Set<string>();

      values.forEach((value) => {
        if (value.length > 32) return;

        const normalizedValue = normalizeValue(value);
        if (!normalizedValue || seenInProduct.has(normalizedValue)) return;

        seenInProduct.add(normalizedValue);
        const existing = valueMap.get(normalizedValue);
        valueMap.set(normalizedValue, {
          label: value,
          count: (existing?.count ?? 0) + 1,
        });
      });

      if (valueMap.size > 0) {
        keyToValues.set(normalizedKey, valueMap);
      }
    });
  });

  const preferred = PREFERRED_SPEC_KEYS[family];
  const keys = [...keyToValues.keys()]
    .filter((key) => {
      const valueMap = keyToValues.get(key);
      return Boolean(valueMap && valueMap.size > 1 && valueMap.size <= 8);
    })
    .sort((a, b) => {
      const aIndex = preferred.indexOf(a);
      const bIndex = preferred.indexOf(b);

      if (aIndex !== -1 || bIndex !== -1) {
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      }

      return a.localeCompare(b);
    });

  return keys.map((key) => ({
    key: `spec_${key}`,
    label: formatSpecLabel(key),
    options: [...(keyToValues.get(key)?.entries() ?? [])]
      .sort((a, b) => a[1].label.localeCompare(b[1].label))
      .map(([value, entry]) => ({
        value,
        label: entry.label,
        count: entry.count,
      })),
  }));
}

export function buildFilterSections(
  products: ProductWithImages[],
  family: ProductFamily
): FilterSection[] {
  if (family === "generic") {
    return [];
  }

  const sections: FilterSection[] = [];
  const sizeSection = buildSizeSection(products);

  if (sizeSection) {
    sections.push(sizeSection);
  }

  if (family === "boards") {
    const wideSection = buildWideSection(products);

    if (wideSection) sections.push(wideSection);
  }

  sections.push(...buildSpecSections(products, family));
  return sections;
}

function matchesSize(product: ProductWithImages, selectedSize: string, wideOnly: boolean): boolean {
  return (product.product_variants ?? []).some((variant) => {
    if (String(variant.size_cm) !== selectedSize) return false;
    if (wideOnly && !variant.is_wide) return false;
    return true;
  });
}

function matchesWide(product: ProductWithImages): boolean {
  return (product.product_variants ?? []).some((variant) => variant.is_wide);
}

function matchesSpec(product: ProductWithImages, key: string, selectedValue: string): boolean {
  return extractSpecValues(product, key)
    .map((value) => normalizeValue(value))
    .includes(selectedValue);
}

export function applyProductFilters(
  products: ProductWithImages[],
  searchParams: Record<string, string | undefined>
): ProductWithImages[] {
  const selectedSize = searchParams.size;
  const wideOnly = searchParams.wide === "true";

  return products.filter((product) => {
    if (selectedSize && !matchesSize(product, selectedSize, wideOnly)) {
      return false;
    }

    if (!selectedSize && wideOnly && !matchesWide(product)) {
      return false;
    }

    return Object.entries(searchParams).every(([key, value]) => {
      if (!value || !key.startsWith("spec_")) return true;
      return matchesSpec(product, key.replace(/^spec_/, ""), value);
    });
  });
}

export function findCategoryBySlug(categories: Category[], slug?: string): Category | null {
  if (!slug) return null;
  return categories.find((category) => category.slug === slug) ?? null;
}
