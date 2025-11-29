// src/app/diy-maker/[idSlug]/components/ProductAdminPanel.tsx
'use client';

import Link from 'next/link';
import type { ProductSpecItem } from '../ProductDetailPage';

export interface ProductAdminPanelProps {
  id: string;
  title?: string;
  sku?: string;
  priceLabel?: string;
  statusLabel?: string;
  typeLabel?: string;
  created_at?: string;
  updated_at?: string;
  key_features?: string[];
  use_cases?: string[];
  limitations?: string[];
  compatibility?: string[];
  specs?: ProductSpecItem[];
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
  key_features,
  use_cases,
  limitations,
  compatibility,
  specs,
}: ProductAdminPanelProps) {
  const hasAnyFeatures = Boolean(
    (key_features && key_features.length > 0) ||
      (use_cases && use_cases.length > 0) ||
      (limitations && limitations.length > 0) ||
      (compatibility && compatibility.length > 0) ||
      (specs && specs.length > 0)
  );

  return (
    <details
      className="group rounded-xl border border-gray-800 bg-[#050608]"
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 pl-3 pr-4 sm:pl-4 sm:pr-6">
        <div className="flex flex-1 items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#8883c8]">
            Admin Product Info
          </h2>
          <Link
            href={`/admin/products/${id}/edit`}
            onClick={(e) => e.stopPropagation()} // Ngăn panel đóng/mở khi click nút
            className="hidden items-center rounded-full border border-blue-500 bg-blue-600/80 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-blue-500 sm:inline-flex"
          >
            Edit Product
          </Link>
        </div>

        <div className="relative ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="hidden h-3.5 w-3.5 group-open:block"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 group-open:hidden"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </summary>
      <div className="border-t border-gray-800 px-4 pb-4 pt-3 sm:px-6 sm:pb-4 sm:pt-3">
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

        {/* AI Data Section */}
        <div className="mt-4 rounded-lg border border-gray-700/60 bg-black/30 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Dữ liệu cho AI
          </h3>
          {!hasAnyFeatures && (
            <p className="text-xs text-gray-500">
              Chưa khai báo phần Features cho sản phẩm này.
            </p>
          )}

          <div className="space-y-3 text-xs">
            {key_features && key_features.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-300">Key features</h4>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-400">
                  {key_features.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {use_cases && use_cases.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-300">
                  Use cases / Ứng dụng
                </h4>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-400">
                  {use_cases.map((uc, idx) => (
                    <li key={idx}>{uc}</li>
                  ))}
                </ul>
              </div>
            )}

            {limitations && limitations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-300">
                  Giới hạn / Lưu ý
                </h4>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-400">
                  {limitations.map((lm, idx) => (
                    <li key={idx}>{lm}</li>
                  ))}
                </ul>
              </div>
            )}

            {compatibility && compatibility.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-300">Tương thích</h4>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-400">
                  {compatibility.map((cp, idx) => (
                    <li key={idx}>{cp}</li>
                  ))}
                </ul>
              </div>
            )}

            {specs && specs.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-300">
                  Thông số kỹ thuật
                </h4>
                <div className="mt-1.5 overflow-hidden rounded-md border border-gray-800 bg-black/40 text-[11px]">
                  <table className="min-w-full border-collapse">
                    <tbody>
                      {specs.map((item, idx) => {
                        if (!item || (!item.key && !item.value)) return null;
                        return (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? 'bg-black/40' : 'bg-black/20'
                            }
                          >
                            <td className="w-1/3 border-b border-gray-800 px-2 py-1.5 font-medium text-gray-300">
                              {item.key || '—'}
                            </td>
                            <td className="border-b border-gray-800 px-2 py-1.5 text-gray-400">
                              {item.value || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin note */}
        <div className="mt-4 rounded-lg border border-dashed border-gray-700 bg-black/30 px-3 py-2 text-[11px] text-gray-400">
          <p>
            Panel này chỉ hiển thị cho admin. Dùng link
            <Link
              href={`/admin/products/${id}/edit`}
              className="font-semibold text-blue-400 hover:underline"
            >
              {' '}
              sửa sản phẩm{' '}
            </Link>
            để chỉnh sửa nhanh.
          </p>
        </div>
      </div>
    </details>
  );
}
