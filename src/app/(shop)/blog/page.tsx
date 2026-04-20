import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/queries/blog";
import { BlogGrid } from "@/components/blog/BlogGrid";
import type { BlogPost } from "@/types/database";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Rider stories, board breakdowns, and field notes from Infamous Snowboard.",
};

export default async function BlogIndexPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await getBlogPosts();
  } catch {
    // DB not configured
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="mb-12 border-b border-black pb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2">
          From The Mountain
        </p>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">
          Blog
        </h1>
      </div>
      <BlogGrid posts={posts} />
    </div>
  );
}
