// src/app/diy-maker/[idSlug]/components/ProductAdminPanel.tsx
'use client';

import { useState } from 'react';
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
  keyFeatures?: string[];
  useCases?: string[];
  limitations?: string[];
  compatibility?: string[];
  specs?: ProductSpecItem[];
  structuredDataForAI?: Record<string, any>;
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
  title,
  priceLabel,
  sku,
  statusLabel,
  typeLabel,
  created_at,
  updated_at,
  keyFeatures,
  useCases,
  limitations,
  compatibility,
  specs,
  structuredDataForAI,
  totalMaterialCost,
  materials,
}: ProductAdminPanelProps) {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isMaterialsPanelOpen, setIsMaterialsPanelOpen] = useState(false);

  const hasAnyFeatures = Boolean(
    (keyFeatures && keyFeatures.length > 0) ||
      (useCases && useCases.length > 0) ||
      (limitations && limitations.length > 0) ||
      (compatibility && compatibility.length > 0) ||
      (specs && specs.length > 0)
  );

  const sortedMaterials = materials
    ? [...materials].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    : [];

  return (
    <div className="rounded-xl border border-gray-800 bg-[#050608]">
      <div
        className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 pl-3 pr-3 sm:pl-4 sm:pr-4"
        onClick={() => setIsMainOpen(!isMainOpen)}
      >
        <div className="flex flex-1 items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#8883c8]">Admin Panel</h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/materials/`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center rounded-full border border-green-500 bg-green-600/80 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-green-500"
              title="Materials List"
            >
              Material
            </Link>
            <Link
              href={`/admin/products/${id}/edit`}
              onClick={(e) => e.stopPropagation()} // Ngăn panel đóng/mở khi click nút
              className="inline-flex items-center rounded-full border border-blue-500 bg-blue-600/80 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-blue-500"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="relative ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 ${isMainOpen ? 'block' : 'hidden'}`}
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
            className={`h-3.5 w-3.5 ${isMainOpen ? 'hidden' : 'block'}`}
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
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isMainOpen ? 'max-h-[3000px]' : 'max-h-0'
        }`}
      >
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

          {/* Materials List Section */}
          {materials && materials.length > 0 && (
            <div className="mt-4 rounded-lg border border-gray-700/60 bg-black/30">
              <div
                className="flex cursor-pointer list-none items-center justify-between p-2 hover:bg-gray-800/50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMaterialsPanelOpen(!isMaterialsPanelOpen);
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Danh sách vật tư ({materials.length})
                </span>
                <div className="relative ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-600 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 ${
                      isMaterialsPanelOpen ? 'block' : 'hidden'
                    }`}
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
                    className={`h-3 w-3 ${
                      isMaterialsPanelOpen ? 'hidden' : 'block'
                    }`}
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
              </div>
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                  isMaterialsPanelOpen ? 'max-h-[2000px]' : 'max-h-0'
                }`}
              >
                <div className="border-t border-gray-700/60 p-2">
                  <table className="w-full text-[11px] text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-700/50 text-gray-500">
                        <th className="pb-1 pl-1 text-left font-medium">
                          Tên vật tư
                        </th>
                        <th className="pb-1 text-center font-medium">SL</th>
                        <th className="pb-1 pr-1 text-right font-medium">
                          Tổng
                        </th>
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
                            {(m.current_cost * m.quantity).toLocaleString(
                              'en-US'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-700/50 font-semibold">
                        <td
                          className="py-2 pl-1 text-left text-gray-400"
                          colSpan={2}
                        >
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
            </div>
          )}

          {/* AI Structured Data Section */}
          {structuredDataForAI && (
            <div className="mt-4 rounded-lg border border-gray-700/60 bg-black/30">
              <div
                className="flex cursor-pointer list-none items-center justify-between p-2 hover:bg-gray-800/50"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click lan ra panel cha
                  setIsAiPanelOpen(!isAiPanelOpen);
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Dữ liệu cho AI (JSON-LD)
                </span>
                <div className="relative ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-600 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 ${isAiPanelOpen ? 'block' : 'hidden'}`}
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
                    className={`h-3 w-3 ${isAiPanelOpen ? 'hidden' : 'block'}`}
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
              </div>
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                  isAiPanelOpen ? 'max-h-[2000px]' : 'max-h-0'
                }`}
              >
                <div className="border-t border-gray-700/60 p-2">
                  <pre className="whitespace-pre-wrap break-all rounded-md bg-black/50 p-2 text-[10px] font-mono text-gray-300">
                    <code>{JSON.stringify(structuredDataForAI, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
