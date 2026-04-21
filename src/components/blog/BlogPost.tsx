"use client";

import ReactMarkdown from "react-markdown";
import Image from "next/image";

interface BlogPostProps {
  content: string;
}

function getVideoEmbed(url: string): { id: string; type: "youtube" | "vimeo" } | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { id: yt[1], type: "youtube" };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { id: vimeo[1], type: "vimeo" };
  return null;
}

function VideoEmbed({ url }: { url: string }) {
  const embed = getVideoEmbed(url);
  if (!embed) return null;

  const src = embed.type === "youtube"
    ? `https://www.youtube.com/embed/${embed.id}`
    : `https://player.vimeo.com/video/${embed.id}`;

  return (
    <div className="relative w-full my-6 border border-black" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="video"
      />
    </div>
  );
}

export function BlogPostContent({ content }: BlogPostProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-black uppercase tracking-widest mt-8 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-black uppercase tracking-widest mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-black uppercase tracking-widest mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => {
            // Check if the paragraph is a standalone video URL
            if (typeof children === "string") {
              const embed = getVideoEmbed(children.trim());
              if (embed) return <VideoEmbed url={children.trim()} />;
            }
            // Check if single child is a link to a video
            if (Array.isArray(children) && children.length === 1) {
              const child = children[0];
              if (typeof child === "object" && child !== null && "props" in child) {
                const href = (child as React.ReactElement<{ href?: string }>).props?.href;
                if (href && getVideoEmbed(href)) return <VideoEmbed url={href} />;
              }
            }
            return <p className="text-sm leading-relaxed mb-4 text-black">{children}</p>;
          },
          img: ({ src, alt }) => {
            if (!src || typeof src !== "string") return null;
            return (
              <span className="block my-6 border border-black overflow-hidden">
                <Image
                  src={src}
                  alt={alt ?? ""}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover grayscale"
                  unoptimized
                />
              </span>
            );
          },
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 pl-4 border-l-2 border-black">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 pl-4 list-decimal list-inside">{children}</ol>
          ),
          li: ({ children }) => <li className="text-sm text-black">{children}</li>,
          strong: ({ children }) => <strong className="font-black">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-black pl-4 my-4 italic text-black/60">{children}</blockquote>
          ),
          code: ({ children }) => (
            <code className="font-mono text-xs bg-black text-white px-1 py-0.5">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-black text-white font-mono text-xs p-4 overflow-x-auto my-4">{children}</pre>
          ),
          hr: () => <hr className="border-t border-black my-8" />,
          a: ({ href, children }) => {
            if (href && getVideoEmbed(href)) return <VideoEmbed url={href} />;
            return (
              <a href={href} className="underline font-bold hover:opacity-60 transition-opacity"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
