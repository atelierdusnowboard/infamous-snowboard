export function formatPrice(
  amount: number,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function extractFirstImageFromMarkdown(content: string): string | null {
  const match = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  return match ? match[1] : null;
}

const CLOTHING_SIZE_ORDER: Record<string, number> = {
  "2XS": 0, "XXS": 0,
  "XS": 1,
  "S": 2,
  "M": 3,
  "L": 4,
  "XL": 5,
  "XXL": 6, "2XL": 6,
  "3XL": 7, "XXXL": 7,
  "4XL": 8,
  "5XL": 9,
  "6XL": 10,
  "ONE SIZE": 99,
};

export function compareSize(a: string, b: string): number {
  const aUp = a.toUpperCase().trim();
  const bUp = b.toUpperCase().trim();
  const aOrder = CLOTHING_SIZE_ORDER[aUp];
  const bOrder = CLOTHING_SIZE_ORDER[bUp];
  if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
  if (aOrder !== undefined) return -1;
  if (bOrder !== undefined) return 1;
  return a.localeCompare(b, undefined, { numeric: true });
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
