import { createPublicClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((p) => p.slug);
}

export async function getAllBlogPostsForSitemap(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true);
  return data ?? [];
}
