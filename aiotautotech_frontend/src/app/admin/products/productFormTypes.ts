// src/components/admin/products/productFormTypes.ts

export type ProductType = 'simple' | 'bundle' | 'service';
export type ProductStatus = 'draft' | 'active' | 'archived';
// export type TabKey = "basic" | "description" | "bundle" | "media" | "seo" | "docs";
export type TabKey =
  | 'basic'
  | 'description'
  | 'features'
  | 'bundle'
  | 'media'
  | 'seo'
  | 'docs';

/**
 * Một thông số kỹ thuật dạng key/value
 * Ví dụ: { key: "Hành trình", value: "400mm" }
 */
export interface ProductSpecItem {
  key: string;
  value: string;
}

export type DocKey =
  | 'datasheet'
  | 'schematic'
  | 'step_model'
  | 'stl_files'
  | 'user_manual'
  | 'github_repo';

export interface DocMetadata {
  url: string;
  title: string;
  description: string;
  version: string;
  file_size: number;
  uploaded_at: string;
}

export interface ProductFormState {
  // BASIC
  title: string;
  slug: string;
  shortDescription: string;
  productType: ProductType;
  status: ProductStatus;
  tags: string;

  // PRICE / STOCK
  basePrice: string; // lưu string để dễ nhập 350.000 / 350,000
  currency: string;
  sku: string;
  stockTracking: boolean;
  stockQty: string;
  minOrderQty: string;

  // DESCRIPTION (HTML dài)
  descriptionHtml: string;

  // MEDIA
  mainImageUrl: string;
  gallery: string[];
  images: any[]; // metadata ảnh từ Firestore / Cloudflare R2

  // SEO
  seoTitle: string;
  seoDescription: string;
  ogImage: string;

  // TECH DOCS (new structure)
  docs: { [key in DocKey]?: DocMetadata | null };

  // 🔹 NEW: FEATURE FIELDS (để AI & UI hiểu sản phẩm rõ hơn)

  /**
   * Các đặc điểm nổi bật (key features) dạng bullet list
   * Ví dụ:
   * - "Hành trình 400mm – dùng ray MGN12H"
   * - "Tải trọng tối đa 8kg"
   */
  keyFeatures: string[];

  /**
   * Các thông số kỹ thuật chính (có cấu trúc)
   * Ví dụ:
   * - { key: "Hành trình", value: "400mm" }
   * - { key: "Độ chính xác", value: "±0.05mm" }
   */
  specs: ProductSpecItem[];

  /**
   * Các ứng dụng chính
   * Ví dụ:
   * - "Máy CNC mini"
   * - "Máy đùn đất sét"
   * - "Máy pick & place"
   */
  useCases: string[];

  /**
   * Các giới hạn / lưu ý
   * Ví dụ:
   * - "Không phù hợp tải > 8kg"
   * - "Không chạy ổn định trên 1800 rpm"
   */
  limitations: string[];

  /**
   * Tương thích với những gì
   * Ví dụ:
   * - "Động cơ NEMA17"
   * - "Driver TMC2209"
   * - "Thanh nhôm 2020"
   */
  compatibility: string[];
}

export function createEmptyForm(): ProductFormState {
  return {
    title: '',
    slug: '',
    shortDescription: '',
    productType: 'simple',
    status: 'draft',
    tags: '',

    basePrice: '',
    currency: 'VND',
    sku: '',
    stockTracking: true,
    stockQty: '',
    minOrderQty: '1',

    descriptionHtml: '',

    mainImageUrl: '',
    gallery: [],
    images: [],

    seoTitle: '',
    seoDescription: '',
    ogImage: '',

    // Docs
    docs: {},
    // Feature fields mặc định rỗng
    keyFeatures: [],
    specs: [],
    useCases: [],
    limitations: [],
    compatibility: [],
  };
}
