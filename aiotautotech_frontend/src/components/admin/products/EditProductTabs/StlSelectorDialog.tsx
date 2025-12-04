// src/components/admin/products/EditProductTabs/StlSelectorDialog.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/apiConfig';
import type { TechnicalDoc } from '@/app/diy-maker/[idSlug]/components/technical-doc';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface StlDoc extends TechnicalDoc {
  doc_type: 'stl_files';
}

interface StlSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (docId: string) => void;
  existingDocIds: string[];
}

function StlItemCard({
  doc,
  onSelect,
  isAlreadyAdded,
}: {
  doc: StlDoc;
  onSelect: (docId: string) => void;
  isAlreadyAdded: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-lg border ${
        isAlreadyAdded
          ? 'border-gray-200 bg-gray-100'
          : 'border-gray-300 bg-white'
      }`}
    >
      {doc.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doc.thumbnail_url}
          alt={doc.title}
          className={`h-32 w-full object-cover ${
            isAlreadyAdded ? 'opacity-50' : ''
          }`}
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
          No Preview
        </div>
      )}
      <div className="flex-1 p-3">
        <h3
          className="truncate text-sm font-medium text-gray-800"
          title={doc.title}
        >
          {doc.title}
        </h3>
        <button
          type="button"
          onClick={() => onSelect(doc.id)}
          disabled={isAlreadyAdded}
          className="mt-2 w-full rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isAlreadyAdded ? 'Added' : 'Select'}
        </button>
      </div>
    </div>
  );
}

export default function StlSelectorDialog({
  isOpen,
  onClose,
  onSelect,
  existingDocIds,
}: StlSelectorDialogProps) {
  const [docs, setDocs] = useState<StlDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const fetchStlDocs = async () => {
        try {
          const res = await fetch(
            getApiUrl('/technical-docs/?doc_type=stl_files')
          );
          if (!res.ok) throw new Error('Failed to fetch STL documents');
          const data: StlDoc[] = await res.json();
          setDocs(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStlDocs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-[90vw] max-w-4xl flex-col rounded-lg bg-gray-50 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Select an STL File
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click 'Select' on an item to add it to the product.
            </p>
          </div>
          <Link
            href="/admin/technical-docs/new"
            target="_blank"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Upload New File...
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && <p>Loading STL library...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {docs.map((doc) => (
                <StlItemCard
                  key={doc.id}
                  doc={doc}
                  onSelect={onSelect}
                  isAlreadyAdded={existingDocIds.includes(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
