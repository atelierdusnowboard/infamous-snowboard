import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deletePost } from "@/lib/actions/blog";
import { formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = {
  title: "Admin — Blog",
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  const supabase = await createClient();
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    tags: string[];
  }> = [];

  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, is_published, published_at, created_at, tags")
      .order("created_at", { ascending: false });
    posts = data ?? [];
  } catch {
    // DB not configured
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">Blog</h1>
        <Link href="/admin/blog/new">
          <Button size="sm">+ New Post</Button>
        </Link>
      </div>

      <div className="border border-black">
        <div className="grid grid-cols-4 px-4 py-3 border-b border-black bg-black text-white text-xs font-bold uppercase tracking-widest">
          <span className="col-span-2">Title</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-black/40 uppercase tracking-widest">
              No posts yet.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="grid grid-cols-4 px-4 py-4 border-b border-black last:border-b-0 items-center"
            >
              <div className="col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest">
                  {post.title}
                </p>
                <p className="text-xs text-black/40 font-mono">{post.slug}</p>
              </div>
              <div>
                {post.is_published ? (
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Published
                  </span>
                ) : (
                  <span className="text-xs text-black/40 uppercase tracking-widest">
                    Draft
                  </span>
                )}
                {post.published_at && (
                  <p className="text-xs text-black/40">
                    {formatDate(post.published_at)}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={async () => {
                    "use server";
                    await deletePost(post.id);
                  }}
                  confirmMessage={`Supprimer "${post.title}" ?`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
