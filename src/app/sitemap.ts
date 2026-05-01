import type { MetadataRoute } from "next";
import { getAllProductsForSitemap } from "@/lib/queries/products";
import { getAllBlogPostsForSitemap } from "@/lib/queries/blog";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.infamous-snowboard.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), priority: 1, changeFrequency: "weekly" },
    { url: `${siteUrl}/shop`, lastModified: new Date(), priority: 0.9, changeFrequency: "weekly" },
    { url: `${siteUrl}/blog`, lastModified: new Date(), priority: 0.8, changeFrequency: "weekly" },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    const [products, blogPosts] = await Promise.all([
      getAllProductsForSitemap(),
      getAllBlogPostsForSitemap(),
    ]);

    productRoutes = products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }));

    blogRoutes = blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      priority: 0.6,
      changeFrequency: "monthly" as const,
    }));
  } catch {
    // DB not configured
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
