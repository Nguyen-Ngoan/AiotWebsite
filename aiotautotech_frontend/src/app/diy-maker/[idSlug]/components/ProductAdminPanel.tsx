// src/app/diy-maker/[idSlug]/components/ProductAdminPanel.tsx

import Link from 'next/link';

export interface ProductAdminPanelProps {
  id: string;
  title?: string;
  sku?: string;
  priceLabel?: string;
  statusLabel?: string;
  typeLabel?: string;
  created_at?: string;
  updated_at?: string;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Không rõ';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProductAdminPanel({
  id,
  title,
  priceLabel,
  sku,
  statusLabel,
  typeLabel,
  created_at,
  updated_at,
}: ProductAdminPanelProps) {
  return (
    <section className="rounded-xl border border-gray-800 bg-[#050608] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-100">
          Thông tin sản phẩm
        </h2>
        <Link
          href={`/admin/products/${id}/edit`}
          className="inline-flex items-center rounded-full border border-blue-500 bg-blue-600/80 px-3 py-1 text-[11px] font-medium text-white hover:bg-blue-500"
        >
          Sửa sản phẩm
        </Link>
      </div>

      <dl className="space-y-1 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">ID</dt>
          <dd className="font-mono text-gray-200">{id}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">SKU</dt>
          <dd className="font-mono text-gray-200">{sku || 'Chưa có'}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Trạng thái</dt>
          <dd className="text-gray-100">{statusLabel}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Loại</dt>
          <dd className="text-gray-100">{typeLabel}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Giá</dt>
          <dd className="text-gray-100">{priceLabel}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Tạo lúc</dt>
          <dd className="text-gray-100">{formatDate(created_at)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Cập nhật</dt>
          <dd className="text-gray-100">{formatDate(updated_at)}</dd>
        </div>
      </dl>

      {/* Admin note */}
      <div className="mt-4 rounded-lg border border-dashed border-gray-700 bg-black/30 px-3 py-2 text-[11px] text-gray-400">
        <p>
          Panel này chỉ hiển thị cho admin. Bạn có thể dùng link sửa ở trên để
          chỉnh sửa nhanh thông tin sản phẩm.
        </p>
      </div>
    </section>
  );
}
