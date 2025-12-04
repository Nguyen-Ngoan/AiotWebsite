// src/app/admin/technical-docs/new/page.tsx
'use client';

import { Suspense } from 'react';
import { useState, useRef, useEffect, ChangeEvent, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/lib/apiConfig';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

function NewDocForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDocType = useMemo(
    () => searchParams.get('doc_type') || 'stl_files',
    [searchParams]
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState(initialDocType);

  useEffect(() => {
    setDocType(initialDocType);
  }, [initialDocType]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }
    if (!file && docType !== 'github_repo') {
      setErrorMessage('A file is required for this document type.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('version', version);
    if (file) {
      formData.append('file', file);
    }
    formData.append('doc_type', docType);

    try {
      const res = await fetch(getApiUrl('/technical-docs/'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let msg = `Failed to create document (HTTP ${res.status})`;
        try {
          const data = await res.json();
          // Combine multiple errors if backend returns them
          const errorDetails = Object.values(data).flat().join(' ');
          if (errorDetails) {
            msg = errorDetails;
          }
        } catch {
          // Ignore if response is not JSON
        }
        throw new Error(msg);
      }

      // Điều hướng đến trang thư viện tương ứng
      const DOC_TYPE_TO_LIBRARY_PATH: Record<string, string> = {
        stl_files: '/technical-docs/file-3d',
        step_model: '/technical-docs/file-3d',
        datasheet: '/technical-docs/datasheets',
        user_manual: '/technical-docs/datasheets',
        schematic: '/technical-docs/schematics',
        github_repo: '/technical-docs/code-samples',
      };

      const redirectPath = DOC_TYPE_TO_LIBRARY_PATH[docType] || '/admin'; // Fallback
      router.push(redirectPath);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unknown server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Technical Document
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
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., Linear Actuator Mount"
            />
          </div>

          <div>
            <label
              htmlFor="doc_type"
              className="block text-sm font-medium text-gray-700"
            >
              Document Type *
            </label>
            <select
              id="doc_type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              // Nếu doc_type được truyền từ URL, không cho phép thay đổi
              disabled={!!searchParams.get('doc_type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="stl_files">3D Print File (STL)</option>
              <option value="step_model">3D Model (STEP)</option>
              <option value="datasheet">Datasheet</option>
              <option value="schematic">Schematic</option>
              <option value="user_manual">User Manual</option>
              <option value="github_repo">Source Code (GitHub)</option>
            </select>
            {!!searchParams.get('doc_type') && (
              <p className="mt-1 text-xs text-gray-500">
                Type is pre-selected and cannot be changed.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., For NEMA17 motor"
              />
            </div>
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
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., 1.1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              File *
            </label>
            <div className="mt-2 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
              <div className="space-y-1 text-center">
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".stl,.step,.stp,.pdf,.zip,.*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  {file ? file.name : 'File up to 50MB'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewTechnicalDocPage() {
  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

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
        <Suspense fallback={<div>Loading...</div>}>
          <NewDocForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
