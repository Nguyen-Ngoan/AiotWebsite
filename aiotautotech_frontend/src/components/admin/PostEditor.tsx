// src/components/admin/PostEditor.tsx
"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

// 👉 Table extensions
import { TableKit } from "@tiptap/extension-table";

interface PostEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
}

export default function PostEditor({ initialContent = "", onChange }: PostEditorProps) {
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
      TableKit.configure({
        table: {
          HTMLAttributes: { class: "aiot-table" },
        },
      }),
      Image,
    ],
    content: initialContent || "<p>Nhập nội dung bài viết tại đây...</p>",
    autofocus: "end",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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

  // 👉 CHÈN CITE CÓ CLASS ĐỂ FORMAT: .aiot-cite
  const insertCite = () => {
    editor.chain().focus().insertContent('<p class="aiot-cite">— Tên người, chức danh (có thể sửa)</p>').run();
  };

  // style button toolbar
  const btnBase = "inline-flex items-center justify-center h-7 w-7 rounded-[4px] border border-transparent text-[13px] text-gray-300 hover:bg-[#2b2b2b] active:bg-[#333333]";
  const btnActive = "bg-[#3a3a3a] border-[#5e5e5e] text-gray-50";
  const iconButtonClass = (active: boolean) => `${btnBase} ${active ? btnActive : ""}`;

  const Separator = () => <div className="mx-1 h-6 w-px bg-[#303030] opacity-80" />;

  return (
    // Giới hạn chiều cao theo viewport, body editor scroll riêng
    <div className="relative flex max-h-[calc(100vh-220px)] flex-col rounded-2xl border border-[#2a2a2a] bg-[#121212] shadow-sm">
      {/* Toolbar */}
      <div className="rounded-t-2xl border-b border-[#2b2b2b] bg-[#1e1e1e] px-3 py-1.5 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Bold / Italic */}
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={iconButtonClass(editor.isActive("bold"))}>
            <span className="font-semibold leading-none">B</span>
            <span className="sr-only">Bold</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={iconButtonClass(editor.isActive("italic"))}>
            <span className="italic leading-none">I</span>
            <span className="sr-only">Italic</span>
          </button>

          <Separator />

          {/* Heading H1 / H2 / H3 */}
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={iconButtonClass(editor.isActive("heading", { level: 1 }))}>
            <span className="text-[14px] font-semibold leading-none">T</span>
            <span className="sr-only">Heading 1</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={iconButtonClass(editor.isActive("heading", { level: 2 }))}>
            <span className="text-[12px] font-semibold leading-none">T</span>
            <span className="sr-only">Heading 2</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={iconButtonClass(editor.isActive("heading", { level: 3 }))}>
            <span className="text-[11px] font-semibold leading-none">T</span>
            <span className="sr-only">Heading 3</span>
          </button>

          <Separator />

          {/* List */}
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={iconButtonClass(editor.isActive("bulletList"))}>
            <span className="flex flex-col items-start justify-center gap-[1px] leading-none">
              <span className="flex items-center gap-[3px]">
                <span className="h-[3px] w-[3px] rounded-full bg-gray-300" />
                <span className="h-[1px] w-[10px] bg-gray-400" />
              </span>
              <span className="flex items-center gap-[3px]">
                <span className="h-[3px] w-[3px] rounded-full bg-gray-300" />
                <span className="h-[1px] w-[10px] bg-gray-400" />
              </span>
            </span>
            <span className="sr-only">Bullet list</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={iconButtonClass(editor.isActive("orderedList"))}>
            <span className="flex flex-col items-start justify-center gap-[1px] leading-none text-[10px]">
              <span className="flex items-center gap-[3px]">
                <span>1.</span>
                <span className="h-[1px] w-[10px] bg-gray-400" />
              </span>
              <span className="flex items-center gap-[3px]">
                <span>2.</span>
                <span className="h-[1px] w-[10px] bg-gray-400" />
              </span>
            </span>
            <span className="sr-only">Numbered list</span>
          </button>

          <Separator />

          {/* Quote / Cite */}
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={iconButtonClass(editor.isActive("blockquote"))}>
            <span className="text-[13px] leading-none">“ ”</span>
            <span className="sr-only">Blockquote</span>
          </button>
          <button type="button" onClick={insertCite} className={iconButtonClass(false)}>
            <span className="text-[14px] leading-none">—</span>
            <span className="sr-only">Cite</span>
          </button>

          <Separator />

          {/* Image */}
          <button type="button" onClick={addImage} className={iconButtonClass(false)}>
            <span className="relative h-4 w-5 rounded-[3px] border border-gray-400">
              <span className="absolute left-[2px] bottom-[3px] h-[4px] w-[6px] rotate-[315deg] border-b border-l border-gray-400" />
              <span className="absolute right-[3px] top-[3px] h-[2px] w-[2px] rounded-full bg-gray-400" />
            </span>
            <span className="sr-only">Image</span>
          </button>

          {/* đẩy Undo/Redo sang phải */}
          <div className="flex-1" />

          {/* Undo / Redo */}
          <button type="button" onClick={() => editor.chain().focus().undo().run()} className={iconButtonClass(false)}>
            <span className="text-[13px] leading-none">↺</span>
            <span className="sr-only">Undo</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} className={iconButtonClass(false)}>
            <span className="text-[13px] leading-none">↻</span>
            <span className="sr-only">Redo</span>
          </button>
        </div>
      </div>

      {/* Body editor scroll riêng, format giống post detail + TABLE */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="min-h-[220px] rounded-b-2xl border border-[#2b2b2b] bg-black px-3 py-2 text-sm text-gray-100 shadow-inner">
          <EditorContent
            editor={editor}
            className={`
              prose max-w-none
              text-[16px] sm:text-[17px] leading-relaxed
              text-gray-100 dark:prose-invert

              not-italic
              [&_p]:not-italic
              [&_li]:not-italic

              /* Paragraph */
              [&_p]:my-4
              [&_p:first-of-type]:mt-0

              /* Heading trong bài */
              [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-8 [&_h1]:mb-3
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
              [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2

              /* Danh sách */
              [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5
              [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5
              [&_li]:my-1

              /* Link */
              [&_a]:text-blue-400
              [&_a]:underline-offset-2
              [&_a]:hover:text-blue-300 [&_a]:hover:underline

              /* Strong / em */
              [&_strong]:font-semibold
              [&_em]:italic

              /* Ảnh & figure */
              [&_figure]:my-8 [&_figure]:mx-auto [&_figure]:max-w-full
              [&_figure_img]:rounded-xl [&_figure_img]:shadow-lg
              [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-md

              /* Caption */
              [&_figcaption]:mt-3 [&_figcaption]:text-[11px] [&_figcaption]:leading-snug [&_figcaption]:text-gray-400

              /* Blockquote */
              [&_blockquote]:my-6 [&_blockquote]:border-l [&_blockquote]:border-gray-700
              [&_blockquote]:pl-4 [&_blockquote]:text-gray-100
              [&_blockquote_p]:my-0

              /* Divider */
              [&_hr]:my-10 [&_hr]:border-gray-800

              /* Citation */
              [&_p.aiot-cite]:mt-1
              [&_p.aiot-cite]:text-[13px] sm:[&_p.aiot-cite]:text-[14px]
              [&_p.aiot-cite]:text-gray-400
              [&_p.aiot-cite]:not-italic

              /* TABLE: trong editor */
              [&_table]:w-full
              [&_table]:border-collapse
              [&_table]:text-[14px]
              [&_table]:my-4
              [&_th]:border [&_th]:border-gray-700 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-[#111827] [&_th]:font-semibold
              [&_td]:border [&_td]:border-gray-700 [&_td]:px-3 [&_td]:py-2
              [&_tr:nth-child(even)]:bg-[#020617]
              [&_tr:nth-child(odd)]:bg-black
              [&_thead]:bg-[#111827]
              /* responsive: cho phép kéo ngang nếu bảng rộng */
              [&_table]:block
              [&_table]:overflow-x-auto
              [&_table]:whitespace-nowrap
            `}
          />
        </div>
      </div>
    </div>
  );
}
