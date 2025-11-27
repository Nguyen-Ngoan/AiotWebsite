// src/components/admin/products/ProductPricingCard.tsx

"use client";

import { ProductFormState } from "./productFormTypes";

interface ProductPricingCardProps {
  form: ProductFormState;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function ProductPricingCard({ form, errorMessage, isSubmitting, onCancel }: ProductPricingCardProps) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#050608] p-4 text-xs text-gray-300 space-y-3">
      <h2 className="mb-2 text-sm font-semibold text-gray-100">Giá & tồn kho</h2>
      <p className="mb-1">
        <span className="text-gray-500">Giá bán: </span>
        {form.basePrice ? `${form.basePrice} ${form.currency}` : "Chưa đặt giá"}
      </p>
      <p className="mb-1">
        <span className="text-gray-500">SKU: </span>
        {form.sku || "Chưa có"}
      </p>
      <p className="mb-1">
        <span className="text-gray-500">Theo dõi tồn kho: </span>
        {form.stockTracking ? "Có" : "Không"}
      </p>
      <p className="mb-1">
        <span className="text-gray-500">Số lượng tồn: </span>
        {form.stockQty || "0"}
      </p>
      <p className="mb-1">
        <span className="text-gray-500">Số lượng tối thiểu mỗi đơn: </span>
        {form.minOrderQty || "1"}
      </p>

      {errorMessage && <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{errorMessage}</div>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isSubmitting} className="inline-flex flex-1 justify-center items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          Hủy
        </button>
      </div>

      <p className="text-[10px] text-gray-500">Sau khi lưu thành công, bạn sẽ được chuyển về trang danh sách sản phẩm DIY.</p>
    </div>
  );
}
