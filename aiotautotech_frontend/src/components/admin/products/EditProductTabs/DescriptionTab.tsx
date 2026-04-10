// src/components/admin/products/EditProductTabs/DescriptionTab.tsx

'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { ProductFormState } from '@/app/admin/products/[id]/edit/page';

interface DescriptionTabProps {
  form: ProductFormState;
  setForm: (
    f: ProductFormState | ((prev: ProductFormState) => ProductFormState)
  ) => void;
}
// Import PostEditor động vì nó là một component lớn và chỉ dùng ở client
const PostEditor = dynamic(() => import('@/components/admin/PostEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 text-center p-8">Loading Editor...</div>
  ),
});
export default function DescriptionTab({ form, setForm }: DescriptionTabProps) {
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeEditorHeight = () => {
      const editorAreaEl = editorAreaRef.current;
      if (!editorAreaEl) return;

      const isMobile = window.matchMedia('(max-width: 640px)').matches;
      if (!isMobile) {
        setEditorHeight(undefined);
        return;
      }

      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const editorTop = editorAreaEl.getBoundingClientRect().top;
      const availableHeight = viewportHeight - editorTop - 8;
      setEditorHeight(Math.max(220, Math.floor(availableHeight)));
    };

    const visualViewport = window.visualViewport;

    computeEditorHeight();
    visualViewport?.addEventListener('resize', computeEditorHeight);
    visualViewport?.addEventListener('scroll', computeEditorHeight);
    window.addEventListener('resize', computeEditorHeight);
    window.addEventListener('orientationchange', computeEditorHeight);

    return () => {
      visualViewport?.removeEventListener('resize', computeEditorHeight);
      visualViewport?.removeEventListener('scroll', computeEditorHeight);
      window.removeEventListener('resize', computeEditorHeight);
      window.removeEventListener('orientationchange', computeEditorHeight);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Nội dung mô tả chi tiết
        </label>
      </div>
      <div ref={editorAreaRef} className="flex-1 min-h-0">
        <PostEditor
          initialContent={form.descriptionHtml}
          onChange={(newHtml) => {
            setForm((prev) => ({
              ...prev,
              descriptionHtml: newHtml,
            }));
          }}
          placeholder=""
          fixedHeightPx={editorHeight}
        />
      </div>
    </div>
  );
}
