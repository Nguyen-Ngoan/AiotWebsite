// src/app/diy-maker/[idSlug]/ProductDetailPage.tsx

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';

import {
  getPrimaryImageUrl,
  getGalleryUrlsFromImages,
} from '@/lib/productMedia';
import { ProductHero } from './components/ProductHero';
import { ProductMediaAndPrice } from './components/ProductMediaAndPrice';
import { ProductFeatures } from './components/ProductFeatures';
import { ProductTechDocs } from './components/ProductTechDocs';
import { ProductAdminPanel } from './components/ProductAdminPanel';
import { ProductDescription } from './components/ProductDescription';

export interface ProductSpecItem {
  key?: string;
  value?: string;
}

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
  stock_qty?: number | null;
  min_order_qty?: number | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;

  // Media mới (R2 metadata)
  images?: ProductImage[];

  // Tài liệu kỹ thuật
  datasheet_url?: string;
  schematic_url?: string;
  step_model_url?: string;
  stl_files_url?: string;
  user_manual_url?: string;
  github_repo_url?: string;

  // Features
  key_features?: string[];
  use_cases?: string[];
  limitations?: string[];
  compatibility?: string[];
  specs?: ProductSpecItem[];
}

export interface ProductDetailPageProps {
  params: {
    idSlug: string;
  };
}

function formatPrice(base_price?: number | null, currency?: string): string {
  if (base_price === null || base_price === undefined) return 'Liên hệ';
  const cur = currency || 'VND';
  const formatted = base_price.toLocaleString('vi-VN');
  if (cur === 'VND') {
    return `${formatted}₫`;
  }
  return `${formatted} ${cur}`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Không rõ';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status?: string): string {
  switch (status) {
    case 'active':
      return 'Đang bán';
    case 'draft':
      return 'Nháp';
    case 'archived':
      return 'Đã ẩn';
    default:
      return status || 'Không rõ';
  }
}

function getTypeLabel(product_type?: string): string {
  switch (product_type) {
    case 'simple':
      return 'Simple';
    case 'bundle':
      return 'Bundle';
    case 'kit':
      return 'Kit / DIY';
    default:
      return product_type || 'Khác';
  }
}

async function fetchProduct(idSlug: string): Promise<Product | null> {
  if (!idSlug) return null;

  // Tách id và phần slug từ URL: EDnrFtIsZmi...-bo-dieu-khien-hmi-2-truc
  const [idPart, ...slugParts] = idSlug.split('-');
  const slugPart = slugParts.join('-');

  // Gọi list API (đang chạy ổn ở trang /diy-maker)
  const url = getApiUrl('/products/?limit=200');

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    console.error(
      'Failed to fetch product detail from list',
      res.status,
      await res.text()
    );
    return null;
  }

  const raw = await res.json();

  let products: Product[] = [];
  if (Array.isArray(raw)) {
    products = raw as Product[];
  } else if (raw && Array.isArray((raw as any).results)) {
    products = (raw as any).results as Product[];
  } else {
    console.warn(
      'Unexpected products response shape when fetching detail',
      raw
    );
    return null;
  }

  // Ưu tiên tìm theo id (Firestore doc id)
  if (idPart) {
    const foundById = products.find((p) => p.id === idPart);
    if (foundById) return foundById;
  }

  // Fallback: nếu phần slug không rỗng, thử match theo slug
  if (slugPart) {
    const foundBySlug = products.find((p) => p.slug === slugPart);
    if (foundBySlug) return foundBySlug;
  }

  return null;
}

// ✅ Định nghĩa component chính tên ProductDetailPageImpl
async function ProductDetailPageImpl({ params }: ProductDetailPageProps) {
  const product = await fetchProduct(params.idSlug);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100">
            Không tìm thấy sản phẩm. Có thể sản phẩm đã bị xóa hoặc bạn truy cập
            sai liên kết.
          </div>
          <div className="mt-4">
            <Link
              href="/diy-maker"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              ← Quay lại danh sách DIY Maker
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const {
    id,
    title,
    slug,
    short_description,
    description_html,
    product_type,
    status,
    base_price,
    currency,
    sku,
    stock_tracking,
    stock_qty,
    min_order_qty,
    tags,
    created_at,
    updated_at,
    images,
    datasheet_url,
    schematic_url,
    step_model_url,
    stl_files_url,
    user_manual_url,
    github_repo_url,
    key_features,
    use_cases,
    limitations,
    compatibility,
    specs,
  } = product;

  const priceLabel = formatPrice(base_price, currency);
  const statusLabel = getStatusLabel(status);
  const typeLabel = getTypeLabel(product_type);

  const productImages: ProductImage[] = Array.isArray(images) ? images : [];

  // Ảnh chính & gallery: ưu tiên `images`, fallback `gallery_urls`
  const mainImage = getPrimaryImageUrl(productImages, 'medium');

  // Lấy tất cả URL ảnh (bản thumb) cho gallery
  const galleryUrlsFinal = getGalleryUrlsFromImages(productImages, 'thumb');
  // Lấy tất cả URL ảnh (bản large) cho lightbox
  const lightboxUrls = getGalleryUrlsFromImages(productImages, 'large');

  const hasAnyFeatures = Boolean(
    (key_features && key_features.length > 0) ||
      (use_cases && use_cases.length > 0) ||
      (limitations && limitations.length > 0) ||
      (compatibility && compatibility.length > 0) ||
      (specs && specs.length > 0)
  );

  const slugPart = slug && slug.trim().length > 0 ? slug : 'san-pham';
  const breadCrumbIdSlug = `${id}-${slugPart}`;

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-8 pt-14 md:pt-32">
        {/* Breadcrumb trong ProductHero */}
        <ProductHero title={title} idSlug={breadCrumbIdSlug} />

        {/* Nội dung chính */}
        <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)]">
          {/* Cột trái: media, mô tả, features, docs */}
          <div className="space-y-6">
            <ProductMediaAndPrice
              mainImage={mainImage}
              short_description={short_description}
              galleryUrls={galleryUrlsFinal} // Dùng cho thumbnail
              lightboxUrls={lightboxUrls} // Dùng cho lightbox
              priceLabel={priceLabel}
              statusLabel={statusLabel}
              typeLabel={typeLabel}
              tags={tags}
              stock_tracking={stock_tracking}
              stock_qty={stock_qty}
              min_order_qty={min_order_qty}
              currency={currency}
            />

            <ProductDescription descriptionHtml={description_html} />

            <ProductFeatures
              hasAnyFeatures={hasAnyFeatures}
              key_features={key_features}
              use_cases={use_cases}
              limitations={limitations}
              compatibility={compatibility}
              specs={specs}
            />

            <ProductTechDocs
              datasheet_url={datasheet_url}
              schematic_url={schematic_url}
              step_model_url={step_model_url}
              stl_files_url={stl_files_url}
              user_manual_url={user_manual_url}
              github_repo_url={github_repo_url}
            />
          </div>

          {/* Cột phải: thông tin meta + admin panel */}
          <aside className="space-y-4 lg:border-l lg:border-gray-800 lg:pl-5">
            <ProductAdminPanel
              id={id}
              sku={sku}
              priceLabel={priceLabel}
              statusLabel={statusLabel}
              typeLabel={typeLabel}
              created_at={created_at}
              updated_at={updated_at}
            />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ✅ Export cả default lẫn named để chỗ khác có thể import { ProductDetailPageImpl }
export default ProductDetailPageImpl;
export { ProductDetailPageImpl };
