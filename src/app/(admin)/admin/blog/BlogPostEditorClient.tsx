"use client";

import { useState, useTransition, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createPost, updatePost, uploadBlogImage } from "@/lib/actions/blog";
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
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    if (!postId) setSlug(slugify(e.target.value));
  }

  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) { setContent((c) => c + "\n\n" + text + "\n\n"); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newContent = content.slice(0, start) + "\n\n" + text + "\n\n" + content.slice(end);
    setContent(newContent);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + text.length + 4; }, 0);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadBlogImage(file);
    setUploading(false);
    e.target.value = "";
    if ("error" in result) { toast(result.error, "error"); return; }
    insertAtCursor(`![${file.name.replace(/\.[^.]+$/, "")}](${result.url})`);
    toast("Image inserted", "success");
  }

  function handleInsertVideo() {
    const url = videoUrl.trim();
    if (!url) return;
    insertAtCursor(url);
    setVideoUrl("");
    setShowVideoInput(false);
    toast("Video inserted", "success");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    formData.set("tags", JSON.stringify(tags));
    formData.set("is_published", String(isPublished));
    startTransition(async () => {
      const result = postId ? await updatePost(postId, formData) : await createPost(formData);
      if (result?.error) toast(result.error, "error");
      else toast(postId ? "Post updated" : "Post created", "success");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Input name="title" label="Title" required value={title} onChange={handleTitleChange} />
      <Input name="slug" label="Slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
      <Input name="excerpt" label="Excerpt" defaultValue={defaultExcerpt} placeholder="Short description for previews..." />
      <Input name="tags" label="Tags (comma separated)" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="park, freeride, gear..." />

      {/* Content editor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-widest">Content (Markdown)</label>
          <div className="flex items-center gap-2">
            {/* Image upload */}
            <label className={`cursor-pointer border border-black px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-black hover:!text-white"}`}>
              {uploading ? "Uploading..." : "+ Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
            {/* Video */}
            <button type="button" onClick={() => setShowVideoInput((v) => !v)}
              className="border border-black px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-black hover:!text-white transition-colors">
              + Video
            </button>
          </div>
        </div>

        {/* Video URL input */}
        {showVideoInput && (
          <div className="flex gap-2 p-3 border border-black">
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              className="flex-1 px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleInsertVideo())}
            />
            <button type="button" onClick={handleInsertVideo}
              className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-80">
              Insert
            </button>
            <button type="button" onClick={() => { setShowVideoInput(false); setVideoUrl(""); }}
              className="border border-black px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black hover:!text-white transition-colors">
              ✕
            </button>
          </div>
        )}

        <textarea ref={textareaRef} name="content" required rows={20}
          value={content} onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 border border-black bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black resize-y"
          placeholder="Write your post in Markdown..."
        />
        <p className="text-xs text-black/40">
          Images: <code className="font-mono bg-black/5 px-1">![alt](url)</code> ·
          Vidéos: colle une URL YouTube/Vimeo seule sur une ligne
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)}
          className="w-4 h-4 border border-black appearance-none checked:bg-black cursor-pointer" />
        <span className="text-xs font-bold uppercase tracking-widest">Publish immediately</span>
      </label>

      <Button type="submit" loading={isPending} size="md">
        {postId ? "Save Post" : "Create Post"}
      </Button>
    </form>
  );
}
