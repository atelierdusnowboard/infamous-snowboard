import type { Metadata } from "next";
import Link from "next/link";
import BlogPostEditorClient from "../BlogPostEditorClient";

export const metadata: Metadata = {
  title: "Admin — New Post",
  robots: { index: false, follow: false },
};

export default function NewBlogPostPage() {
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
          New Post
        </h1>
      </div>
      <BlogPostEditorClient />
    </div>
  );
}
