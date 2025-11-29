'use client';

import { slugify } from '@/lib/slugify';
import { useState, ChangeEvent } from 'react';
import { getApiUrl } from '@/lib/apiConfig';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
  seoFileName: string;
  alt: string;
  title: string;
  type: string;
  isPrimary: boolean;
  aiDescription: string;
  aiTags: string;
  aiContext: string;
  uploading?: boolean;
}

export default function ProductImageUploader({
  productId,
  productTitle,
  existingImagesCount,
  onUploaded,
}: {
  productId: string;
  productTitle: string;
  existingImagesCount: number;
  onUploaded: (newImages: any[]) => void;
}) {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // 1. Chọn file
  function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    const newItems: PendingImage[] = [];

    const baseSlug = slugify(productTitle || 'san-pham');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newIndex = existingImagesCount + i + 1;
      const paddedIndex = String(newIndex).padStart(2, '0');
      const url = URL.createObjectURL(file);
      const defaultAlt = `${productTitle || 'Ảnh sản phẩm'} - ${paddedIndex}`;
      const defaultSeoName = `${baseSlug}-${paddedIndex}`;

      newItems.push({
        id: crypto.randomUUID(),
        file,
        preview: url,
        seoFileName: defaultSeoName,
        alt: defaultAlt,
        title: defaultAlt,
        type: 'gallery',
        isPrimary: false,
        aiDescription: '',
        aiTags: '',
        aiContext: '',
      });
    }

    setPendingImages((prev) => [...prev, ...newItems]);
  }

  // 2. Upload 1 ảnh
  async function uploadOne(img: PendingImage) {
    try {
      const formData = new FormData();

      formData.append('file', img.file);
      formData.append('seo_file_name', img.seoFileName);
      formData.append('alt', img.alt);
      formData.append('title', img.title);
      formData.append('type', img.type);
      formData.append('is_primary', String(img.isPrimary));
      formData.append('ai_description', img.aiDescription);
      formData.append('ai_tags', img.aiTags);
      formData.append('ai_context', img.aiContext);

      const api = getApiUrl(`/products/${productId}/images/`);

      setPendingImages((prev) =>
        prev.map((p) => (p.id === img.id ? { ...p, uploading: true } : p))
      );

      const res = await fetch(api, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }

      const data = await res.json(); // { images: [...] }

      onUploaded(data.images);

      setPendingImages((prev) => prev.filter((p) => p.id !== img.id));
    } catch (err) {
      alert('Upload lỗi: ' + (err as Error).message);
      console.error(err);
      setPendingImages((prev) =>
        prev.map((p) => (p.id === img.id ? { ...p, uploading: false } : p))
      );
    }
  }

  // 3. Upload tất cả
  async function uploadAll() {
    for (const item of pendingImages) {
      await uploadOne(item);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelect}
          className="block w-full text-sm text-gray-900 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
      </div>

      {pendingImages.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {pendingImages.map((img) => (
            <div
              key={img.id}
              className="border rounded-lg p-3 flex gap-3 bg-white shadow-sm"
            >
              <img
                src={img.preview}
                alt=""
                className="w-32 h-32 object-cover rounded-md border"
              />

              <div className="flex-1 space-y-2">
                {/* SEO file name */}
                <input
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="SEO file name"
                  value={img.seoFileName}
                  onChange={(e) =>
                    setPendingImages((prev) =>
                      prev.map((p) =>
                        p.id === img.id
                          ? { ...p, seoFileName: e.target.value }
                          : p
                      )
                    )
                  }
                />

                {/* Alt */}
                <input
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="Alt"
                  value={img.alt}
                  onChange={(e) =>
                    setPendingImages((prev) =>
                      prev.map((p) =>
                        p.id === img.id ? { ...p, alt: e.target.value } : p
                      )
                    )
                  }
                />

                {/* Title */}
                <input
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="Title"
                  value={img.title}
                  onChange={(e) =>
                    setPendingImages((prev) =>
                      prev.map((p) =>
                        p.id === img.id ? { ...p, title: e.target.value } : p
                      )
                    )
                  }
                />

                {/* Type */}
                <select
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  value={img.type}
                  onChange={(e) =>
                    setPendingImages((prev) =>
                      prev.map((p) =>
                        p.id === img.id ? { ...p, type: e.target.value } : p
                      )
                    )
                  }
                >
                  <option value="cover">Cover</option>
                  <option value="gallery">Gallery</option>
                  <option value="detail">Detail</option>
                  <option value="dimension">Dimension</option>
                </select>

                {/* Is Primary */}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={img.isPrimary}
                    onChange={(e) =>
                      setPendingImages((prev) =>
                        prev.map((p) =>
                          p.id === img.id
                            ? { ...p, isPrimary: e.target.checked }
                            : p
                        )
                      )
                    }
                    className="h-4 w-4"
                  />
                  Ảnh chính (Primary)
                </label>

                {/* AI Metadata */}
                <input
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="AI description"
                  value={img.aiDescription}
                  onChange={(e) =>
                    setPendingImages((prev) =>
                      prev.map((p) =>
                        p.id === img.id
                          ? { ...p, aiDescription: e.target.value }
                          : p
                      )
                    )
                  }
                />

                <input
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="AI tags"
                  value={img.aiTags}
                  onChange={(e) =>
                    setPendingImages((prev) =>
                      prev.map((p) =>
                        p.id === img.id ? { ...p, aiTags: e.target.value } : p
                      )
                    )
                  }
                />

                <input
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="AI context"
                  value={img.aiContext}
                  onChange={(e) =>
                    setPendingImages((prev) =>
                      prev.map((p) =>
                        p.id === img.id
                          ? { ...p, aiContext: e.target.value }
                          : p
                      )
                    )
                  }
                />

                {/* BUTTON UPLOAD */}
                <button
                  onClick={() => uploadOne(img)}
                  disabled={img.uploading}
                  className={`w-full bg-blue-600 text-white font-medium py-1.5 px-3 rounded shadow text-sm ${
                    img.uploading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-blue-700'
                  }`}
                >
                  {img.uploading ? 'Đang upload...' : 'Upload ảnh'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingImages.length > 1 && (
        <button
          className="bg-blue-600 text-white font-medium py-1.5 px-3 rounded shadow text-sm hover:bg-blue-700"
          onClick={uploadAll}
        >
          Upload tất cả ảnh
        </button>
      )}
    </div>
  );
}
