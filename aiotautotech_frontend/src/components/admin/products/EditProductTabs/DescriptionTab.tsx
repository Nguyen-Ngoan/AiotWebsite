// src/components/admin/products/EditProductTabs/DescriptionTab.tsx

"use client";

import { ProductFormState } from "@/app/admin/products/productFormTypes";

interface DescriptionTabProps {
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
}

export default function DescriptionTab({ form, setForm }: DescriptionTabProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Nội dung mô tả (HTML)</label>
      <textarea className="mt-1 block w-full min-h-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.descriptionHtml} onChange={(e) => setForm({ ...form, descriptionHtml: e.target.value })} placeholder="<p>Mô tả chi tiết sản phẩm, bảng thông số kỹ thuật...</p>" />
      <p className="text-xs text-gray-500">Bạn có thể dán HTML đã format từ editor (Tiptap) vào đây.</p>
    </div>
  );
}
