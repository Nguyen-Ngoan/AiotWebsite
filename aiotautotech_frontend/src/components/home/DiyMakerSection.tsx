// src/components/home/DiyMakerSection.tsx

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/apiConfig';
import {
  DiyProductCard,
  type Product,
} from '@/components/diy-maker/DiyProductCard';

const HOME_PRODUCT_LIMIT = 6;

export default function DiyMakerSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = getApiUrl(
          `/products/?limit=${HOME_PRODUCT_LIMIT}&ordering=-created_at`
        );
        const res = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch products (HTTP ${res.status})`);
        }

        const data = await res.json();
        let list: Product[] = [];
        if (Array.isArray(data)) {
          list = data as Product[];
        } else if (
          data &&
          Array.isArray((data as { results?: Product[] }).results)
        ) {
          list = (data as { results: Product[] }).results;
        }
        setProducts(list);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Không tải được danh sách.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const hasProducts = products.length > 0;

  return (
    <section
      id="diy-maker"
      className="w-full border-b border-gray-800 bg-black text-white"
    >
      <div className="mx-auto max-w-6xl px-4 pt-3 pb-8 md:py-10 lg:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="max-w-xl shrink-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              DIY PRODUCT
            </p>

            <h2 className="mb-3 text-3xl font-semibold leading-tight md:text-4xl">
              SẢN PHẨM
            </h2>

            <p className="mb-6 text-sm leading-relaxed text-gray-300 sm:text-base">
              Linh kiện IoT, board ESP32/STM32, trục tuyến tính in 3D, CNC
              mini. Miễn phí tài liệu. Dễ học. Dễ làm.
            </p>

            <Link
              href="/diy-maker"
              className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Xem tất cả sản phẩm
              <span className="ml-1 text-base">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 md:mt-10">
          {isLoading && (
            <p className="text-center text-sm text-gray-500">
              Đang tải sản phẩm…
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-center text-sm text-red-300">
              {error}
            </p>
          )}
          {!isLoading && !error && !hasProducts && (
            <p className="rounded-xl border border-dashed border-gray-700 bg-[#050608] px-4 py-8 text-center text-sm text-gray-500">
              Chưa có sản phẩm nào.{' '}
              <Link href="/admin/products/new" className="text-blue-400 hover:underline">
                Thêm sản phẩm
              </Link>
            </p>
          )}
          {!isLoading && hasProducts && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <DiyProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
