import ReactMarkdown from "react-markdown";

interface BlogPostProps {
  content: string;
}

export function BlogPostContent({ content }: BlogPostProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-black uppercase tracking-widest mt-8 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-black uppercase tracking-widest mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-black uppercase tracking-widest mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-4 text-black">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 pl-4 border-l-2 border-black">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 pl-4 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-black">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-black">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-black pl-4 my-4 italic text-black/60">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="font-mono text-xs bg-black text-white px-1 py-0.5">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-black text-white font-mono text-xs p-4 overflow-x-auto my-4">
              {children}
            </pre>
          ),
          hr: () => <hr className="border-t border-black my-8" />,
          a: ({ href, children }) => (
            <a
              href={href}
              className="underline font-bold hover:opacity-60 transition-opacity"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
