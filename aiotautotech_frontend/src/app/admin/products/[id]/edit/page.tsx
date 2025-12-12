// src/app/admin/products/[id]/edit/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { slugify } from '@/lib/slugify';
import { useRouter, useParams } from 'next/navigation';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';
import { navItems } from '@/components/layout/nav-items';

import {
  type ProductFormState as BaseProductFormState,
  createEmptyForm,
  type TabKey,
} from '../../productFormTypes';
import type { TechnicalDoc } from '@/app/diy-maker/[idSlug]/components/technical-doc';

// Mở rộng ProductFormState để bao gồm các trường mới, giống như trong DocsTab
export type ProductFormState = BaseProductFormState & {
  tech_doc_ids: string[];
  technical_docs: TechnicalDoc[];
  materials: ProductMaterial[];
};

export interface ProductMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  current_cost: number;
}

import ProductSummaryCard from '../../ProductSummaryCard';
import ProductPricingCard from '../../ProductPricingCard';

import {
  TabsHeader,
  BasicInfoTab,
  DescriptionTab,
  BundleTab,
  MediaTab,
  SeoTab,
  DocsTab,
  FeaturesTab,
} from '@/components/admin/products/EditProductTabs';
import { MaterialsTab } from '@/components/admin/products/EditProductTabs/MaterialsTab';

// -------------------- UTILS --------------------

function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }
  const s = value.toString().trim();
  if (!s) return null;
  const cleaned = s.replace(/\./g, '').replace(',', '.');
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

// -------------------- PAGE COMPONENT --------------------

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = (params as { id?: string }).id;

  const [activeTab, setActiveTab] = useState<TabKey | 'materials'>('docs');
  const [form, setForm] = useState<ProductFormState>({
    ...createEmptyForm(),
    tech_doc_ids: [],
    technical_docs: [],
    materials: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  // --------- FETCH PRODUCT DATA ---------
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const res = await fetch(getApiUrl(`/products/${productId}/`), {
          method: 'GET',
        });

        if (!res.ok) {
          setLoadError(`Failed to load product (HTTP ${res.status})`);
          return;
        }

        const data = await res.json();

        setForm((prev) => ({
          ...prev,
          title: data.title || '',
          slug: data.slug || '',
          shortDescription: data.short_description || '',
          productType: (data.product_type as any) || 'simple',
          status: (data.status as any) || 'draft',

          basePrice:
            data.base_price !== null && data.base_price !== undefined
              ? String(data.base_price)
              : '',
          currency: data.currency || 'VND',
          sku: data.sku || '',
          stockTracking:
            typeof data.stock_tracking === 'boolean'
              ? data.stock_tracking
              : true,
          stockQty:
            data.stock_qty !== null && data.stock_qty !== undefined
              ? String(data.stock_qty)
              : '',
          minOrderQty:
            data.min_order_qty !== null && data.min_order_qty !== undefined
              ? String(data.min_order_qty)
              : '1',

          tags: Array.isArray(data.tags)
            ? data.tags.join(', ')
            : typeof data.tags === 'string'
            ? data.tags
            : '',

          descriptionHtml: data.description_html || '',

          images: Array.isArray(data.images) ? data.images : [],

          seoTitle: data.seo_title || '',
          seoDescription: data.seo_description || '',
          ogImage: data.og_image || '',

          // Docs (cấu trúc mới) - API trả về cả hai
          tech_doc_ids: Array.isArray(data.tech_doc_ids)
            ? data.tech_doc_ids
            : [],
          technical_docs: Array.isArray(data.technical_docs)
            ? data.technical_docs
            : [],

          // Features
          keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
          specs: Array.isArray(data.specs) ? data.specs : [],
          useCases: Array.isArray(data.useCases) ? data.useCases : [],
          limitations: Array.isArray(data.limitations) ? data.limitations : [],
          compatibility: Array.isArray(data.compatibility)
            ? data.compatibility
            : [],

          // Materials
          materials: Array.isArray(data.materials) ? data.materials : [],
        }));
      } catch (err: any) {
        setLoadError(err?.message || 'Server connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // --------- DYNAMIC HEADER PADDING ---------
  useEffect(() => {
    const updatePadding = () => {
      if (headerRef.current) {
        setMainPaddingTop(headerRef.current.offsetHeight);
      }
    };

    updatePadding(); // Initial calculation

    // Recalculate on window resize (for responsive changes)
    window.addEventListener('resize', updatePadding);

    return () => {
      window.removeEventListener('resize', updatePadding);
    };
  }, []);

  // --------- NAVIGATION HANDLERS ---------
  const goToProductDetail = (slug?: string) => {
    const slugPart = slug && slug.trim().length > 0 ? slug.trim() : 'san-pham';
    let targetUrl = '/diy-maker'; // Fallback

    if (productId) {
      targetUrl = `/diy-maker/${productId}-${slugPart}`;
    }

    // Sử dụng window.location.href để buộc trình duyệt tải lại trang
    // thay vì dùng router.push (client-side navigation)
    window.location.href = targetUrl;
  };

  // --------- SUBMIT HANDLER ---------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setErrorMessage(null);

    if (!form.title.trim()) {
      setErrorMessage('Please enter a product name');
      setActiveTab('basic');
      return;
    }

    const finalSlug = (form.slug || slugify(form.title)).trim();
    if (!finalSlug) {
      setErrorMessage('Invalid slug');
      setActiveTab('basic');
      return;
    }

    const priceNumber = parseNumber(form.basePrice);
    const stockNumber = parseNumber(form.stockQty);
    const minOrderNumber = parseNumber(form.minOrderQty);

    const payload: any = {
      title: form.title.trim(),
      slug: finalSlug,
      short_description: form.shortDescription.trim(),
      description_html: form.descriptionHtml.trim(),
      product_type: form.productType,
      status: form.status,
      base_price: priceNumber,
      currency: form.currency,
      sku: form.sku.trim(),
      stock_tracking: form.stockTracking,
      stock_qty: stockNumber,
      min_order_qty: minOrderNumber,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),

      images: form.images || [],

      seo_title: form.seoTitle.trim(),
      seo_description: form.seoDescription.trim(),
      og_image: form.ogImage.trim(),

      // Docs (cấu trúc mới): Chỉ gửi lên danh sách ID
      tech_doc_ids: form.tech_doc_ids,

      key_features: form.keyFeatures,
      specs: form.specs,
      use_cases: form.useCases,
      limitations: form.limitations,
      compatibility: form.compatibility,

      materials: form.materials.map((m) => ({
        material_id: m.id,
        quantity: m.quantity,
      })),
    };

    try {
      setIsSubmitting(true);

      const res = await fetch(getApiUrl(`/products/${productId}/`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `Product update failed (HTTP ${res.status})`;
        try {
          const data = await res.json();
          if (data && typeof data.error === 'string') {
            msg = data.error;
          }
        } catch {
          // ignore
        }
        setErrorMessage(msg);
        return;
      }

      goToProductDetail(finalSlug);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Server connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------- RENDER ---------

  if (!productId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header navItems={navItems} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-sm text-gray-600">
            Product ID not found in URL.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header ref={headerRef} navItems={navItems} />
      <main
        className="flex-1"
        style={{
          paddingTop: mainPaddingTop > 0 ? `${mainPaddingTop}px` : '7rem',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold text-gray-900">
              Edit Product
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToProductDetail(form.slug)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-edit-form"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-sm text-gray-600">Loading data...</div>
          ) : loadError ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">
              {loadError}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              id="product-edit-form"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:p-5">
                  <TabsHeader
                    activeTab={activeTab as TabKey}
                    setActiveTab={setActiveTab as any}
                  />

                  {activeTab === 'basic' && (
                    <BasicInfoTab form={form} setForm={setForm} />
                  )}

                  {activeTab === 'description' && (
                    <DescriptionTab form={form} setForm={setForm} />
                  )}

                  {activeTab === 'features' && (
                    <FeaturesTab form={form} setForm={setForm} />
                  )}

                  {activeTab === 'bundle' && <BundleTab form={form} />}

                  {activeTab === 'media' && (
                    <MediaTab
                      productId={productId}
                      form={form}
                      setForm={setForm}
                    />
                  )}

                  {activeTab === 'seo' && (
                    <SeoTab form={form} setForm={setForm} />
                  )}

                  {activeTab === 'docs' && (
                    <DocsTab
                      productId={productId}
                      form={form}
                      setForm={setForm}
                    />
                  )}

                  {activeTab === 'materials' && (
                    <MaterialsTab form={form} setForm={setForm} />
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                <ProductSummaryCard form={form} />
                {/* Nút Lưu & Huỷ ở cuối trang đã được loại bỏ */}
              </aside>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
