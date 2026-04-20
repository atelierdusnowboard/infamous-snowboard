"use client";

import { useState, useTransition } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createProduct, updateProduct, uploadProductImage } from "@/lib/actions/products";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils/format";
import type { ProductWithImages } from "@/types/product";
import type { Category } from "@/types/database";

interface ProductFormProps {
  product?: ProductWithImages;
  categories: Category[];
}

interface SpecRow {
  key: string;
  value: string;
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [specRows, setSpecRows] = useState<SpecRow[]>(() => {
    if (!product?.specs || typeof product.specs !== "object" || Array.isArray(product.specs)) {
      return [];
    }
    return Object.entries(product.specs).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (!product) {
      setSlug(slugify(e.target.value));
    }
  }

  function addSpecRow() {
    setSpecRows((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeSpecRow(idx: number) {
    setSpecRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateSpecRow(idx: number, field: "key" | "value", val: string) {
    setSpecRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const specs: Record<string, string> = {};
    specRows.forEach(({ key, value }) => {
      if (key.trim()) specs[key.trim()] = value;
    });
    formData.set("specs", JSON.stringify(specs));
    formData.set("is_published", String(isPublished));
    formData.set("is_featured", String(isFeatured));

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result?.error) {
        toast(result.error, "error");
      } else {
        toast(
          product ? "Product updated" : "Product created",
          "success"
        );
      }
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!product?.id) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const result = await uploadProductImage(product.id, file, false);
    setUploadingImage(false);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Image uploaded", "success");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <Input
          name="name"
          label="Product Name"
          required
          value={name}
          onChange={handleNameChange}
        />
        <Input
          name="slug"
          label="Slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <Input
          name="tagline"
          label="Tagline"
          defaultValue={product?.tagline ?? ""}
        />
        <Textarea
          name="description"
          label="Description"
          rows={4}
          defaultValue={product?.description ?? ""}
        />
        <Input
          name="price"
          label="Price (EUR)"
          type="number"
          step="0.01"
          required
          defaultValue={product?.price ?? ""}
        />

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest">
            Category
          </label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className="w-full px-4 py-3 border border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Specs editor */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-widest">
            Specifications
          </label>
          <Button type="button" variant="outline" size="sm" onClick={addSpecRow}>
            + Add Spec
          </Button>
        </div>
        {specRows.length > 0 && (
          <div className="border border-black divide-y divide-black">
            {specRows.map((row, idx) => (
              <div key={idx} className="flex gap-4 p-3 items-center">
                <input
                  className="flex-1 px-3 py-2 border border-black text-xs font-mono"
                  placeholder="key (e.g. flex_rating)"
                  value={row.key}
                  onChange={(e) => updateSpecRow(idx, "key", e.target.value)}
                />
                <input
                  className="flex-1 px-3 py-2 border border-black text-xs font-mono"
                  placeholder="value"
                  value={row.value}
                  onChange={(e) => updateSpecRow(idx, "value", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(idx)}
                  className="text-black/40 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="flex gap-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 border border-black appearance-none checked:bg-black cursor-pointer"
          />
          <span className="text-xs font-bold uppercase tracking-widest">Published</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 border border-black appearance-none checked:bg-black cursor-pointer"
          />
          <span className="text-xs font-bold uppercase tracking-widest">Featured</span>
        </label>
      </div>

      {/* Image upload (only for existing products) */}
      {product && (
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="text-xs"
          />
          {uploadingImage && (
            <p className="text-xs text-black/40 mt-2 uppercase tracking-widest">
              Uploading...
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" loading={isPending} size="md">
          {product ? "Save Changes" : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => {
            setIsPublished(false);
          }}
        >
          Save as Draft
        </Button>
      </div>
    </form>
  );
}
