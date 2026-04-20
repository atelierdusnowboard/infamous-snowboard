import type {
  Product,
  ProductImage,
  ProductVariant,
  Category,
} from "./database";

export interface ProductWithImages extends Product {
  categories: Category | null;
  product_images: ProductImage[];
}

export interface ProductWithVariants extends ProductWithImages {
  product_variants: ProductVariant[];
}
