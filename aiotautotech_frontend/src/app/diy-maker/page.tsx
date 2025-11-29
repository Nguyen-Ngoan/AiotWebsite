// src/app/diy-maker/page.tsx

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';

import { getPrimaryImageFromImages } from '@/lib/productMedia';

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

  // Media cũ
  main_image_url?: string;
  gallery_urls?: string[];

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

async function fetchProducts(): Promise<Product[]> {
  const url = getApiUrl('/products/?limit=24&ordering=-created_at');

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    console.error('Failed to fetch products', res.status, await res.text());
    return [];
  }

  const data = await res.json();

  // Cho phép cả 2 dạng: mảng trực tiếp hoặc { results: [...] }
  if (Array.isArray(data)) {
    return data as Product[];
  }
  if (data && Array.isArray((data as any).results)) {
    return (data as any).results as Product[];
  }

  console.warn('Unexpected products response shape', data);
  return [];
}

export default async function DiyMakerPage(_: DiyMakerPageProps) {
  const products = await fetchProducts();
  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-20 md:pt-32">
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

        {/* Không có sản phẩm */}
        {!hasProducts && (
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
        {hasProducts && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const priceLabel = formatPrice(
                product.base_price,
                product.currency
              );

              const primaryImageMeta = getPrimaryImageFromImages<ProductImage>(
                product.images || []
              );

              const mainImage =
                primaryImageMeta?.url_thumb ||
                primaryImageMeta?.url_medium ||
                primaryImageMeta?.url ||
                (product.gallery_urls && product.gallery_urls.length > 0
                  ? product.gallery_urls[0]
                  : undefined);

              const slugPart =
                product.slug && product.slug.trim().length > 0
                  ? product.slug
                  : 'san-pham';

              const detailHref = `/diy-maker/${product.id}-${slugPart}`;

              return (
                <div
                  key={product.id}
                  className="flex flex-col rounded-2xl border border-gray-800 bg-[#050608] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
                >
                  {/* Vùng ảnh */}
                  {mainImage && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mainImage}
                        alt={product.title || 'Ảnh sản phẩm'}
                        className="h-40 w-full object-contain"
                      />
                    </div>
                  )}

                  {/* Header card: chỉ tên + mô tả ngắn */}
                  <div className="mb-3">
                    <Link href={detailHref} className="group">
                      <h2 className="line-clamp-2 text-sm font-semibold text-gray-100 transition-colors group-hover:text-blue-300 sm:text-base">
                        {product.title || 'Sản phẩm chưa đặt tên'}
                      </h2>
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                      {product.short_description ||
                        'Chưa có mô tả ngắn cho sản phẩm này.'}
                    </p>
                  </div>

                  {/* Giá */}
                  <div className="mt-auto flex items-baseline justify-between gap-2">
                    <div className="text-sm font-semibold text-blue-300">
                      {priceLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
