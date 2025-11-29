// src/app/diy-maker/[idSlug]/ProductDetailPage.tsx

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';

import {
  getMainImageUrlFromImagesAndGallery,
  getGalleryUrlsFromImagesAndLegacy,
} from '@/lib/productMedia';
import { ProductHero } from './components/ProductHero';
import { ProductMediaAndPrice } from './components/ProductMediaAndPrice';
import { ProductDescription } from './components/ProductDescription';
import { ProductFeatures } from './components/ProductFeatures';
import { ProductTechDocs } from './components/ProductTechDocs';
import { ProductAdminPanel } from './components/ProductAdminPanel';

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

  // Media cũ
  main_image_url?: string;
  gallery_urls?: string[];

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

function getPrimaryTag(tags?: string[]): string | null {
  if (!tags || tags.length === 0) return null;
  return tags[0];
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
    gallery_urls,
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
  const primaryTag = getPrimaryTag(tags);

  const productImages: ProductImage[] = Array.isArray(images) ? images : [];

  // Ảnh chính & gallery: ưu tiên `images`, fallback `gallery_urls`
  const mainImage = getMainImageUrlFromImagesAndGallery<ProductImage>({
    images: productImages,
    gallery_urls,
  });

  const galleryUrlsFinal = getGalleryUrlsFromImagesAndLegacy<ProductImage>({
    images: productImages,
    gallery_urls,
  });

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

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        {/* Breadcrumb trong ProductHero */}
        <ProductHero title={title} idSlug={breadCrumbIdSlug} />

        {/* Nội dung chính */}
        <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)]">
          {/* Cột trái: media, mô tả, features, docs */}
          <div className="space-y-6">
            <ProductMediaAndPrice
              mainImage={mainImage}
              short_description={short_description}
              galleryUrls={galleryUrlsFinal}
              priceLabel={priceLabel}
              statusLabel={statusLabel}
              typeLabel={typeLabel}
              primaryTag={primaryTag}
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
            <section className="rounded-xl border border-gray-800 bg-[#050608] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-100">
                  Thông tin sản phẩm
                </h2>
                <Link
                  href={`/admin/products/${id}/edit`}
                  className="inline-flex items-center rounded-full border border-blue-500 bg-blue-600/80 px-3 py-1 text-[11px] font-medium text-white hover:bg-blue-500"
                >
                  Sửa sản phẩm
                </Link>
              </div>

              <dl className="space-y-1">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">ID</dt>
                  <dd className="font-mono text-xs text-gray-200">{id}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">SKU</dt>
                  <dd className="font-mono text-xs text-gray-200">
                    {sku || 'Chưa có'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Trạng thái</dt>
                  <dd className="text-xs text-gray-100">{statusLabel}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Loại</dt>
                  <dd className="text-xs text-gray-100">{typeLabel}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Giá</dt>
                  <dd className="text-xs text-gray-100">{priceLabel}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Tạo lúc</dt>
                  <dd className="text-xs text-gray-100">
                    {formatDate(created_at)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Cập nhật</dt>
                  <dd className="text-xs text-gray-100">
                    {formatDate(updated_at)}
                  </dd>
                </div>
              </dl>

              {/* Admin note */}
              <div className="mt-4 rounded-lg border border-dashed border-gray-700 bg-black/30 px-3 py-2 text-[11px] text-gray-400">
                <p>
                  Panel này chỉ hiển thị cho admin. Bạn có thể dùng link sửa ở
                  trên để chỉnh sửa nhanh thông tin sản phẩm.
                </p>
              </div>
            </section>
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
