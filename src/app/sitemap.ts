import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/queries/products";
import { getAllBlogSlugs } from "@/lib/queries/blog";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://infamous-snowboard.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: new Date(), priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/pro`, lastModified: new Date(), priority: 0.7 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    const [slugs, blogSlugs] = await Promise.all([
      getAllProductSlugs(),
      getAllBlogSlugs(),
    ]);

    productRoutes = slugs.map((slug) => ({
      url: `${siteUrl}/products/${slug}`,
      lastModified: new Date(),
      priority: 0.8,
    }));

    blogRoutes = blogSlugs.map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified: new Date(),
      priority: 0.6,
    }));
  } catch {
    // DB not configured
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
