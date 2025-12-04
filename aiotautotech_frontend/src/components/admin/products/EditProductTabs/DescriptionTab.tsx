// src/components/admin/products/EditProductTabs/DescriptionTab.tsx

'use client';
import dynamic from 'next/dynamic';
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
  return (
    <div className="flex flex-col h-full">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Nội dung mô tả chi tiết
        </label>
      </div>
      <div className="flex-1">
        <PostEditor
          initialContent={form.descriptionHtml}
          onChange={(newHtml) => {
            setForm((prev) => ({
              ...prev,
              descriptionHtml: newHtml,
            }));
          }}
          placeholder=""
        />
      </div>
    </div>
  );
}
