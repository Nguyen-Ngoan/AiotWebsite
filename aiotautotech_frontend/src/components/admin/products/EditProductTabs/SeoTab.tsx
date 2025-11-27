// src/components/admin/products/EditProductTabs/SeoTab.tsx

"use client";

import { ProductFormState } from "@/app/admin/products/productFormTypes";

interface SeoTabProps {
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
}

export default function SeoTab({ form, setForm }: SeoTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">SEO title</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="Tiêu đề hiển thị trên tab & search result" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">SEO description</label>
        <textarea className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" rows={3} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="Mô tả ngắn cho SEO (160 ký tự)..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">OG image (og_image)</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder="URL ảnh chia sẻ social" />
      </div>
    </div>
  );
}
