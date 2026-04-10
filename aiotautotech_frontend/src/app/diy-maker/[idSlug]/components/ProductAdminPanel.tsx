// src/app/diy-maker/[idSlug]/components/ProductAdminPanel.tsx
'use client';

import Link from 'next/link';
import {
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  Squares2X2Icon,
  PhotoIcon,
  CursorArrowRaysIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';

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
  const editSections = [
    { key: 'basic', label: 'BASIC', icon: InformationCircleIcon },
    { key: 'description', label: 'DESC', icon: ChatBubbleLeftRightIcon },
    { key: 'features', label: 'FEATURES', icon: SparklesIcon },
    { key: 'bundle', label: 'BUNDLE', icon: Squares2X2Icon },
    { key: 'media', label: 'MEDIA', icon: PhotoIcon },
    { key: 'seo', label: 'SEO', icon: CursorArrowRaysIcon },
    { key: 'docs', label: 'DOCS', icon: WrenchScrewdriverIcon },
    { key: 'materials', label: 'MATERIALS', icon: CubeIcon },
  ] as const;

  const sortedMaterials = materials
    ? [...materials].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    : [];

  return (
    <div>
      <div className="mb-4 space-y-2">
        <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
          <div className="inline-flex min-w-full items-center gap-2">
            {editSections.map((section) => (
              <Link
                key={section.key}
                href={`/admin/products/${id}/edit/${section.key}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-500 bg-blue-600/80 text-white shadow-sm hover:bg-blue-500"
                aria-label={section.label}
                title={section.label}
              >
                <section.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Link
            href="/admin/materials/"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-500 bg-green-600/80 text-white shadow-sm hover:bg-green-500"
            title="Materials List"
            aria-label="MATERIAL LIST"
          >
            <SwatchIcon className="h-4 w-4" />
          </Link>
        </div>
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
