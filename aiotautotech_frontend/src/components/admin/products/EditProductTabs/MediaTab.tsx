// src/components/admin/products/EditProductTabs/MediaTab.tsx

"use client";

import { ProductFormState } from "@/app/admin/products/productFormTypes";
import ProductImageUploader from "@/components/admin/ProductImageUploader";

interface MediaTabProps {
  productId: string;
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
}

export default function MediaTab({ productId, form, setForm }: MediaTabProps) {
  const handleGalleryChange = (value: string) => {
    const lines = value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    setForm({ ...form, gallery: lines });
  };

  return (
    <div className="space-y-6">
      {/* URL ảnh chính + gallery (giữ logic hiện tại) */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ảnh chính (main_image_url)</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.mainImageUrl} onChange={(e) => setForm({ ...form, mainImageUrl: e.target.value })} placeholder="https://..." />
          <p className="text-xs text-gray-500 mt-1">Có thể trỏ đến 1 URL trong danh sách ảnh đã upload bên dưới.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gallery URLs (mỗi dòng 1 URL)</label>
          <textarea className="mt-1 block w-full min-h-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.gallery.join("\n")} onChange={(e) => handleGalleryChange(e.target.value)} placeholder={"https://...\nhttps://...\nhttps://..."} />
          <p className="text-xs text-gray-500 mt-1">
            Backend sẽ lưu vào field <code>gallery_urls</code> (array string).
          </p>
        </div>
      </div>

      {/* Danh sách ảnh đã upload từ Firestore.images */}
      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Ảnh đã upload (Cloudflare R2)</h3>
        {form.images && form.images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {form.images.map((img: any, idx: number) => (
              <div key={img.id || img.url || idx} className="flex gap-2 rounded-md border border-gray-200 p-2 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url || img.image_url || ""} alt={img.alt || ""} className="w-24 h-24 rounded-md object-cover border" />
                <div className="flex-1 text-xs space-y-1">
                  <div className="font-semibold text-gray-800">{img.title || "Không có title"}</div>
                  <div className="text-gray-600">
                    <span className="text-gray-400">Type: </span>
                    {img.type || "—"}
                  </div>
                  <div className="text-gray-600">
                    <span className="text-gray-400">Primary: </span>
                    {img.is_primary ? "Yes" : "No"}
                  </div>
                  {img.alt && (
                    <div className="text-gray-600">
                      <span className="text-gray-400">Alt: </span>
                      {img.alt}
                    </div>
                  )}
                  {img.ai_tags && (
                    <div className="text-gray-500">
                      <span className="text-gray-400">AI tags: </span>
                      {img.ai_tags}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Chưa có ảnh nào trong Firestore (field <code>images</code>).
          </p>
        )}
      </div>

      {/* Upload ảnh mới */}
      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Upload ảnh mới</h3>
        <p className="text-xs text-gray-500 mb-1">
          Chọn ảnh, nhập SEO file name, alt, title, type, isPrimary, AI tags... rồi upload. Backend sẽ:
          <br />- lưu file vào Cloudflare R2
          <br />- cập nhật metadata vào Firestore (<code>products/:id/images</code>).
        </p>
        <ProductImageUploader productId={productId} onUploaded={(newImages) => setForm({ ...form, images: newImages })} />
      </div>
    </div>
  );
}
