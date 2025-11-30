// src/components/admin/products/EditProductTabs/DocUploader.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import { getApiUrl } from '@/lib/apiConfig';
import { ArrowUpTrayIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface DocUploaderProps {
  label: string;
  productId: string;
  docType:
    | 'datasheet_url'
    | 'schematic_url'
    | 'step_model_url'
    | 'stl_files_url'
    | 'user_manual_url'
    | 'github_repo_url';
  currentUrl: string;
  onUploadComplete: (field: string, url: string) => void;
  onClear: (field: string) => void;
}

export default function DocUploader({
  label,
  productId,
  docType,
  currentUrl,
  onUploadComplete,
  onClear,
}: DocUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

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

    // Chuyển đổi docType từ camelCase (VD: datasheetUrl) sang snake_case (VD: datasheet_url)
    // để khớp với định dạng mà backend Django yêu cầu.
    // Ví dụ: 'datasheetUrl' -> 'datasheet_url'
    const backendDocType = docType
      .replace(/Url$/, '_url')
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', backendDocType);

    try {
      const res = await fetch(getApiUrl(`/products/${productId}/docs/`), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Upload failed (HTTP ${res.status})`);
      }

      const data = await res.json(); // { field: string, url: string }
      onUploadComplete(data.field, data.url);
      setStatus('success');
      setFile(null); // Clear file input after success
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setStatus('error');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="text"
          className="block w-full flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-gray-50 text-gray-500"
          value={currentUrl}
          readOnly
          placeholder="Chưa có file"
        />
        {currentUrl && (
          <button
            type="button"
            onClick={() => onClear(docType)}
            title="Xóa URL"
          >
            <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="file"
          id={`file_${docType}`}
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor={`file_${docType}`}
          className="cursor-pointer text-xs text-blue-600 hover:underline"
        >
          {file ? `Đã chọn: ${file.name}` : 'Chọn file...'}
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
    </div>
  );
}
