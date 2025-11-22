// src/components/admin/PostEditor.tsx
"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

interface PostEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
}

export default function PostEditor({ initialContent = "", onChange }: PostEditorProps) {
  // Chỉ render editor sau khi client đã mount, tránh SSR hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image,
    ],
    content: initialContent || "<p>Nhập nội dung bài viết tại đây...</p>",
    autofocus: "end",
    immediatelyRender: false, // quan trọng cho Next.js + Tiptap
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!mounted || !editor) return null;

  const addImage = () => {
    const url = window.prompt("Nhập URL hình ảnh:");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const toolbarButtonBase = "px-2.5 py-1.5 text-xs rounded-md border border-transparent transition-colors " + "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800";

  const toolbarButtonActive = "bg-gray-900 text-white dark:bg-gray-100 dark:text-black";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#111]">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-2.5 text-xs dark:border-gray-800 dark:bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Group: kiểu chữ */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-1.5 py-1 dark:border-gray-700 dark:bg-[#111]">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${toolbarButtonBase} ${editor.isActive("bold") ? toolbarButtonActive : ""} font-semibold`}>
              B
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${toolbarButtonBase} ${editor.isActive("italic") ? toolbarButtonActive : ""} italic`}>
              I
            </button>
          </div>

          {/* Group: Heading */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-1.5 py-1 dark:border-gray-700 dark:bg-[#111]">
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${toolbarButtonBase} ${editor.isActive("heading", { level: 1 }) ? toolbarButtonActive : ""}`}>
              H1
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${toolbarButtonBase} ${editor.isActive("heading", { level: 2 }) ? toolbarButtonActive : ""}`}>
              H2
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${toolbarButtonBase} ${editor.isActive("heading", { level: 3 }) ? toolbarButtonActive : ""}`}>
              H3
            </button>
          </div>

          {/* Group: List */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-1.5 py-1 dark:border-gray-700 dark:bg-[#111]">
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${toolbarButtonBase} ${editor.isActive("bulletList") ? toolbarButtonActive : ""}`}>
              • List
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${toolbarButtonBase} ${editor.isActive("orderedList") ? toolbarButtonActive : ""}`}>
              1. List
            </button>
          </div>

          {/* Group: Insert */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-1.5 py-1 dark:border-gray-700 dark:bg-[#111]">
            <button type="button" onClick={addImage} className={toolbarButtonBase}>
              Ảnh (URL)
            </button>
          </div>

          {/* Spacer */}
          <div className="hidden flex-1 sm:block" />

          {/* Group: Undo/Redo */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-1.5 py-1 ml-auto dark:border-gray-700 dark:bg-[#111]">
            <button type="button" onClick={() => editor.chain().focus().undo().run()} className={toolbarButtonBase}>
              Undo
            </button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} className={toolbarButtonBase}>
              Redo
            </button>
          </div>
        </div>
      </div>

      {/* Vùng soạn thảo */}
      <div className="px-4 py-3">
        <div className="rounded-xl bg-white px-3 py-2 shadow-inner dark:bg-[#0b0b0b]">
          <EditorContent
            editor={editor}
            className="
        min-h-[220px] max-h-[520px] overflow-y-auto
        prose max-w-none prose-sm sm:prose-base
        dark:prose-invert focus:outline-none
        [&_p]:my-2
        [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2
        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2.5 [&_h3]:mb-2
        [&_strong]:font-semibold
        [&_em]:italic
        [&_ul]:list-disc [&_ul]:pl-5
        [&_ol]:list-decimal [&_ol]:pl-5
        [&_li]:my-1
      "
          />
        </div>
      </div>
    </div>
  );
}
