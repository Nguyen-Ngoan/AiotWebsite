// src/app/admin/products/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';
import { navItems } from '@/components/layout/nav-items';
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm';

// ====== Trang tạo sản phẩm mới ======
export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProduct = async (data: ProductFormData) => {
    setIsSubmitting(true);
    const res = await fetch(getApiUrl('/products/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let msg = `Tạo sản phẩm thất bại (HTTP ${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData && typeof errorData.error === 'string') {
          msg = errorData.error;
        }
      } catch {
        // ignore
      }
      setIsSubmitting(false);
      throw new Error(msg);
    }

    router.push('/admin/products');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header navItems={navItems} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Tạo sản phẩm mới
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Nhập đầy đủ thông tin sản phẩm. Tất cả field sẽ được lưu vào
              Firestore qua API /products/.
            </p>
          </div>

          <ProductForm
            onSubmit={handleCreateProduct}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
