// src/components/admin/products/ProductSummaryCard.tsx

'use client';

import { ProductFormState } from './productFormTypes';

interface ProductSummaryCardProps {
  form: ProductFormState;
}

export default function ProductSummaryCard({ form }: ProductSummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#050608] text-xs text-gray-300">
      <h2 className="bg-gray-800/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">
        Tóm tắt sản phẩm
      </h2>

      <div className="space-y-2 p-4">
        {/* Ảnh chính sản phẩm */}
        {form.mainImageUrl && (
          <div className="mb-2 overflow-hidden rounded-xl border border-gray-800 bg-black/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.mainImageUrl}
              alt={form.title || 'Ảnh sản phẩm'}
              className="h-40 w-full object-cover"
            />
          </div>
        )}

        <p className="text-sm font-semibold text-gray-100">
          {form.title || 'Chưa đặt tên'}
        </p>

        <p>
          <span className="text-gray-500">Slug: </span>
          {form.slug || 'Chưa có'}
        </p>
        <p>
          <span className="text-gray-500">Loại: </span>
          {form.productType === 'bundle'
            ? 'Bundle / Kit'
            : form.productType === 'service'
            ? 'Dịch vụ'
            : 'Simple'}
        </p>
        <p>
          <span className="text-gray-500">Trạng thái: </span>
          {form.status === 'active'
            ? 'Đang bán'
            : form.status === 'archived'
            ? 'Ngừng bán'
            : 'Draft'}
        </p>

        {form.shortDescription && (
          <p className="pt-2 text-gray-400">
            {form.shortDescription.length > 160
              ? form.shortDescription.slice(0, 160) + '...'
              : form.shortDescription}
          </p>
        )}
      </div>
    </div>
  );
}
