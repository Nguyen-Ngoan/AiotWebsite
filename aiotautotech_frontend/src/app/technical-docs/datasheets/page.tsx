'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/apiConfig';
import type { TechnicalDoc } from '@/app/diy-maker/[idSlug]/components/technical-doc';
import Header from '@/components/layout/Header';
import { navItems } from '@/components/layout/nav-items';
import {
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import Footer from '@/components/layout/Footer';

const formatBytes = (bytes?: number, decimals = 1) => {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function DocumentCard({ doc }: { doc: TechnicalDoc }) {
  const getDocTypeLabel = (type: string) => {
    if (type === 'datasheet') return 'Datasheet';
    if (type === 'user_manual') return 'User Manual';
    return type;
  };

  const defaultThumbnail = 'https://cdn.aiotautotech.com/images/pdf-icon.webp';
  const thumbnailUrl = doc.thumbnail_url || defaultThumbnail;
  const isDefaultThumbnail = thumbnailUrl === defaultThumbnail;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex h-32 w-full items-center justify-center bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for ${doc.title}`}
          className={`h-full w-full ${
            isDefaultThumbnail ? 'object-contain p-6' : 'object-cover'
          }`}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-gray-800">{doc.title}</h3>
        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-gray-500">
          {doc.version && <span>v{doc.version}</span>}
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
            {getDocTypeLabel(doc.doc_type)}
          </span>
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
            className="flex-1 rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-center text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Xem tài liệu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DatasheetLibraryPage() {
  const [docs, setDocs] = useState<TechnicalDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(getApiUrl('/technical-docs/'));
        if (!res.ok) {
          throw new Error(`Failed to fetch documents (HTTP ${res.status})`);
        }
        const allDocs: TechnicalDoc[] = await res.json();

        const filteredDocs = allDocs.filter(
          (doc) =>
            doc.doc_type === 'datasheet' || doc.doc_type === 'user_manual'
        );
        setDocs(filteredDocs);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocs();
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
    <div className="flex min-h-screen flex-col bg-gray-50">
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
              <li className="font-medium text-gray-800">
                Datasheet & Hướng dẫn
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Datasheet & Hướng dẫn
            </h1>
            <Link
              href="/admin/technical-docs/new?doc_type=datasheet"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Thêm tài liệu mới
            </Link>
          </div>

          <p className="mt-2 text-lg text-gray-600">
            Thư viện tài liệu kỹ thuật, hướng dẫn lắp ráp và thông số sản phẩm.
          </p>

          <div className="mt-8">
            {isLoading && <p className="text-gray-500">Đang tải thư viện...</p>}
            {error && <p className="text-red-600">Lỗi: {error}</p>}
            {!isLoading && !error && docs.length === 0 && (
              <p className="text-gray-500">
                Chưa có tài liệu nào trong thư viện.
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {docs.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
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
    </div>
  );
}
