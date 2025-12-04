// src/components/admin/products/EditProductTabs/DocsTab.tsx

'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/apiConfig';
import type { ProductFormState } from '@/app/admin/products/[id]/edit/page';
import type { TechnicalDoc } from '@/app/diy-maker/[idSlug]/components/technical-doc';
import DocSelectorDialog from './DocSelectorDialog';

interface DocsTabProps {
  form: ProductFormState;
  setForm: (
    f: ProductFormState | ((prev: ProductFormState) => ProductFormState)
  ) => void;
  productId: string;
}

function LinkedDocItem({
  doc,
  onRemove,
}: {
  doc: TechnicalDoc;
  onRemove: (docId: string) => void;
}) {
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(
      String(Math.floor(Math.log(bytes) / Math.log(1024))),
      10
    );
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  return (
    <li className="flex items-center justify-between gap-4 rounded-md border border-gray-200 p-3">
      <div className="flex items-center gap-3 overflow-hidden">
        {doc.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.thumbnail_url}
            alt={doc.title}
            className="h-10 w-10 flex-shrink-0 rounded object-cover bg-gray-100"
          />
        ) : (
          <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        <div className="overflow-hidden">
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-medium text-gray-800 hover:text-blue-600 hover:underline"
          >
            {doc.title}
          </a>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-mono rounded bg-gray-100 px-1 py-0.5 text-xs">
              {doc.doc_type}
            </span>
            {doc.version && <span>v{doc.version}</span>}
            {doc.file_size && <span>{formatBytes(doc.file_size)}</span>}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(doc.id)}
        className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
        title="Unlink document"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </li>
  );
}

const DOC_TYPE_LABELS: Record<string, string> = {
  stl_files: '3D Print Files (STL)',
  datasheet: 'Datasheets',
  schematic: 'Schematics',
  step_model: '3D Models (STEP)',
  user_manual: 'User Manuals',
  github_repo: 'Source Code (GitHub)',
  unknown: 'Other Documents',
};

const SUPPORTED_DOC_TYPES = [
  { key: 'stl_files', label: '3D Print Files (STL)' },
  { key: 'step_model', label: '3D Models (STEP)' },
  { key: 'datasheet', label: 'Datasheets' },
  { key: 'schematic', label: 'Schematics' },
  { key: 'user_manual', label: 'User Manuals' },
  { key: 'github_repo', label: 'Source Code (GitHub)' },
];

export default function DocsTab({ form, setForm, productId }: DocsTabProps) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    docType: string | null;
    title: string | null;
  }>({ isOpen: false, docType: null, title: null });

  const handleRemoveDoc = (docIdToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tech_doc_ids: prev.tech_doc_ids.filter((id) => id !== docIdToRemove),
      technical_docs: prev.technical_docs.filter(
        (doc) => doc.id !== docIdToRemove
      ),
    }));
  };

  const handleAddDocById = useCallback(
    (docId: string) => {
      const trimmedId = docId.trim();
      if (!trimmedId) return;

      // Sử dụng functional update form của setForm để tránh stale closure
      setForm((prev) => {
        // Kiểm tra xem ID đã tồn tại trong state MỚI NHẤT chưa
        if (prev.tech_doc_ids.includes(trimmedId)) {
          return prev; // Nếu đã có, không làm gì cả
        }

        // Fetch thông tin doc và cập nhật state
        fetch(getApiUrl(`/technical-docs/${trimmedId}/`))
          .then((res) => {
            if (!res.ok) throw new Error('Document not found');
            return res.json();
          })
          .then((newDoc: TechnicalDoc) => {
            setForm((currentForm) => ({
              ...currentForm,
              tech_doc_ids: [...currentForm.tech_doc_ids, newDoc.id],
              technical_docs: [...currentForm.technical_docs, newDoc],
            }));
          })
          .catch(() => alert('Document with this ID not found.'));

        // Trả về state cũ ngay lập tức, việc cập nhật sẽ diễn ra bất đồng bộ
        return prev;
      });
    },
    [setForm]
  );

  const handleSelectFromDialog = (docId: string) => {
    handleAddDocById(docId);
    // Optional: close dialog on select
    // setDialogState({ isOpen: false, docType: null, title: null });
  };

  const openDialog = (docType: string, title: string) => {
    setDialogState({ isOpen: true, docType, title });
  };

  const closeDialog = () => {
    setDialogState({ isOpen: false, docType: null, title: null });
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      {SUPPORTED_DOC_TYPES.map(({ key, label }) => {
        const docsForType = form.technical_docs.filter(
          (doc) => doc.doc_type === key
        );
        return (
          <div
            key={key}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-3">
              <h3 className="text-base font-medium text-gray-800">
                {label} ({docsForType.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDialog(key, `Select ${label}`)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Select...
                </button>
                <Link
                  href={`/admin/technical-docs/new?doc_type=${key}`}
                  target="_blank"
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Add New...
                </Link>
              </div>
            </div>

            {docsForType.length > 0 ? (
              <ul className="space-y-3">
                {docsForType.map((doc) => (
                  <LinkedDocItem
                    key={doc.id}
                    doc={doc}
                    onRemove={handleRemoveDoc}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-center text-xs text-gray-400 py-2">
                No {label} linked to this product.
              </p>
            )}
          </div>
        );
      })}

      <DocSelectorDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onSelect={handleSelectFromDialog}
        existingDocIds={form.tech_doc_ids}
        docType={dialogState.docType || undefined}
        title={dialogState.title || 'Select a Document'}
      />
    </div>
  );
}
