'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getApiUrl } from '@/lib/apiConfig';
import type { TechnicalDoc } from '@/app/diy-maker/[idSlug]/components/technical-doc';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Tải ModelViewer động vì nó là một component nặng và chỉ dùng ở client-side
const ModelViewer = dynamic(
  () => import('@/app/diy-maker/[idSlug]/components/ModelViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
        Đang tải trình xem 3D...
      </div>
    ),
  }
);

// Định nghĩa type cho tài liệu STL để code an toàn hơn
interface StlDoc extends TechnicalDoc {
  doc_type: 'stl_files';
}

const formatBytes = (bytes?: number, decimals = 1) => {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function StlDocumentCard({ doc }: { doc: StlDoc }) {
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {doc.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doc.thumbnail_url}
          alt={`Thumbnail for ${doc.title}`}
          className="h-48 w-full object-cover bg-gray-50"
        />
      )}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-base font-semibold text-gray-800">{doc.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          {doc.version && <span>v{doc.version}</span>}
          {doc.file_size && <span>{formatBytes(doc.file_size)}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsViewerVisible(!isViewerVisible)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            {isViewerVisible ? 'Ẩn xem trước 3D' : 'Xem trước 3D'}
          </button>
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Tải file
          </a>
        </div>
        {isViewerVisible && doc.url && (
          <div className="mt-4">
            <ModelViewer fileUrl={doc.url} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StlLibraryPage() {
  const [docs, setDocs] = useState<StlDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  useEffect(() => {
    const fetchStlDocs = async () => {
      try {
        const res = await fetch(
          getApiUrl('/technical-docs/?doc_type=stl_files')
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch STL documents (HTTP ${res.status})`);
        }
        const data: StlDoc[] = await res.json();
        setDocs(data);
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
      <Header ref={headerRef} />
      <main className="flex-1" style={{ paddingTop: `${mainPaddingTop}px` }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Thư viện file 3D (STL)
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Xem trước và tải xuống các mô hình 3D cho các dự án của bạn.
          </p>

          <div className="mt-8">
            {isLoading && <p className="text-gray-500">Đang tải thư viện...</p>}
            {error && <p className="text-red-600">Lỗi: {error}</p>}
            {!isLoading && !error && docs.length === 0 && (
              <p className="text-gray-500">
                Chưa có file STL nào trong thư viện.
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {docs.map((doc) => (
                <StlDocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
