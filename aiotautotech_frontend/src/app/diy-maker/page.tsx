'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';
import { navItems } from '@/components/layout/nav-items';
import {
  DiyProductCard,
  type Product,
} from '@/components/diy-maker/DiyProductCard';

interface DiyMakerPageProps {}

export default function DiyMakerPage(_: DiyMakerPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = getApiUrl('/products/?limit=24&ordering=-created_at');
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          next: { revalidate: 30 },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch products (HTTP ${res.status})`);
        }

        const data = await res.json();
        let fetchedProducts: Product[] = [];
        if (Array.isArray(data)) {
          fetchedProducts = data as Product[];
        } else if (data && Array.isArray((data as { results?: Product[] }).results)) {
          fetchedProducts = (data as { results: Product[] }).results;
        } else {
          console.warn('Unexpected products response shape', data);
        }
        setProducts(fetchedProducts);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const updatePadding = () => {
      if (headerRef.current) {
        setMainPaddingTop(headerRef.current.offsetHeight);
      }
    };
    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header ref={headerRef} navItems={navItems} />

      <main
        className="mx-auto max-w-6xl px-4 pb-16"
        style={{
          paddingTop: mainPaddingTop > 0 ? `${mainPaddingTop + 16}px` : '8rem',
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-xs">
            <li className="flex">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">Trang chủ</span>
                </Link>
              </div>
            </li>
            <li>
              <span className="text-gray-500">&gt;</span>
            </li>
            <li className="font-medium text-gray-200">Sản phẩm DIY</li>
          </ol>
        </nav>
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-50 sm:text-2xl">
              Sản phẩm DIY – Mạch điều khiển, board mạch. Chi tiết, case in 3D
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-gray-400 sm:text-sm">
              Các sản phẩm AIOT-AutoTech thiết kế cho nhu cầu DIY, nghiên cứu,
              thử nghiệm tự động hoá, IOT, nông nghiệp thông minh.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center rounded-full border border-blue-500 bg-blue-600/80 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-500"
          >
            + Thêm sản phẩm
          </Link>
        </div>

        {isLoading && (
          <div className="text-center text-gray-400">Đang tải sản phẩm...</div>
        )}
        {error && (
          <div className="rounded-md bg-red-900/50 p-4 text-center text-red-300">
            Lỗi tải dữ liệu: {error}
          </div>
        )}
        {!isLoading && !error && !hasProducts && (
          <div className="rounded-2xl border border-dashed border-gray-800/70 bg-[#050608] px-6 py-10 text-center text-sm text-gray-400">
            Chưa có sản phẩm nào được tạo.
            <br />
            Hãy bấm{' '}
            <span className="font-semibold text-gray-200">
              “+ Thêm sản phẩm”
            </span>{' '}
            ở góc phải để tạo sản phẩm đầu tiên.
          </div>
        )}

        {!isLoading && hasProducts && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <DiyProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
