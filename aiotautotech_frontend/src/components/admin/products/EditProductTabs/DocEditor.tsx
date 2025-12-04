// src/components/admin/products/EditProductTabs/DocEditor.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import { getApiUrl } from '@/lib/apiConfig';
import {
  ArrowUpTrayIcon,
  XCircleIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { DocMetadata, DocKey } from '@/app/admin/products/productFormTypes';

interface DocEditorProps {
  label: string;
  productId: string;
  docKey: DocKey;
  doc: DocMetadata | null;
  onUpdate: (key: DocKey, doc: DocMetadata | null) => void;
}

export default function DocEditor({
  label,
  productId,
  docKey,
  doc,
  onUpdate,
}: DocEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!doc) return;
    const { name, value } = e.target;
    onUpdate(docKey, { ...doc, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_key', docKey);
    formData.append('title', doc?.title || '');
    formData.append('description', doc?.description || '');
    formData.append('version', doc?.version || '');

    try {
      const res = await fetch(getApiUrl(`/products/${productId}/docs/`), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Upload failed (HTTP ${res.status})`);
      }

      const data = await res.json(); // { doc_key: string, metadata: DocMetadata }
      onUpdate(data.doc_key, data.metadata);
      setStatus('success');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setStatus('error');
    }
  };

  const handleClear = () => {
    onUpdate(docKey, null);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
        {doc && (
          <button type="button" onClick={handleClear} title="Xóa tài liệu này">
            <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>

      {!doc ? (
        <div className="mt-2 text-center text-xs text-gray-500 py-4 border-2 border-dashed border-gray-200 rounded-md">
          <p>Chưa có tài liệu.</p>
          <p>Hãy upload file để bắt đầu.</p>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <div>
            <label className="text-[11px] font-medium text-gray-600">URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={doc.url || ''}
                className="mt-0.5 block w-full flex-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-[11px] text-gray-500 shadow-sm"
              />
              {doc.file_size && (
                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                  {formatBytes(doc.file_size)}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600">
              Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={doc.title || ''}
              onChange={handleFieldChange}
              className="mt-0.5 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-gray-600">
                Phiên bản
              </label>
              <input
                type="text"
                name="version"
                value={doc.version || ''}
                onChange={handleFieldChange}
                className="mt-0.5 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600">
                Mô tả
              </label>
              <input
                type="text"
                name="description"
                value={doc.description || ''}
                onChange={handleFieldChange}
                className="mt-0.5 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 border-t border-gray-200 pt-3">
        <div className="flex items-center gap-2">
          <input
            type="file"
            id={`file_${docKey}`}
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor={`file_${docKey}`}
            className="flex-1 cursor-pointer text-xs text-blue-600 hover:underline"
          >
            {file ? `Đã chọn: ${file.name}` : 'Chọn file mới...'}
          </label>
          {file && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={status === 'uploading'}
              className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowUpTrayIcon className="h-3 w-3" />
              {status === 'uploading' ? 'Đang tải...' : 'Upload'}
            </button>
          )}
        </div>
        {status === 'error' && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {status === 'success' && (
          <p className="mt-1 text-xs text-green-600">Upload thành công!</p>
        )}
      </div>
    </div>
  );
}
