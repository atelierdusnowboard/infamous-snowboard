"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  setProductImagePrimary,
  deleteProductImage,
} from "@/lib/actions/products";
import type { ProductImage } from "@/types/database";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.category_id ? [product.category_id] : []
  );

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }
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
  const [images, setImages] = useState<ProductImage[]>(
    product?.product_images
      ? [...product.product_images].sort((a, b) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
      : []
  );

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
      } else if (!product && "product" in result && result.product && typeof result.product === "object" && "id" in result.product) {
        toast("Product created — add images below", "success");
        router.push(`/admin/products/${(result.product as { id: string }).id}`);
      } else {
        toast("Product updated", "success");
        router.refresh();
      }
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!product?.id) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImage(true);
    for (const file of files) {
      const isPrimary = images.length === 0;
      const result = await uploadProductImage(product.id, file, isPrimary);
      if (result?.error) {
        toast(result.error, "error");
      } else if (result?.image) {
        setImages((prev) => [...prev, result.image as ProductImage]);
      }
    }
    setUploadingImage(false);
    e.target.value = "";
    toast(`${files.length} image${files.length > 1 ? "s" : ""} uploadée${files.length > 1 ? "s" : ""}`, "success");
  }

  async function handleSetPrimary(imageId: string) {
    if (!product?.id) return;
    const result = await setProductImagePrimary(imageId, product.id);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      setImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      );
      toast("Image de couverture définie", "success");
    }
  }

  async function handleDeleteImage(imageId: string, storagePath: string) {
    if (!product?.id) return;
    if (!confirm("Supprimer cette image ?")) return;
    const result = await deleteProductImage(imageId, storagePath, product.id);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast("Image supprimée", "success");
    }
  }

  function getImageSrc(img: ProductImage) {
    if (img.storage_path.startsWith("http")) return img.storage_path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img.storage_path}`;
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

        {/* Categories — multi-select via checkboxes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest">
            Categories
          </label>
          <div className="border border-black divide-y divide-black">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors">
                <input
                  type="checkbox"
                  name="category_ids"
                  value={cat.id}
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 border border-black appearance-none checked:bg-black cursor-pointer shrink-0"
                />
                <span className="text-xs font-bold uppercase tracking-widest">{cat.name}</span>
                {selectedCategoryIds[0] === cat.id && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-widest bg-black text-white px-1.5 py-0.5">Primary</span>
                )}
              </label>
            ))}
          </div>
          <p className="text-xs text-black/40">First selected = primary category</p>
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

      {/* Image management (only for existing products) */}
      {product && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest">
              Images ({images.length})
            </label>
            <label className={`cursor-pointer border border-black px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${uploadingImage ? "opacity-50 cursor-not-allowed" : "hover:bg-black hover:!text-white"}`}>
              {uploadingImage ? "Upload en cours..." : "+ Ajouter des images"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          {images.length === 0 ? (
            <p className="text-xs text-black/40 uppercase tracking-widest py-4 text-center border border-black/20 border-dashed">
              Aucune image — uploadez-en une ci-dessus
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  {/* Image */}
                  <div className={`relative border-2 overflow-hidden bg-white ${img.is_primary ? "border-black" : "border-black/20"}`} style={{ aspectRatio: "808/1280" }}>
                    <Image
                      src={getImageSrc(img)}
                      alt="product image"
                      fill
                      sizes="150px"
                      className="object-contain"
                    />
                    {/* Primary badge */}
                    {img.is_primary && (
                      <div className="absolute top-1 left-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                        Couverture
                      </div>
                    )}
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img.id)}
                        className="bg-white text-black text-[9px] font-bold uppercase tracking-widest px-2 py-1 hover:bg-black hover:!text-white transition-colors w-20 text-center"
                      >
                        ★ Couverture
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id, img.storage_path)}
                      className="bg-white text-black text-[9px] font-bold uppercase tracking-widest px-2 py-1 hover:bg-black hover:!text-white transition-colors w-20 text-center"
                    >
                      ✕ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
