// src/app/diy-maker/[idSlug]/components/ProductAdminPanel.tsx

import Link from 'next/link';

export interface ProductAdminPanelProps {
  id: string;
  title?: string;
  priceLabel?: string;
  status?: string;
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
  status,
  created_at,
  updated_at,
}: ProductAdminPanelProps) {
  const editHref = `/admin/products/${id}/edit`;

  return (
    <section className="rounded-xl border border-gray-800 bg-[#050608] p-4 text-xs text-gray-300">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-100">Admin panel</h2>
        <Link
          href={editHref}
          className="inline-flex items-center rounded-full border border-blue-500 bg-blue-600/80 px-3 py-1 text-[11px] font-medium text-white hover:bg-blue-500"
        >
          Sửa sản phẩm
        </Link>
      </div>

      <dl className="space-y-1">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">ID</dt>
          <dd className="font-mono text-gray-200">{id}</dd>
        </div>

        {title && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Tên</dt>
            <dd className="max-w-[180px] text-right text-gray-100 line-clamp-2">
              {title}
            </dd>
          </div>
        )}

        {priceLabel && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Giá</dt>
            <dd className="text-gray-100">{priceLabel}</dd>
          </div>
        )}

        {status && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Trạng thái</dt>
            <dd className="text-gray-100">{status}</dd>
          </div>
        )}

        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Tạo lúc</dt>
          <dd className="text-gray-100">{formatDate(created_at)}</dd>
        </div>

        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Cập nhật</dt>
          <dd className="text-gray-100">{formatDate(updated_at)}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-lg border border-dashed border-gray-700 bg-black/30 px-3 py-2 text-[11px] text-gray-400">
        <p>
          Panel này chỉ hiển thị cho bạn (admin). Bạn có thể dùng link{' '}
          <span className="font-mono">{editHref}</span> để chỉnh sửa nhanh thông
          tin sản phẩm trong khu vực quản trị.
        </p>
      </div>
    </section>
  );
}
