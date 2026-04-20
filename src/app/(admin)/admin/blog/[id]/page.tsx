import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BlogPostEditorClient from "../BlogPostEditorClient";

export const metadata: Metadata = {
  title: "Admin — Edit Post",
  robots: { index: false, follow: false },
};

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single() as any;

  if (!post) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/blog"
          className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
        >
          &larr; Blog
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Edit: {post.title}
        </h1>
      </div>
      <BlogPostEditorClient
        postId={post.id}
        defaultTitle={post.title}
        defaultSlug={post.slug}
        defaultExcerpt={post.excerpt ?? ""}
        defaultContent={post.content}
        defaultTags={post.tags ?? []}
        defaultPublished={post.is_published}
      />
    </div>
  );
}
