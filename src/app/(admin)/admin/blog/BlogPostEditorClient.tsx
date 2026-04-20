"use client";

import { useState, useTransition } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createPost, updatePost } from "@/lib/actions/blog";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils/format";

interface BlogPostEditorClientProps {
  postId?: string;
  defaultTitle?: string;
  defaultSlug?: string;
  defaultExcerpt?: string;
  defaultContent?: string;
  defaultTags?: string[];
  defaultPublished?: boolean;
}

export default function BlogPostEditorClient({
  postId,
  defaultTitle = "",
  defaultSlug = "",
  defaultExcerpt = "",
  defaultContent = "",
  defaultTags = [],
  defaultPublished = false,
}: BlogPostEditorClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [content, setContent] = useState(defaultContent);
  const [isPublished, setIsPublished] = useState(defaultPublished);
  const [tagsStr, setTagsStr] = useState(defaultTags.join(", "));

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    if (!postId) setSlug(slugify(e.target.value));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    formData.set("tags", JSON.stringify(tags));
    formData.set("is_published", String(isPublished));

    startTransition(async () => {
      const result = postId
        ? await updatePost(postId, formData)
        : await createPost(formData);

      if (result?.error) {
        toast(result.error, "error");
      } else {
        toast(postId ? "Post updated" : "Post created", "success");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Input
        name="title"
        label="Title"
        required
        value={title}
        onChange={handleTitleChange}
      />
      <Input
        name="slug"
        label="Slug"
        required
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <Input
        name="excerpt"
        label="Excerpt"
        defaultValue={defaultExcerpt}
        placeholder="Short description for previews..."
      />
      <Input
        name="tags"
        label="Tags (comma separated)"
        value={tagsStr}
        onChange={(e) => setTagsStr(e.target.value)}
        placeholder="park, freeride, gear..."
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-widest">
          Content (Markdown)
        </label>
        <textarea
          name="content"
          required
          rows={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 border border-black bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black resize-y"
          placeholder="Write your post in Markdown..."
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-4 h-4 border border-black appearance-none checked:bg-black cursor-pointer"
        />
        <span className="text-xs font-bold uppercase tracking-widest">
          Publish immediately
        </span>
      </label>

      <div className="flex gap-4">
        <Button type="submit" loading={isPending} size="md">
          {postId ? "Save Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
