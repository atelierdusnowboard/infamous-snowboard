import type { Json } from "@/lib/supabase/types";

interface ProductSpecsProps {
  specs: Json;
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
    return null;
  }

  const entries = Object.entries(specs).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  if (entries.length === 0) return null;

  function formatKey(key: string): string {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function formatValue(value: unknown): string {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object" && value !== null)
      return JSON.stringify(value);
    return String(value);
  }

  return (
    <div className="border border-black">
      <div className="border-b border-black px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-widest">
          Specifications
        </h3>
      </div>
      <table className="w-full">
        <tbody>
          {entries.map(([key, value], idx) => (
            <tr
              key={key}
              className={idx % 2 === 0 ? "bg-white" : "bg-black/5"}
            >
              <td className="px-4 py-3 text-xs font-bold uppercase tracking-widest w-1/2 border-r border-black">
                {formatKey(key)}
              </td>
              <td className="px-4 py-3 text-xs font-mono tracking-wide">
                {formatValue(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
