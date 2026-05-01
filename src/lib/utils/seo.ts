import type { Metadata } from "next";
import { extractFirstImageFromMarkdown } from "@/lib/utils/format";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.infamous-snowboard.com";

export function generateProductMetadata(product: {
  name: string;
  tagline?: string | null;
  description?: string | null;
  price: number;
  slug: string;
  primaryImage?: string;
}): Metadata {
  const title = product.name;
  const description =
    product.tagline ??
    product.description ??
    `${product.name} — Infamous Snowboard. Less noise. More shapes.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Infamous Snowboard`,
      description,
      url: `${siteUrl}/products/${product.slug}`,
      type: "website",
      images: product.primaryImage
        ? [
            {
              url: product.primaryImage,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Infamous Snowboard`,
      description,
      images: product.primaryImage ? [product.primaryImage] : [],
    },
  };
}

export function generateBlogMetadata(post: {
  title: string;
  excerpt?: string | null;
  slug: string;
  cover_image_path?: string | null;
  published_at?: string | null;
  content?: string;
}): Metadata {
  const description =
    post.excerpt ?? `${post.title} — Infamous Snowboard blog.`;

  const ogImageUrl =
    post.cover_image_path ??
    extractFirstImageFromMarkdown(post.content ?? "") ??
    undefined;

  return {
    title: post.title,
    description,
    openGraph: {
      title: `${post.title} | Infamous Blog`,
      description,
      url: `${siteUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
  };
}
