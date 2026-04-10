// src/app/diy-maker/[idSlug]/components/ProductAdminPanel.tsx
'use client';

import Link from 'next/link';

export interface ProductAdminPanelProps {
  id: string;
  sku?: string;
  priceLabel?: string;
  statusLabel?: string;
  created_at?: string;
  updated_at?: string;
  totalMaterialCost?: number;
  materials?: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    current_cost: number;
  }[];
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
  priceLabel,
  sku,
  statusLabel,
  created_at,
  updated_at,
  totalMaterialCost,
  materials,
}: ProductAdminPanelProps) {
  const sortedMaterials = materials
    ? [...materials].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2">
        <Link
          href={`/admin/materials/`}
          className="inline-flex items-center rounded-full border border-green-500 bg-green-600/80 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-green-500"
          title="Materials List"
        >
          Material
        </Link>
        <Link
          href={`/admin/products/${id}/edit`}
          className="inline-flex items-center rounded-full border border-blue-500 bg-blue-600/80 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-blue-500"
        >
          Edit
        </Link>
      </div>
      <div>
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
            <dt className="text-gray-500">Giá</dt>
            <dd className="text-gray-100">{priceLabel}</dd>
          </div>
          {typeof totalMaterialCost === 'number' && (
            <div className="flex justify-between gap-2">
              <dt className="text-gray-500">Chi phí vật tư</dt>
              <dd className="font-semibold text-yellow-400">
                {totalMaterialCost.toLocaleString('vi-VN')}₫
              </dd>
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

        {materials && materials.length > 0 && (
          <div className="mt-4 rounded-md border border-gray-700/60 bg-black/30 p-2">
            <div className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Danh sách vật tư ({materials.length})
            </div>
            <div className="border-t border-gray-700/60 pt-2">
              <table className="w-full text-[11px] text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700/50 text-gray-500">
                    <th className="pb-1 pl-1 text-left font-medium">Tên vật tư</th>
                    <th className="pb-1 text-center font-medium">SL</th>
                    <th className="pb-1 pr-1 text-right font-medium">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMaterials.map((m, idx) => (
                    <tr
                      key={m.id || idx}
                      className="border-b border-gray-800/50 last:border-0 hover:bg-white/5"
                    >
                      <td className="py-1 pl-1 align-top">{m.name}</td>
                      <td className="whitespace-nowrap py-1 text-center align-top text-gray-500">
                        {m.quantity}
                      </td>
                      <td className="whitespace-nowrap py-1 pr-1 text-right align-top font-mono text-gray-400">
                        {(m.current_cost * m.quantity).toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-700/50 font-semibold">
                    <td className="py-2 pl-1 text-left text-gray-400" colSpan={2}>
                      Tổng cộng
                    </td>
                    <td className="whitespace-nowrap py-2 pr-1 text-right font-mono text-yellow-400">
                      {(totalMaterialCost || 0).toLocaleString('en-US')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
