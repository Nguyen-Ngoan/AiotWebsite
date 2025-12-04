'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getApiUrl } from '@/lib/apiConfig';
import type { TechnicalDoc } from '@/app/diy-maker/[idSlug]/components/technical-doc';
import Header from '@/components/layout/Header';
import { navItems } from '@/components/layout/nav-items';
import {
  CubeIcon,
  XMarkIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import Footer from '@/components/layout/Footer';

// Tải ModelViewer động vì nó là một component nặng và chỉ dùng ở client-side
const ModelViewer = dynamic(
  () => import('@/app/diy-maker/[idSlug]/components/ModelViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
        Loading 3D viewer...
      </div>
    ),
  }
);

const formatBytes = (bytes?: number, decimals = 1) => {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function ModelDocumentCard({
  doc,
  onPreviewClick,
}: {
  doc: TechnicalDoc;
  onPreviewClick: (doc: TechnicalDoc) => void;
}) {
  const isStepFileWithoutThumbnail =
    doc.doc_type === 'step_model' && !doc.thumbnail_url;
  const thumbnailUrl = isStepFileWithoutThumbnail
    ? 'https://cdn.aiotautotech.com/images/step-file-icon.png'
    : doc.thumbnail_url;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${doc.title}`}
            className={`h-48 w-full bg-gray-50 ${
              isStepFileWithoutThumbnail ? 'object-contain p-4' : 'object-cover'
            }`}
          />
        ) : (
          <div className="h-48 w-full bg-gray-50" />
        )}

        {/* Nút xem 3D được đặt chồng lên thumbnail */}
        {doc.doc_type === 'stl_files' && (
          <button
            type="button"
            onClick={() => onPreviewClick(doc)}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            title="Show 3D Preview"
          >
            <CubeIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-base font-semibold text-gray-800">{doc.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          {doc.version && <span>v{doc.version}</span>}
          {doc.file_size && <span>{formatBytes(doc.file_size)}</span>}
        </div>
        {doc.description && (
          <p className="mt-2 text-xs text-gray-600 leading-snug">
            {doc.description}
          </p>
        )}
        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          <Link
            href={`/admin/technical-docs/${doc.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            title="Edit document"
          >
            <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
            <span>Edit</span>
          </Link>
          <Link
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Download
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StlLibraryPage() {
  const [docs, setDocs] = useState<TechnicalDoc[]>([]);
  const [viewingDoc, setViewingDoc] = useState<TechnicalDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  useEffect(() => {
    const fetchStlDocs = async () => {
      try {
        // Lấy tất cả tài liệu
        const res = await fetch(getApiUrl('/technical-docs/'));
        if (!res.ok) {
          throw new Error(`Failed to fetch documents (HTTP ${res.status})`);
        }
        const allDocs: TechnicalDoc[] = await res.json();

        // Lọc ra chỉ những file 3D (STL và STEP)
        const threeDModels = allDocs.filter(
          (doc) => doc.doc_type === 'stl_files' || doc.doc_type === 'step_model'
        );
        setDocs(threeDModels);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStlDocs();
  }, []);

  useEffect(() => {
    const updatePadding = () => {
      if (headerRef.current) {
        setMainPaddingTop(headerRef.current.offsetHeight);
      }
    };
    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header ref={headerRef} navItems={navItems} />
      <main
        className="flex-1"
        style={{
          paddingTop: mainPaddingTop > 0 ? `${mainPaddingTop}px` : '7rem',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Trang chủ
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li className="font-medium text-gray-800">Thư viện file 3D</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Thư viện file 3D (STL, STEP)
            </h1>
            <Link
              href="/admin/technical-docs/new?doc_type=stl_files"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add new 3D file
            </Link>
          </div>

          <p className="mt-2 text-lg text-gray-600">
            Preview and download 3D models for your projects.
          </p>

          <div className="mt-8">
            {isLoading && <p className="text-gray-500">Loading library...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}
            {!isLoading && !error && docs.length === 0 && (
              <p className="text-gray-500">No 3D files in the library yet.</p>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {docs.map((doc) => (
                <ModelDocumentCard
                  key={doc.id}
                  doc={doc}
                  onPreviewClick={setViewingDoc}
                />
              ))}
            </div>

            {/* Nút quay lại trang DIY */}
            <div className="mt-12 flex justify-center">
              <Link
                href="/diy-maker"
                className="inline-flex items-center gap-2 rounded-full border border-blue-500 bg-black px-5 py-2 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-900/50"
                title="Quay lại trang DIY Maker"
              >
                Sản phẩm DIY
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal để xem trước 3D */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="relative w-[90vw] h-[85vh] max-w-4xl rounded-lg bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">
                {viewingDoc.title}
              </h3>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              {viewingDoc.url && <ModelViewer fileUrl={viewingDoc.url} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
