import Link from "next/link";
import Image from "next/image";
import { formatDate, estimateReadingTime } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import type { BlogPost } from "@/types/database";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const readingTime = estimateReadingTime(post.content);
  const imageUrl = post.cover_image_path?.startsWith("http")
    ? post.cover_image_path
    : post.cover_image_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${post.cover_image_path}`
      : "/lifestyle/INFAMOUS-2.jpg";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border border-black bg-white hover:shadow-none"
    >
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden bg-white">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover grayscale transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-6 border-t border-black">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <h3 className="text-base font-black uppercase tracking-widest leading-tight group-hover:opacity-60 transition-opacity">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-black/60 mt-2 line-clamp-2">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-4 mt-4 text-xs text-black/40 uppercase tracking-widest">
          {post.published_at && (
            <span>{formatDate(post.published_at)}</span>
          )}
          <span>{readingTime} min read</span>
        </div>
      </div>
    </Link>
  );
}
