// src/app/diy-maker/[idSlug]/components/ProductTechDocs.tsx
'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { TechnicalDoc } from './technical-doc';

interface ProductTechDocsProps {
  docs?: TechnicalDoc[]; // Thay đổi từ object sang array
}

interface StlDoc extends TechnicalDoc {
  doc_type: 'stl_files';
  thumbnail_url?: string;
}

// Tải ModelViewer động vì nó là một component nặng và chỉ dùng ở client-side
const ModelViewer = dynamic(() => import('./ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-[#111] rounded-lg flex items-center justify-center text-sm text-gray-400">
      Đang tải trình xem 3D...
    </div>
  ),
});

const formatBytes = (bytes: number, decimals = 1) => {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `(${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]})`;
};

export function ProductTechDocs({ docs }: ProductTechDocsProps) {
  // State để quản lý việc hiển thị trình xem 3D cho file 3D (STL, STEP)
  const [visibleModelViewerId, setVisibleModelViewerId] = useState<
    string | null
  >(null);
  const [viewingDocInModal, setViewingDocInModal] =
    useState<TechnicalDoc | null>(null);

  if (!docs || docs.length === 0) {
    return null; // Hoặc hiển thị một thông báo "Chưa có tài liệu" nếu muốn
  }

  const docDisplayConfig: Record<string, { label: string; linkText: string }> =
    {
      datasheet: { label: 'Datasheet', linkText: 'Mở datasheet' },
      schematic: { label: 'Schematic', linkText: 'Xem mạch nguyên lý' },
      step_model: { label: '3D Model', linkText: 'Tải file STEP' },
      stl_files: { label: '3D Print (STL)', linkText: 'Tải file STL' },
      user_manual: { label: 'User Manual', linkText: 'Xem hướng dẫn' },
      github_repo: { label: 'Source Code', linkText: 'Mở GitHub repo' },
    };

  // Tách các loại tài liệu để dễ dàng render và thêm dải phân cách
  const stepDocs = docs.filter((doc) => doc.doc_type === 'step_model');
  const stlDocs = docs.filter((doc) => doc.doc_type === 'stl_files');
  const pdfDocs = docs.filter(
    (doc) => doc.doc_type === 'datasheet' || doc.doc_type === 'user_manual'
  );
  const otherDocs = docs.filter(
    (doc) =>
      !['step_model', 'stl_files', 'datasheet', 'user_manual'].includes(
        doc.doc_type
      )
  );

  return (
    <Fragment>
      <details className="group rounded-xl border border-gray-800 bg-[#050608]">
        <summary className="flex cursor-pointer list-none items-center justify-between py-2 pl-3 pr-3 sm:pl-4 sm:pr-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-[#8883c8]">
              Tài liệu kỹ thuật
            </h2>
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
          <ul className="space-y-3 text-sm">
            {stepDocs.map((doc) => {
              const config = docDisplayConfig.step_model || {
                label: doc.doc_type,
                linkText: 'Mở file',
              };

              const thumbnailUrl =
                doc.thumbnail_url ||
                'https://cdn.aiotautotech.com/images/step-file-icon-thumb.jpg';
              return (
                <li key={doc.id}>
                  <div className="flex items-start gap-4">
                    <a href={doc.url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl}
                        alt="Tải file STEP"
                        className="h-12 w-12 flex-shrink-0 rounded-md border border-gray-700 bg-gray-800 object-contain transition-transform duration-200 hover:scale-105"
                      />
                    </a>
                    <div className="flex-1 pt-1">
                      <div>
                        <span className="text-gray-400">{config.label}:</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1 text-blue-400 hover:underline"
                        >
                          Tải file STEP
                        </a>
                      </div>
                      <div className="mt-1">
                        {doc.version && (
                          <span className="text-xs text-gray-500">
                            v{doc.version}
                          </span>
                        )}
                        {doc.file_size && (
                          <span className="ml-2 text-xs text-gray-500">
                            {formatBytes(doc.file_size)}
                          </span>
                        )}
                        {doc.description && (
                          <p className="mt-1 text-xs text-gray-500">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {stlDocs.map((doc) => {
              const config = docDisplayConfig.stl_files || {
                label: doc.doc_type,
                linkText: 'Mở file',
              };
              const modelDoc = doc as StlDoc;
              const toggleViewer = () => {
                setViewingDocInModal(modelDoc);
              };
              const thumbnailUrl = doc.thumbnail_url;

              return (
                <li key={modelDoc.id}>
                  <div className="flex items-start gap-4">
                    {thumbnailUrl && (
                      <button
                        type="button"
                        onClick={toggleViewer}
                        className="flex-shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnailUrl}
                          alt="Nhấp để xem 3D"
                          className="h-12 w-12 rounded-md border border-gray-700 bg-gray-800 object-contain transition-transform duration-200 hover:scale-105"
                        />
                      </button>
                    )}
                    <div className="flex-1 pt-1">
                      <div>
                        <span className="text-gray-400">{config.label}:</span>
                        <button
                          onClick={toggleViewer}
                          className="ml-1 text-blue-400 hover:underline"
                        >
                          Hiển thị trình xem 3D
                        </button>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-3 text-xs text-gray-500 hover:text-gray-300"
                        >
                          (Tải file)
                        </a>
                      </div>
                      <div className="mt-1">
                        {doc.version && (
                          <span className="text-xs text-gray-500">
                            v{doc.version}
                          </span>
                        )}
                        {doc.file_size && (
                          <span className="ml-2 text-xs text-gray-500">
                            {formatBytes(doc.file_size)}
                          </span>
                        )}
                        {doc.description && (
                          <p className="mt-1 text-xs text-gray-500">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {(stepDocs.length > 0 || stlDocs.length > 0) && (
              <li className="pt-1">
                <div className="flex justify-end">
                  <Link
                    href="/technical-docs/file-3d"
                    className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    <span>Thư viện file 3D</span>
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                {pdfDocs.length > 0 && (
                  <div className="pt-3">
                    <hr className="border-gray-700" />
                  </div>
                )}
              </li>
            )}

            {pdfDocs.map((doc) => {
              const config = docDisplayConfig[doc.doc_type] || {
                label: doc.doc_type,
                linkText: 'Mở file',
              };
              const thumbnailUrl =
                doc.thumbnail_url ||
                'https://cdn.aiotautotech.com/images/pdf-icon-thumb.webp';

              return (
                <li key={doc.id}>
                  <div className="flex items-start gap-4">
                    <a href={doc.url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl}
                        alt={`Thumbnail for ${doc.title}`}
                        className="h-12 w-12 flex-shrink-0 rounded-md border border-gray-700 bg-gray-800 object-contain transition-transform duration-200 hover:scale-105"
                      />
                    </a>
                    <div className="flex-1 pt-1">
                      <div>
                        <span className="text-gray-400">{config.label}:</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1 text-blue-400 hover:underline"
                        >
                          {doc.title || config.linkText}
                        </a>
                      </div>
                      <div className="mt-1">
                        {doc.version && (
                          <span className="text-xs text-gray-500">
                            v{doc.version}
                          </span>
                        )}
                        {doc.file_size && (
                          <span className="ml-2 text-xs text-gray-500">
                            {formatBytes(doc.file_size)}
                          </span>
                        )}
                        {doc.description && (
                          <p className="mt-1 text-xs text-gray-500">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {pdfDocs.length > 0 && (
              <li className="pt-1">
                <div className="flex justify-end">
                  <Link
                    href="/technical-docs/datasheets"
                    className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    <span>Thư viện Datasheet</span>
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                {otherDocs.length > 0 && (
                  <div className="pt-3">
                    <hr className="border-gray-700" />
                  </div>
                )}
              </li>
            )}

            {stepDocs.length === 0 &&
              stlDocs.length === 0 &&
              pdfDocs.length === 0 &&
              otherDocs.length > 0 && (
                <li>
                  <hr className="border-gray-700" />
                </li>
              )}

            {otherDocs.map((doc) => {
              const config = docDisplayConfig[doc.doc_type] || {
                label: doc.doc_type,
                linkText: 'Mở file',
              };
              return (
                <li key={doc.id}>
                  <span className="text-gray-400">{config.label}:&nbsp;</span>
                  <a
                    href={doc.url}
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {doc.title || config.linkText}
                  </a>
                  {doc.version && (
                    <span className="ml-2 text-xs text-gray-500">
                      v{doc.version}
                    </span>
                  )}
                  {doc.file_size && (
                    <span className="ml-1 text-xs text-gray-500">
                      {formatBytes(doc.file_size)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </details>

      {/* Modal để xem trước 3D */}
      {viewingDocInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingDocInModal(null)}
        >
          <div
            className="relative flex h-[85vh] w-[90vw] max-w-4xl flex-col rounded-lg bg-[#0f1015] shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 p-4">
              <h3 className="font-semibold text-gray-200">
                {viewingDocInModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setViewingDocInModal(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-4">
              {viewingDocInModal.url && (
                <ModelViewer fileUrl={viewingDocInModal.url} />
              )}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}
