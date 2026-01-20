// src/components/admin/PostEditor.tsx
'use client';

import {
  useEffect,
  useState,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';

interface PostEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  toolbarActions?: ReactNode;
}

const Separator = () => (
  <div className="mx-1 h-7 w-px bg-[#303030] opacity-80" />
);

const getViewportSnapshot = () =>
  typeof window === 'undefined'
    ? 0
    : window.visualViewport?.height ?? window.innerHeight;

const subscribeViewport = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};

  const visualViewport = window.visualViewport;
  const handler = () => callback();

  visualViewport?.addEventListener('resize', handler);
  visualViewport?.addEventListener('scroll', handler);
  window.addEventListener('resize', handler);

  return () => {
    visualViewport?.removeEventListener('resize', handler);
    visualViewport?.removeEventListener('scroll', handler);
    window.removeEventListener('resize', handler);
  };
};

/* ================= ICONS (SVG) ================= */

const IconBold = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M7 5h6a3 3 0 010 6H7z" />
    <path d="M7 11h7a3 3 0 010 6H7z" />
  </svg>
);

const IconItalic = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M10 5h8" />
    <path d="M6 19h8" />
    <path d="M14 5L10 19" />
  </svg>
);

const IconBulletList = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="5" cy="7" r="1.5" />
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="5" cy="17" r="1.5" />
    <path d="M10 7h9" />
    <path d="M10 12h9" />
    <path d="M10 17h9" />
  </svg>
);

const IconNumberList = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M5 6h2v8" />
    <path d="M4 18h4" />
    <path d="M11 7h9" />
    <path d="M11 12h9" />
    <path d="M11 17h9" />
  </svg>
);

const IconQuote = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M7 7h5v5H8a3 3 0 00-3 3v1" />
    <path d="M17 7h5v5h-4a3 3 0 00-3 3v1" />
  </svg>
);

const IconCite = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M5 12h14" />
    <path d="M7 8h10" />
    <path d="M9 16h6" />
  </svg>
);

const IconImage = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M8 17l3.5-4 3 3 2.5-3" />
  </svg>
);

const IconCode = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const IconSymbol = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M7 5h7a3 3 0 010 6H9a3 3 0 000 6h7" />
  </svg>
);

const IconUndo = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M9 5L5 9l4 4" />
    <path d="M5 9h6a5 5 0 015 5v1" />
  </svg>
);

const IconRedo = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M15 5l4 4-4 4" />
    <path d="M19 9h-6a5 5 0 00-5 5v1" />
  </svg>
);

/* ================= COMPONENT ================= */

export default function PostEditor({
  initialContent = '',
  onChange,
  placeholder,
  toolbarActions,
}: PostEditorProps) {
  const [showSymbols, setShowSymbols] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);
  const hasToolbarActions = Boolean(toolbarActions);
  const viewportHeight = useSyncExternalStore(
    subscribeViewport,
    getViewportSnapshot,
    () => 0
  );
  const isMobile =
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 640px)').matches
      : false;


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TableKit.configure({
        table: {
          HTMLAttributes: { class: 'aiot-table' },
        },
      }),
      Image,
    ],
    content: initialContent || (placeholder ? `<p>${placeholder}</p>` : ''),
    autofocus: 'end',
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

  // Logic để hiển thị/ẩn các nút cuộn của toolbar
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = toolbar;
      // Hiển thị nút cuộn trái nếu đã cuộn sang phải
      setShowScrollLeft(scrollLeft > 0);
      // Hiển thị nút cuộn phải nếu nội dung còn lại lớn hơn vùng hiển thị
      setShowScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 để xử lý sai số pixel
    };

    // Kiểm tra lần đầu khi component mount
    checkScroll();

    // Thêm event listener để kiểm tra lại khi cuộn hoặc resize
    toolbar.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    // Dọn dẹp event listener khi component unmount
    return () => {
      toolbar.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [editor]); // Thêm editor vào dependency array để đảm bảo toolbarRef đã sẵn sàng

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const insertCite = () => {
    editor
      .chain()
      .focus()
      .insertContent('<p class="aiot-cite">— Name, position (you can edit)</p>')
      .run();
  };

  const insertSymbol = (symbol: string) => {
    editor.chain().focus().insertContent(symbol).run();
  };

  const scrollToolbar = (direction: 'left' | 'right') => {
    toolbarRef.current?.scrollBy({
      left: direction === 'left' ? -250 : 250,
      behavior: 'smooth',
    });
  };

  const symbolList = [
    '°C',
    'Ω',
    'µ',
    'µF',
    'kΩ',
    'MΩ',
    '±',
    '→',
    '←',
    '⇄',
    '²',
    '³',
    '≤',
    '≥',
  ];

  const btnBase =
    'inline-flex items-center justify-center h-8 px-2 rounded-md border border-[#3b3b3b] bg-[#262626] text-[13px] font-semibold text-gray-100 hover:bg-[#333333] hover:border-[#5a5a5a] active:bg-[#3b3b3b] active:border-[#777777]';
  const btnActive =
    'bg-[#404040] border-[#8a8a8a] text-white shadow-inner shadow-black/60';
  const iconButtonClass = (active: boolean) =>
    `${btnBase} ${active ? btnActive : ''}`;

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };

  const handleHeadingChange = (value: string) => {
    const chain = editor.chain().focus();
    if (value === 'paragraph') {
      chain.setParagraph().run();
    } else if (value === 'h1') {
      chain.setHeading({ level: 1 }).run();
    } else if (value === 'h2') {
      chain.setHeading({ level: 2 }).run();
    } else if (value === 'h3') {
      chain.setHeading({ level: 3 }).run();
    }
  };

  return (
    <div
      className="relative flex w-full flex-col rounded-2xl border border-[#2a2a2a] bg-[#121212] pt-12 shadow-sm sm:h-full sm:max-h-[calc(100vh-250px)] sm:pt-0"
      style={
        isMobile && viewportHeight > 0
          ? { height: `${Math.round(viewportHeight)}px` }
          : undefined
      }
    >
      {/* TOOLBAR CONTAINER */}
      <div className="fixed inset-x-0 top-[env(safe-area-inset-top)] z-30 rounded-none border-b-0 bg-[#1a1a1a] px-1 shadow-sm sm:sticky sm:inset-x-auto sm:top-0 sm:z-20 sm:rounded-t-2xl sm:border-b sm:border-[#2b2b2b]">
        {/* Nút cuộn trái */}
        {showScrollLeft && (
          <button
            type="button"
            onClick={() => scrollToolbar('left')}
            className={`absolute top-0 z-10 h-full w-8 bg-linear-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent ${
              hasToolbarActions ? 'left-10' : 'left-0'
            }`}
          >
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        {/* Nút cuộn phải */}
        {showScrollRight && (
          <button
            type="button"
            onClick={() => scrollToolbar('right')}
            className="absolute right-0 top-0 z-10 h-full w-8 bg-linear-to-l from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent"
          >
            <svg
              className="ml-auto h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
        {/* SCROLL AREA */}
        <div className="relative flex items-center">
          <div
            ref={toolbarRef}
            className={`hide-scrollbar w-full overflow-x-auto px-1 ${
              hasToolbarActions ? 'pl-11 pr-32' : 'pr-32'
            }`}
          >
            <div className="flex w-max items-center gap-1.5 px-2 py-1 text-xs">
            {/* Bold / Italic */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={iconButtonClass(editor.isActive('bold'))}
            >
              <IconBold />
              <span className="sr-only">Bold</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={iconButtonClass(editor.isActive('italic'))}
            >
              <IconItalic />
              <span className="sr-only">Italic</span>
            </button>

            <Separator />

            {/* Heading combobox (English) */}
            <div className="relative inline-flex items-center">
              <select
                className="h-8 appearance-none rounded-md border border-[#3a3a3a] bg-[#181818] px-2 pr-6 text-[12px] font-medium text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={getCurrentHeading()}
                onChange={(e) => handleHeadingChange(e.target.value)}
              >
                <option value="paragraph">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
              <span className="pointer-events-none absolute right-1 text-gray-400">
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <Separator />

            {/* Lists */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={iconButtonClass(editor.isActive('bulletList'))}
            >
              <IconBulletList />
              <span className="sr-only">Bullet list</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={iconButtonClass(editor.isActive('orderedList'))}
            >
              <IconNumberList />
              <span className="sr-only">Numbered list</span>
            </button>

            <Separator />

            {/* Quote / Cite */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={iconButtonClass(editor.isActive('blockquote'))}
            >
              <IconQuote />
              <span className="sr-only">Blockquote</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={iconButtonClass(editor.isActive('codeBlock'))}
            >
              <IconCode />
              <span className="sr-only">Code block</span>
            </button>
            <button
              type="button"
              onClick={insertCite}
              className={iconButtonClass(false)}
            >
              <IconCite />
              <span className="sr-only">Cite</span>
            </button>

            <Separator />

            {/* Image */}
            <button
              type="button"
              onClick={addImage}
              className={iconButtonClass(false)}
            >
              <IconImage />
              <span className="sr-only">Image</span>
            </button>

            {/* Symbols */}
            <button
              type="button"
              onClick={() => setShowSymbols((v) => !v)}
              className={iconButtonClass(showSymbols)}
            >
              <IconSymbol />
              <span className="sr-only">Symbols</span>
            </button>

            <div className="flex-1" />

            {/* Undo / Redo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              className={iconButtonClass(false)}
            >
              <IconUndo />
              <span className="sr-only">Undo</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              className={iconButtonClass(false)}
            >
              <IconRedo />
              <span className="sr-only">Redo</span>
            </button>
          </div>
          </div>
          {toolbarActions && (
            <div className="absolute left-1 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {toolbarActions}
            </div>
          )}
        </div>
      </div>

      {/* SYMBOL BAR */}
      {showSymbols && (
        <div className="border-b border-[#2b2b2b] bg-[#181818] px-3 py-2 text-[11px] text-gray-300">
          <div className="mb-1 font-medium">
            Common symbols (click to insert at caret):
          </div>
          <div className="flex flex-wrap gap-2">
            {symbolList.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => insertSymbol(sym)}
                className="rounded border border-[#3a3a3a] bg-[#111111] px-2.5 py-1.5 text-[12px] font-semibold text-gray-100 hover:bg-[#222222]"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-b-2xl bg-black px-3 py-2 text-sm text-gray-100 shadow-inner sm:min-h-[400px]">
        <EditorContent
          editor={editor}
          className={`
              prose max-w-none
              text-[16px] sm:text-[17px] leading-relaxed
              text-gray-100 dark:prose-invert

              not-italic
              [&_p]:not-italic
              [&_li]:not-italic

              [&_p]:my-2
              [&_p:first-of-type]:mt-0

              [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-6 [&_h1]:mb-3
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-[#80a2ff]
              [&_h3]:text-md [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-[#8046f3]

              [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5
              [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5
              [&_li]:my-1

              [&_a]:text-blue-400
              [&_a]:underline-offset-2
              [&_a]:hover:text-blue-300 [&_a]:hover:underline

              [&_strong]:font-semibold
              [&_em]:italic

              [&_figure]:my-8 [&_figure]:mx-auto [&_figure]:max-w-full
              [&_figure_img]:rounded-xl [&_figure_img]:shadow-lg
              [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-md

              [&_figcaption]:mt-3 [&_figcaption]:text-[11px] [&_figcaption]:leading-snug [&_figcaption]:text-gray-400

              [&_blockquote]:my-6 [&_blockquote]:border-l [&_blockquote]:border-gray-700
              [&_blockquote]:pl-4 [&_blockquote]:text-gray-100
              [&_blockquote_p]:my-0

              [&_hr]:my-10 [&_hr]:border-gray-800

              [&_p.aiot-cite]:mt-1
              [&_p.aiot-cite]:text-[13px] sm:[&_p.aiot-cite]:text-[14px]
              [&_p.aiot-cite]:text-gray-400
              [&_p.aiot-cite]:not-italic

              [&_table]:w-full
              [&_table]:border-collapse
              [&_table]:text-[14px]
              [&_table]:my-4
              [&_th]:border [&_th]:border-gray-700 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-[#111827] [&_th]:font-semibold
              [&_td]:border [&_td]:border-gray-700 [&_td]:px-3 [&_td]:py-2
              [&_tr:nth-child(even)]:bg-[#020617]
              [&_tr:nth-child(odd)]:bg-black
              [&_thead]:bg-[#111827]
              [&_table]:block
              [&_table]:overflow-x-auto
              [&_table]:whitespace-nowrap

              [&_pre]:bg-[#1e1e1e] [&_pre]:text-gray-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
              [&_code]:font-mono [&_code]:text-sm
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
            `}
        />
      </div>
    </div>
  );
}
