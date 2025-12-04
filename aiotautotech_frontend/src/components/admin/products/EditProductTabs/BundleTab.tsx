// src/components/admin/products/EditProductTabs/BundleTab.tsx

'use client';

import type { ProductFormState } from '@/app/admin/products/[id]/edit/page';

interface BundleTabProps {
  form: ProductFormState;
}

export default function BundleTab({ form }: BundleTabProps) {
  if (form.productType !== 'bundle') {
    return (
      <div className="text-sm text-gray-500 p-4 lg:p-0">
        Loại sản phẩm hiện tại không phải <b>bundle</b>. Hãy chọn loại{' '}
        <b>bundle</b> trong tab &quot;Thông tin cơ bản&quot; nếu muốn cấu hình
        danh sách sản phẩm con.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm text-gray-600 p-4 lg:p-0">
      <p>
        Tab này dành cho cấu hình kit / bundle (nhiều sản phẩm con trong một
        gói). Backend hiện tại chưa lưu cấu trúc này trong Firestore, nên phần
        này tạm thời là ghi chú / placeholder.
      </p>
      <p>
        Khi bạn muốn dùng thật, ta sẽ thêm:
        <br />- Mảng <code>bundleItems</code> trong{' '}
        <code>ProductFormState</code>
        <br />- UI thêm/xóa sản phẩm con, số lượng...
      </p>
    </div>
  );
}
