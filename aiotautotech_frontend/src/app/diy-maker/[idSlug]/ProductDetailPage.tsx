// src/app/diy-maker/[idSlug]/ProductDetailPage.tsx

import Link from 'next/link';
import { navItems } from '@/components/layout/nav-items';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';

import {
  getPrimaryImageUrl,
  getGalleryUrlsFromImages,
} from '@/lib/productMedia';
import { ProductHero } from './components/ProductHero';
import { ProductMediaAndPrice } from './components/ProductMediaAndPrice';
import { ProductTechDocs } from './components/ProductTechDocs';
import { ProductAdminPanel } from './components/ProductAdminPanel';
import { TechnicalDoc } from './components/technical-doc';
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

  // Tài liệu kỹ thuật (cấu trúc mới)
  tech_doc_ids?: string[];
  technical_docs?: TechnicalDoc[];

  // Features
  keyFeatures?: string[];
  useCases?: string[];
  limitations?: string[];
  compatibility?: string[];
  specs?: ProductSpecItem[];
  materials?: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    current_cost: number;
  }[];
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
        <Header navItems={navItems} />
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100">
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
    status,
    base_price,
    currency,
    sku,
    stock_tracking,
    stock_qty = null, // Cung cấp giá trị mặc định là null
    tags,
    created_at,
    updated_at,
    images,
    technical_docs,
    keyFeatures,
    useCases,
    limitations,
    compatibility,
    specs,
    materials,
  } = product;

  const priceLabel = formatPrice(base_price, currency);
  const statusLabel = getStatusLabel(status);

  const productImages: ProductImage[] = Array.isArray(images) ? images : [];

  // Ảnh chính & gallery: ưu tiên `images`, fallback `gallery_urls`
  const mainImage = getPrimaryImageUrl(productImages, 'large');

  // Lấy tất cả URL ảnh (bản thumb) cho gallery
  const galleryUrlsFinal = getGalleryUrlsFromImages(productImages, 'thumb');
  // Lấy tất cả URL ảnh (bản large) cho lightbox
  const lightboxUrls = getGalleryUrlsFromImages(productImages, 'large');

  const hasAnyFeatures = Boolean(
    (keyFeatures && keyFeatures.length > 0) ||
      (useCases && useCases.length > 0) ||
      (limitations && limitations.length > 0) ||
      (compatibility && compatibility.length > 0) ||
      (specs && specs.length > 0)
  );

  const totalMaterialCost = Array.isArray(materials)
    ? materials.reduce(
        (acc, m) => acc + (m.current_cost || 0) * (m.quantity || 0),
        0
      )
    : 0;

  const slugPart = slug && slug.trim().length > 0 ? slug : 'san-pham';
  const breadCrumbIdSlug = `${id}-${slugPart}`;

  // --- Tạo Dữ liệu có cấu trúc (JSON-LD) cho AI ---
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: short_description,
    sku: sku,
    image: mainImage,
    // Kết hợp các features thành một chuỗi mô tả chi tiết cho AI
    additionalProperty: [
      ...(keyFeatures?.map((f) => ({
        '@type': 'PropertyValue',
        name: 'Key Feature',
        value: f,
      })) || []),
      ...(specs?.map((s) => ({
        '@type': 'PropertyValue',
        name: s.key || 'Spec',
        value: s.value,
      })) || []),
      ...(useCases?.map((u) => ({
        '@type': 'PropertyValue',
        name: 'Use Case',
        value: u,
      })) || []),
      ...(limitations?.map((l) => ({
        '@type': 'PropertyValue',
        name: 'Limitation',
        value: l,
      })) || []),
      ...(compatibility?.map((c) => ({
        '@type': 'PropertyValue',
        name: 'Compatibility',
        value: c,
      })) || []),
    ],
    offers: {
      '@type': 'Offer',
      priceCurrency: currency || 'VND',
      price: base_price,
      // Xác định tình trạng còn hàng
      availability:
        status === 'active' && (stock_qty === null || stock_qty > 0)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://aiotautotech.com/diy-maker/${breadCrumbIdSlug}`, // Thay bằng domain của bạn
    },
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header navItems={navItems} />

      <main className="mx-auto max-w-6xl px-4 pb-8 pt-14 md:pt-32">
        {/* Breadcrumb trong ProductHero */}
        <ProductHero title={title} idSlug={breadCrumbIdSlug} />

        {/* Nội dung chính */}
        <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)]">
          {/* Cột trái: media, mô tả, features, docs */}
          <div className="min-w-0 space-y-4">
            <ProductMediaAndPrice
              mainImage={mainImage}
              galleryUrls={galleryUrlsFinal}
              lightboxUrls={lightboxUrls}
              technical_docs={technical_docs}
              short_description={short_description}
              priceLabel={priceLabel}
              statusLabel={statusLabel}
              tags={tags}
              currency={currency}
            />

            <ProductDescription descriptionHtml={description_html} />

            <ProductTechDocs docs={technical_docs} />
          </div>

          {/* Cột phải: thông tin meta + admin panel */}
          <aside className="min-w-0 space-y-4 lg:pl-5">
            <ProductAdminPanel
              id={id}
              sku={sku}
              priceLabel={priceLabel}
              statusLabel={statusLabel}
              created_at={created_at}
              updated_at={updated_at}
              structuredDataForAI={productStructuredData}
              totalMaterialCost={totalMaterialCost}
              materials={materials}
            />
          </aside>
        </div>
      </main>

      {/* Chèn Dữ liệu có cấu trúc vào trang. Thẻ này vô hình với người dùng. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />

      <Footer />
    </div>
  );
}

// ✅ Export cả default lẫn named để chỗ khác có thể import { ProductDetailPageImpl }
export default ProductDetailPageImpl;
export { ProductDetailPageImpl };
