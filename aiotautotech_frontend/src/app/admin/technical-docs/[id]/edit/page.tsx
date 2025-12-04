// src/app/admin/technical-docs/[id]/edit/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getApiUrl } from '@/lib/apiConfig';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import type { TechnicalDoc } from '@/app/diy-maker/[idSlug]/components/technical-doc';
import {
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

export default function EditTechnicalDocPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;

  const [form, setForm] = useState({
    title: '',
    description: '',
    version: '',
  });
  const [docType, setDocType] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [copyIdSuccess, setCopyIdSuccess] = useState('');

  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  useEffect(() => {
    if (!docId) return;

    const fetchDoc = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(getApiUrl(`/technical-docs/${docId}/`));
        if (!res.ok) {
          throw new Error(`Failed to load document (HTTP ${res.status})`);
        }
        const data: TechnicalDoc = await res.json();
        setForm({
          title: data.title || '',
          description: data.description || '',
          version: data.version || '',
        });
        setDocType(data.doc_type);
        setDocUrl(data.url || '');
        setThumbnailUrl(data.thumbnail_url || null);
      } catch (err: any) {
        setLoadError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoc();
  }, [docId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('version', form.version);

    if (newThumbnailFile) {
      formData.append('thumbnail_file', newThumbnailFile);
    }

    try {
      const res = await fetch(getApiUrl(`/technical-docs/${docId}/`), {
        method: 'PUT',
        body: formData, // Gửi dưới dạng FormData thay vì JSON
      });

      if (!res.ok) {
        let msg = `Update failed (HTTP ${res.status})`;
        try {
          const data = await res.json();
          const errorDetails = Object.values(data).flat().join(' ');
          if (errorDetails) msg = errorDetails;
        } catch {}
        throw new Error(msg);
      }

      // Điều hướng về trang thư viện tương ứng
      const updatedDoc = await res.json();
      const DOC_TYPE_TO_LIBRARY_PATH: Record<string, string> = {
        stl_files: '/technical-docs/file-3d',
        step_model: '/technical-docs/file-3d',
        datasheet: '/technical-docs/datasheets',
        user_manual: '/technical-docs/datasheets',
        schematic: '/technical-docs/schematics',
        github_repo: '/technical-docs/code-samples',
      };
      const redirectPath =
        DOC_TYPE_TO_LIBRARY_PATH[updatedDoc.doc_type] || '/admin';
      router.push(redirectPath);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unknown server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewThumbnailFile(file);
      // Tạo URL tạm thời để xem trước ảnh
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCopyUrl = () => {
    if (!docUrl) return;
    navigator.clipboard.writeText(docUrl).then(
      () => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      },
      () => {
        setCopySuccess('Failed');
      }
    );
  };

  const handleCopyId = () => {
    if (!docId) return;
    navigator.clipboard.writeText(docId).then(
      () => {
        setCopyIdSuccess('Copied!');
        setTimeout(() => setCopyIdSuccess(''), 2000);
      },
      () => {
        setCopyIdSuccess('Failed');
      }
    );
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header ref={headerRef} navItems={navItems} />
      <main
        className="flex-1"
        style={{
          paddingTop: mainPaddingTop > 0 ? `${mainPaddingTop}px` : '7rem',
        }}
      >
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Document
              </h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {loadError && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                {loadError}
              </div>
            )}

            {isLoading ? (
              <p>Loading document...</p>
            ) : (
              <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                {/* 2-column layout */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="version"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Version
                      </label>
                      <input
                        type="text"
                        id="version"
                        name="version"
                        value={form.version}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Document Type
                      </label>
                      <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 rounded px-2 py-1.5">
                        {docType}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <label
                      htmlFor="thumbnail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Thumbnail
                    </label>
                    <div className="mt-1">
                      {thumbnailUrl ? (
                        <div className="group relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbnailUrl}
                            alt="Thumbnail preview"
                            className="h-32 w-32 rounded-md object-cover"
                          />
                          <label
                            htmlFor="thumbnail-upload"
                            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-md bg-black/60 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            Change
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor="thumbnail-upload"
                          className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                        >
                          <ArrowUpTrayIcon className="h-8 w-8" />
                          <span className="mt-2 text-xs font-medium">
                            Upload
                          </span>
                        </label>
                      )}
                      <input
                        id="thumbnail-upload"
                        type="file"
                        className="sr-only"
                        accept="image/png, image/jpeg"
                        onChange={handleThumbnailChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Document ID
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <div className="relative -mr-px inline-flex min-w-0 flex-grow items-center rounded-l-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                          <span className="truncate font-mono">{docId}</span>
                        </div>
                        <button
                          type="button"
                          title="Copy Document ID"
                          onClick={handleCopyId}
                          className="relative inline-flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {copyIdSuccess ? (
                            <CheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Document URL
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative -mr-px inline-flex min-w-0 flex-grow items-center rounded-l-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <span className="truncate">{docUrl}</span>
                        </a>
                        <button
                          type="button"
                          title="Copy Document URL"
                          onClick={handleCopyUrl}
                          className="relative inline-flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {copySuccess ? (
                            <CheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
