import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category_id: z.string().uuid("Invalid category").optional().nullable().or(z.literal("")),
  specs: z.record(z.string(), z.unknown()).default({}),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
