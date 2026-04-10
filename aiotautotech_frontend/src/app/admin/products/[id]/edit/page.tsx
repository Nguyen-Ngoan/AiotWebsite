// src/app/admin/products/[id]/edit/page.tsx
'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { slugify } from '@/lib/slugify';
import { useRouter, useParams } from 'next/navigation';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';
import { navItems } from '@/components/layout/nav-items';
import { CheckIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

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

const getViewportSnapshot = () =>
  typeof window === 'undefined'
    ? 0
    : window.visualViewport?.height ?? window.innerHeight;

const getViewportWidthSnapshot = () =>
  typeof window === 'undefined'
    ? 0
    : window.visualViewport?.width ?? window.innerWidth;

const subscribeViewport = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};

  const visualViewport = window.visualViewport;
  const handler = () => callback();

  visualViewport?.addEventListener('resize', handler);
  visualViewport?.addEventListener('scroll', handler);
  window.addEventListener('resize', handler);

  return () => {
    visualViewport?.removeEventListener('resize', handler);
    visualViewport?.removeEventListener('scroll', handler);
    window.removeEventListener('resize', handler);
  };
};

// -------------------- PAGE COMPONENT --------------------
interface EditProductPageContentProps {
  initialTab?: TabKey | 'materials';
  showTabsHeader?: boolean;
  pageTitle?: string;
  showFooter?: boolean;
}

export function EditProductPageContent({
  initialTab = 'docs',
  showTabsHeader = true,
  pageTitle = 'Edit Product',
  showFooter = true,
}: EditProductPageContentProps) {
  const router = useRouter();
  const params = useParams();
  const productId = (params as { id?: string }).id;

  const [activeTab, setActiveTab] = useState<TabKey | 'materials'>(initialTab);
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
  const viewportHeight = useSyncExternalStore(
    subscribeViewport,
    getViewportSnapshot,
    () => 0
  );
  const viewportWidth = useSyncExternalStore(
    subscribeViewport,
    getViewportWidthSnapshot,
    () => 0
  );
  const isMobileViewport = viewportWidth > 0 && viewportWidth < 640;
  const shouldShowHeader = !(viewportWidth > 0 && viewportWidth < 640);
  const isDescriptionEditorMode = !showTabsHeader && activeTab === 'description';
  const useFixedActionBar = isMobileViewport;

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
      if (!shouldShowHeader) {
        setMainPaddingTop(0);
        return;
      }
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
  }, [shouldShowHeader]);

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
      <div
        data-product-edit-page
        className="min-h-screen flex flex-col bg-gray-50"
      >
        {shouldShowHeader && <Header navItems={navItems} />}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-sm text-gray-600">
            Product ID not found in URL.
          </div>
        </main>
        <Footer />
        <style jsx global>{`
          [data-product-edit-page] [id*='scroll-to-top'],
          [data-product-edit-page] [class*='scroll-to-top'],
          [data-product-edit-page] [id*='back-to-top'],
          [data-product-edit-page] [class*='back-to-top'],
          [data-product-edit-page] button[aria-label*='top' i],
          [data-product-edit-page] button[title*='top' i],
          [data-product-edit-page] a[aria-label*='top' i],
          [data-product-edit-page] a[title*='top' i] {
            display: none !important;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div data-product-edit-page className="min-h-screen flex flex-col bg-gray-50">
      {shouldShowHeader && <Header ref={headerRef} navItems={navItems} />}
      <main
        className={`flex-1 ${isDescriptionEditorMode ? 'overflow-hidden' : ''}`}
        style={{
          paddingTop: shouldShowHeader
            ? mainPaddingTop > 0
              ? `${mainPaddingTop}px`
              : '7rem'
            : 0,
          ...(isDescriptionEditorMode && viewportHeight > 0
            ? { height: `${Math.round(viewportHeight)}px` }
            : {}),
        }}
      >
        <div
          className={`mx-auto ${
            isDescriptionEditorMode
              ? 'max-w-none px-0 flex h-full flex-col overflow-hidden pt-0 pb-2 sm:pb-4'
              : 'max-w-6xl px-4 sm:px-6 lg:px-8 pt-0 pb-6'
          }`}
        >
          <div
            className={`grid grid-cols-3 items-center gap-2 ${
              isDescriptionEditorMode
                ? 'mb-2 shrink-0 pr-3 sm:pr-4'
                : 'mb-4'
            } z-30 bg-gray-50/95 py-0.5 backdrop-blur-sm ${
              useFixedActionBar
                ? 'fixed left-0 right-0 border-b border-gray-200/70 px-2'
                : 'sticky'
            }`}
            style={{
              top: shouldShowHeader ? `${mainPaddingTop}px` : 0,
            }}
          >
            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={() => goToProductDetail(form.slug)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                aria-label="Cancel"
                title="Cancel"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
            </div>

            <h1 className="text-center text-base font-semibold text-gray-900 sm:text-lg">
              {pageTitle}
            </h1>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                form="product-edit-form"
                disabled={isSubmitting}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                aria-label={isSubmitting ? 'Saving' : 'Save changes'}
                title={isSubmitting ? 'Saving...' : 'Save changes'}
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          {useFixedActionBar && (
            <div className="h-11 shrink-0" aria-hidden="true" />
          )}

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
              className={`${isDescriptionEditorMode ? 'max-w-none flex-1 min-h-0' : 'max-w-4xl'}`}
            >
              <div
                className={`bg-white rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:p-5 ${
                  isDescriptionEditorMode ? 'flex h-full min-h-0 flex-col' : ''
                }`}
              >
                {showTabsHeader && (
                  <TabsHeader
                    activeTab={activeTab as TabKey}
                    setActiveTab={setActiveTab as any}
                  />
                )}

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
            </form>
          )}
        </div>
      </main>
      {showFooter && <Footer />}
      <style jsx global>{`
        [data-product-edit-page] [id*='scroll-to-top'],
        [data-product-edit-page] [class*='scroll-to-top'],
        [data-product-edit-page] [id*='back-to-top'],
        [data-product-edit-page] [class*='back-to-top'],
        [data-product-edit-page] button[aria-label*='top' i],
        [data-product-edit-page] button[title*='top' i],
        [data-product-edit-page] a[aria-label*='top' i],
        [data-product-edit-page] a[title*='top' i] {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = (params as { id?: string }).id;

  useEffect(() => {
    if (!productId) {
      router.replace('/admin/products');
      return;
    }
    router.replace(`/admin/products/${productId}/edit/basic`);
  }, [productId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-600">
      Redirecting to section editor...
    </div>
  );
}
