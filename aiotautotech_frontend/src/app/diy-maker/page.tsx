'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';
import { navItems } from '@/components/layout/nav-items';

import { getPrimaryImageUrl } from '@/lib/productMedia';

interface ProductImage {
  id?: string;
  url?: string;
  url_medium?: string;
  url_thumb?: string;
  fileName?: string;
  alt?: string;
  title?: string;
  type?: string;
  isPrimary?: boolean;
}

interface Product {
  id: string;
  title: string;
  slug?: string;
  short_description?: string;
  description_html?: string;
  product_type?: string;
  status?: 'draft' | 'active' | 'archived' | string;
  base_price?: number | null;
  currency?: string;
  sku?: string;
  stock_tracking?: boolean;
  stock_qty?: number;
  min_order_qty?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;

  // Media mới
  images?: ProductImage[];
}

interface DiyMakerPageProps {}

function formatPrice(base_price?: number | null, currency?: string): string {
  if (base_price === null || base_price === undefined) return 'Chưa cập nhật';
  const cur = currency || 'VND';
  const formatted = base_price.toLocaleString('vi-VN');
  if (cur === 'VND') {
    return `${formatted}₫`;
  }
  return `${formatted} ${cur}`;
}

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
        } else if (data && Array.isArray((data as any).results)) {
          fetchedProducts = (data as any).results as Product[];
        } else {
          console.warn('Unexpected products response shape', data);
        }
        setProducts(fetchedProducts);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
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

        {/* Grid sản phẩm */}
        {!isLoading && hasProducts && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const priceLabel = formatPrice(
                product.base_price,
                product.currency
              );

              const mainImage = getPrimaryImageUrl(
                product.images || [],
                'thumb'
              );

              const slugPart =
                product.slug && product.slug.trim().length > 0
                  ? product.slug
                  : 'san-pham';

              const detailHref = `/diy-maker/${product.id}-${slugPart}`;

              return (
                <Link
                  href={detailHref}
                  key={product.id}
                  className="group flex flex-col rounded-2xl border border-gray-800 bg-[#111111] p-3 shadow-lg shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/15 sm:p-4"
                >
                  {/* Tên sản phẩm */}
                  <h2 className="mb-3 line-clamp-2 text-sm font-semibold text-gray-100 transition-colors group-hover:text-blue-300 sm:text-base">
                    {product.title || 'Sản phẩm chưa đặt tên'}
                  </h2>

                  {/* Bố cục 2 cột cho ảnh và mô tả */}
                  <div className="grid grid-cols-5 gap-4">
                    {/* Cột ảnh (2/5) */}
                    <div className="col-span-2">
                      {mainImage && (
                        <div className="aspect-[3/2] overflow-hidden rounded-xl bg-black/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mainImage}
                            alt={product.title || 'Ảnh sản phẩm'}
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </div>

                    {/* Cột mô tả (3/5) */}
                    <div className="col-span-3">
                      <div
                        className="prose prose-xs prose-invert max-w-none text-gray-400"
                        dangerouslySetInnerHTML={{
                          __html:
                            product.short_description ||
                            'Chưa có mô tả ngắn cho sản phẩm này.',
                        }}
                      />
                    </div>
                  </div>

                  {/* Giá */}
                  <div className="mt-auto flex items-baseline justify-between gap-2 pt-4">
                    <div className="text-base font-semibold text-blue-300">
                      {priceLabel}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
