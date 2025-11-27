// src/components/admin/products/EditProductTabs/BasicInfoTab.tsx

"use client";

import { ProductFormState, ProductType, ProductStatus } from "@/app/admin/products/productFormTypes";

interface BasicInfoTabProps {
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
}

// Chuyển "Trục tuyến tính NEMA 17 – 300mm" → "truc-tuyen-tinh-nema-17-300mm"
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BasicInfoTab({ form, setForm }: BasicInfoTabProps) {
  const handleSlugGenerate = () => {
    if (!form.title.trim()) return;
    setForm({ ...form, slug: slugify(form.title) });
  };

  return (
    <div className="space-y-4">
      {/* Tên & slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên sản phẩm *</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Bộ trục tuyến tính X 400mm" />
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="bo-truc-tuyen-tinh-x-400mm" />
        </div>
        <button type="button" onClick={handleSlugGenerate} className="mb-[2px] inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          Tạo từ tên
        </button>
      </div>

      {/* Mô tả ngắn */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả ngắn</label>
        <textarea className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" rows={3} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="Mô tả ngắn gọn cho trang listing, thẻ meta..." />
      </div>

      {/* Loại & trạng thái */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Loại sản phẩm</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            value={form.productType}
            onChange={(e) =>
              setForm({
                ...form,
                productType: e.target.value as ProductType,
              })
            }
          >
            <option value="simple">Simple</option>
            <option value="bundle">Bundle</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as ProductStatus,
              })
            }
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tags (phân tách bằng dấu phẩy)</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="stepper, nema17, linear-guide" />
      </div>

      {/* Giá / tồn kho */}
      <div className="border-t pt-4 mt-2 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Giá & tồn kho</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Giá cơ bản</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} placeholder="VD: 350000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Đơn vị tiền</label>
            <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Mã quản lý nội bộ" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tồn kho hiện tại</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} placeholder="VD: 10" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số lượng tối thiểu mỗi đơn</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.minOrderQty} onChange={(e) => setForm({ ...form, minOrderQty: e.target.value })} placeholder="VD: 1" />
          </div>

          <div className="flex items-center gap-2">
            <input id="stock_tracking" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={form.stockTracking} onChange={(e) => setForm({ ...form, stockTracking: e.target.checked })} />
            <label htmlFor="stock_tracking" className="text-sm font-medium text-gray-700">
              Theo dõi tồn kho
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
