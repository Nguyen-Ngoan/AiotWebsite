import Link from 'next/link';
import { getPrimaryImageUrl } from '@/lib/productMedia';

export interface ProductImage {
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

export interface Product {
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
  images?: ProductImage[];
}

export function formatPrice(
  base_price?: number | null,
  currency?: string
): string {
  if (base_price === null || base_price === undefined) return 'Chưa cập nhật';
  const cur = currency || 'VND';
  const formatted = base_price.toLocaleString('vi-VN');
  if (cur === 'VND') {
    return `${formatted}₫`;
  }
  return `${formatted} ${cur}`;
}

type DiyProductCardProps = {
  product: Product;
};

export function DiyProductCard({ product }: DiyProductCardProps) {
  const priceLabel = formatPrice(product.base_price, product.currency);

  const mainImage = getPrimaryImageUrl(product.images || [], 'thumb');

  const slugPart =
    product.slug && product.slug.trim().length > 0 ? product.slug : 'san-pham';

  const detailHref = `/diy-maker/${product.id}-${slugPart}`;

  return (
    <Link
      href={detailHref}
      className="group flex h-full min-w-0 flex-col bg-[#111111] px-4 py-3 shadow-lg shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/15 sm:px-5 sm:py-4"
    >
      <h2 className="mb-3 line-clamp-2 w-full text-sm font-semibold text-gray-100 transition-colors group-hover:text-blue-300 sm:text-base">
        {product.title || 'Sản phẩm chưa đặt tên'}
      </h2>

      <div className="w-full shrink-0">
        {mainImage ? (
          <div className="aspect-[3/2] w-full overflow-hidden bg-black/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt={product.title || 'Ảnh sản phẩm'}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex aspect-[3/2] w-full items-center justify-center bg-black/50 text-xs text-gray-500">
            Chưa có ảnh
          </div>
        )}
      </div>

      <div
        className="prose prose-xs prose-invert mt-3 w-full min-w-0 max-w-none flex-1 text-gray-400"
        dangerouslySetInnerHTML={{
          __html:
            product.short_description ||
            'Chưa có mô tả ngắn cho sản phẩm này.',
        }}
      />

      <div className="mt-auto flex w-full items-baseline justify-between gap-2 pt-4">
        <div className="text-base font-semibold text-blue-300">{priceLabel}</div>
      </div>
    </Link>
  );
}
