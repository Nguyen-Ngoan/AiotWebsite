// src/app/admin/products/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';

import {
  ProductFormState,
  createEmptyForm,
  TabKey,
} from '../../productFormTypes';

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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// -------------------- PAGE COMPONENT --------------------

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = (params as { id?: string }).id;

  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [form, setForm] = useState<ProductFormState>(createEmptyForm());

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
          setLoadError(`Không tải được sản phẩm (HTTP ${res.status})`);
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

          mainImageUrl: data.main_image_url || '',
          gallery: Array.isArray(data.gallery_urls)
            ? (data.gallery_urls as string[])
            : [],
          images: Array.isArray(data.images) ? data.images : [],

          seoTitle: data.seo_title || '',
          seoDescription: data.seo_description || '',
          ogImage: data.og_image || '',

          datasheetUrl: data.datasheet_url || '',
          schematicUrl: data.schematic_url || '',
          stepModelUrl: data.step_model_url || '',
          stlFilesUrl: data.stl_files_url || '',
          userManualUrl: data.user_manual_url || '',
          githubRepoUrl: data.github_repo_url || '',

          // Features
          keyFeatures: Array.isArray(data.key_features)
            ? data.key_features
            : [],
          specs: Array.isArray(data.specs) ? data.specs : [],
          useCases: Array.isArray(data.use_cases) ? data.use_cases : [],
          limitations: Array.isArray(data.limitations) ? data.limitations : [],
          compatibility: Array.isArray(data.compatibility)
            ? data.compatibility
            : [],
        }));
      } catch (err: any) {
        setLoadError(err?.message || 'Lỗi kết nối server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // --------- SUBMIT HANDLER ---------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setErrorMessage(null);

    if (!form.title.trim()) {
      setErrorMessage('Vui lòng nhập tên sản phẩm');
      setActiveTab('basic');
      return;
    }

    const finalSlug = (form.slug || slugify(form.title)).trim();
    if (!finalSlug) {
      setErrorMessage('Slug không hợp lệ');
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

      main_image_url: form.mainImageUrl.trim(),
      gallery_urls: form.gallery,
      images: form.images || [],

      seo_title: form.seoTitle.trim(),
      seo_description: form.seoDescription.trim(),
      og_image: form.ogImage.trim(),

      datasheet_url: form.datasheetUrl.trim(),
      schematic_url: form.schematicUrl.trim(),
      step_model_url: form.stepModelUrl.trim(),
      stl_files_url: form.stlFilesUrl.trim(),
      user_manual_url: form.userManualUrl.trim(),
      github_repo_url: form.githubRepoUrl.trim(),

      key_features: form.keyFeatures,
      specs: form.specs,
      use_cases: form.useCases,
      limitations: form.limitations,
      compatibility: form.compatibility,
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
        let msg = `Cập nhật sản phẩm thất bại (HTTP ${res.status})`;
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

      router.push('/diy-maker');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------- RENDER ---------

  if (!productId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-sm text-gray-600">
            Không tìm thấy ID sản phẩm trong URL.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Sửa sản phẩm
              </h1>
            </div>
            <button
              type="button"
              onClick={() => router.push('/diy-maker')}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              ← Quay lại danh sách
            </button>
          </div>

          {isLoading ? (
            <div className="text-sm text-gray-600">Đang tải dữ liệu...</div>
          ) : loadError ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">
              {loadError}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
                  <TabsHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
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
                    <DocsTab form={form} setForm={setForm} />
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                <ProductSummaryCard form={form} />
                <ProductPricingCard
                  form={form}
                  errorMessage={errorMessage}
                  isSubmitting={isSubmitting}
                  onCancel={() => router.push('/diy-maker')}
                />
              </aside>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
