"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { blogPostSchema } from "@/lib/validations/product";

export async function createPost(formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    tags: JSON.parse((formData.get("tags") as string) ?? "[]"),
    is_published: formData.get("is_published") === "true",
  };

  const parsed = blogPostSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      ...parsed.data,
      author_id: user?.id ?? null,
      published_at: parsed.data.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  redirect(`/admin/blog/${data.id}`);
}

export async function updatePost(id: string, formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    tags: JSON.parse((formData.get("tags") as string) ?? "[]"),
    is_published: formData.get("is_published") === "true",
  };

  const parsed = blogPostSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const supabase = await createClient();
  const { data: existingPost } = await supabase
    .from("blog_posts")
    .select("slug, published_at, is_published")
    .eq("id", id)
    .single();

  const nextPublishedAt = parsed.data.is_published
    ? existingPost?.is_published && existingPost.published_at
      ? existingPost.published_at
      : new Date().toISOString()
    : null;

  const { error } = await supabase
    .from("blog_posts")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
      published_at: nextPublishedAt,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (existingPost?.slug && existingPost.slug !== parsed.data.slug) {
    revalidatePath(`/blog/${existingPost.slug}`);
  }
  revalidatePath(`/blog/${parsed.data.slug}`);
  return { success: true };
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { data: existingPost } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .single();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (existingPost?.slug) {
    revalidatePath(`/blog/${existingPost.slug}`);
  }
  return { success: true };
}

export async function uploadBlogImage(file: File): Promise<{ url: string } | { error: string }> {
  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = createServiceClient();
  const ext = file.name.split(".").pop();
  const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return { url: data.publicUrl };
}
