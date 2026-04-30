import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/queries/blog";
import { BlogPostContent } from "@/components/blog/BlogPost";
import { Badge } from "@/components/ui/Badge";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { formatDate, estimateReadingTime } from "@/lib/utils/format";
import { generateBlogMetadata } from "@/lib/utils/seo";
import { ShareButtons } from "@/components/blog/ShareButtons";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllBlogSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPostBySlug(slug);
    if (!post) return {};
    return generateBlogMetadata(post);
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post = null;
  try {
    post = await getBlogPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  const readingTime = estimateReadingTime(post.content);
  const pageUrl = `https://www.infamous-snowboard.com/blog/${post.slug}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <article className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-black/40 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-black">{post.title}</span>
        </nav>

        <div className="max-w-3xl">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-xs text-black/40 uppercase tracking-widest mb-10 border-b border-black pb-6">
            {post.published_at && (
              <span>{formatDate(post.published_at)}</span>
            )}
            <span>{readingTime} min read</span>
          </div>

          {/* Content */}
          <BlogPostContent content={post.content} />

          <ShareButtons url={pageUrl} title={post.title} />
        </div>
      </article>
    </>
  );
}
