// src/components/admin/products/EditProductTabs/DescriptionTab.tsx

'use client';
import dynamic from 'next/dynamic';
import { ProductFormState } from '@/app/admin/products/productFormTypes';

interface DescriptionTabProps {
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
}
// Import PostEditor động vì nó là một component lớn và chỉ dùng ở client
const PostEditor = dynamic(() => import('@/components/admin/PostEditor'), {
  ssr: false,
  loading: () => (
    <div className="mt-1 block w-full min-h-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm">
      Đang tải trình soạn thảo...
    </div>
  ),
});
export default function DescriptionTab({ form, setForm }: DescriptionTabProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Nội dung mô tả chi tiết
      </label>

      <PostEditor
        initialContent={form.descriptionHtml}
        onChange={(newHtml) => {
          setForm({ ...form, descriptionHtml: newHtml });
        }}
        placeholder=""
      />

      <p className="text-xs text-gray-500">
        Bạn có thể dùng tiêu đề (H1–H3), danh sách, in đậm, in nghiêng, chèn ảnh
        (URL) và bảng (table).
      </p>
    </div>
  );
}
