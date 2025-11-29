// src/components/admin/products/EditProductTabs/MediaTab.tsx

'use client';

import { ProductFormState } from '@/app/admin/products/productFormTypes';
import ProductImageUploader from '@/components/admin/ProductImageUploader';

interface MediaTabProps {
  productId: string;
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
}

type ProductImageMeta = {
  id?: string;
  url?: string; // large
  url_medium?: string;
  url_thumb?: string;
  fileName?: string;
  type?: string;
  isPrimary?: boolean;
  alt?: string;
  title?: string;
  aiDescription?: string;
  aiTags?: string;
  aiContext?: string;
};

export default function MediaTab({ productId, form, setForm }: MediaTabProps) {
  const images = (form.images || []) as ProductImageMeta[];

  const handleSetPrimary = (index: number) => {
    const img = images[index];
    if (!img || !img.url) return;

    const updatedImages = images.map((im, idx) => ({
      ...im,
      isPrimary: idx === index,
    }));

    setForm({
      ...form,
      images: updatedImages,
    });
  };

  const handleCopyUrl = async (url?: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      console.log('Copied image URL:', url);
    } catch (err) {
      console.error('Cannot copy to clipboard', err);
    }
  };

  const handleUpdateImageField = (
    index: number,
    field: keyof ProductImageMeta,
    value: string | boolean
  ) => {
    const updatedImages = images.map((img, idx) =>
      idx === index
        ? {
            ...img,
            [field]: value,
          }
        : img
    );

    setForm({
      ...form,
      images: updatedImages,
    });
  };

  const handleDeleteImage = (index: number) => {
    const img = images[index];
    if (!img) return;

    const updatedImages = images.filter((_, idx) => idx !== index);

    // KHÔNG auto set primary mới.
    // Nếu ảnh bị xoá là primary thì sau khi xoá có thể không còn main image.
    setForm({
      ...form,
      images: updatedImages,
    });
  };

  return (
    <div className="space-y-6">
      {/* 2. LIST OF UPLOADED IMAGES */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">
          Uploaded images (Cloudflare R2)
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          All image metadata is stored in the <code>images</code> field of the
          product document.
        </p>

        {images.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">
            No images uploaded for this product yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => {
              const urlLarge = img.url || '';
              const urlMedium = img.url_medium || urlLarge;
              const urlThumb = img.url_thumb || urlMedium;

              const displayUrl = urlThumb || urlMedium || urlLarge;
              const shortUrl =
                displayUrl.length > 50
                  ? displayUrl.slice(0, 47) + '...'
                  : displayUrl;

              return (
                <div
                  key={img.id || displayUrl || idx}
                  className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div className="relative bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {displayUrl ? (
                      <img
                        src={displayUrl}
                        alt={img.alt || img.title || `Image ${idx + 1}`}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-xs text-gray-400">
                        No preview
                      </div>
                    )}

                    {img.isPrimary && (
                      <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
                        PRIMARY
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-900">
                        {img.fileName || img.id || `Image ${idx + 1}`}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {img.type || 'gallery'}
                      </span>
                    </div>

                    {/* Editable fields */}
                    <div className="space-y-1">
                      <div>
                        <label className="block text-[11px] text-gray-500">
                          Alt text
                        </label>
                        <input
                          type="text"
                          className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={img.alt || ''}
                          onChange={(e) =>
                            handleUpdateImageField(idx, 'alt', e.target.value)
                          }
                          placeholder="Mô tả ngắn cho SEO / accessibility"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-500">
                          Title
                        </label>
                        <input
                          type="text"
                          className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={img.title || ''}
                          onChange={(e) =>
                            handleUpdateImageField(idx, 'title', e.target.value)
                          }
                          placeholder="Tiêu đề hiển thị khi hover"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-500">
                          Type
                        </label>
                        <input
                          type="text"
                          className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={img.type || ''}
                          onChange={(e) =>
                            handleUpdateImageField(idx, 'type', e.target.value)
                          }
                          placeholder="cover / gallery / detail / dimension..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Thumb:{' '}
                      <span className="font-mono break-all text-gray-700">
                        {shortUrl || '—'}
                      </span>
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600"
                      >
                        Set as Primary
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(urlLarge || urlMedium)}
                        className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:border-gray-400"
                      >
                        Copy large URL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        className="inline-flex items-center rounded border border-red-300 bg-white px-2 py-1 text-[11px] font-medium text-red-600 hover:border-red-400"
                      >
                        Delete image
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <hr className="my-4 border-dashed border-gray-200" />

        <p className="mb-2 text-xs text-gray-500">
          Upload new images. They will be resized and stored on Cloudflare R2.
          After upload, the <code>images</code> field (and this list) will be
          updated automatically.
        </p>
        <ProductImageUploader
          productId={productId}
          productTitle={form.title}
          existingImagesCount={images.length}
          onUploaded={(newImages) =>
            setForm({
              ...form,
              images: newImages,
            })
          }
        />
      </div>
    </div>
  );
}
