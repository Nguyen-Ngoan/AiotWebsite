// src/components/admin/products/ProductSummaryCard.tsx

"use client";

import { ProductFormState } from "./productFormTypes";

interface ProductSummaryCardProps {
  form: ProductFormState;
}

export default function ProductSummaryCard({ form }: ProductSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#050608] p-4 text-xs text-gray-300">
      {/* Ảnh chính sản phẩm */}
      {form.mainImageUrl && (
        <div className="mb-3 overflow-hidden rounded-xl border border-gray-800 bg-black/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.mainImageUrl} alt={form.title || "Ảnh sản phẩm"} className="h-40 w-full object-cover" />
        </div>
      )}

      <h2 className="mb-2 text-sm font-semibold text-gray-100">Tóm tắt sản phẩm</h2>

      <p className="mb-1 text-sm font-semibold text-gray-100">{form.title || "Chưa đặt tên"}</p>

      <p className="mb-1">
        <span className="text-gray-500">Slug: </span>
        {form.slug || "Chưa có"}
      </p>
      <p className="mb-1">
        <span className="text-gray-500">Loại: </span>
        {form.productType === "bundle" ? "Bundle / Kit" : form.productType === "service" ? "Dịch vụ" : "Simple"}
      </p>
      <p className="mb-1">
        <span className="text-gray-500">Trạng thái: </span>
        {form.status === "active" ? "Đang bán" : form.status === "archived" ? "Ngừng bán" : "Draft"}
      </p>

      {form.shortDescription && <p className="mt-2 text-gray-400">{form.shortDescription.length > 160 ? form.shortDescription.slice(0, 160) + "..." : form.shortDescription}</p>}
    </div>
  );
}
