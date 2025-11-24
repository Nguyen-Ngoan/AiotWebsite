// src/app/admin/products/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getApiUrl } from "@/lib/apiConfig";

// Kiểu sản phẩm
type ProductType = "simple" | "bundle" | "service";
type ProductStatus = "draft" | "active" | "archived";

interface BundleItem {
  id: number; // chỉ dùng trên UI
  childProductId: string;
  quantity: number;
  isOptional: boolean;
  isDefault: boolean;
  displayOrder: number;
  note: string;
}

type TabKey = "basic" | "description" | "bundle" | "media" | "seo" | "docs";

export default function NewProductPage() {
  const router = useRouter();

  // --- TAB STATE ---
  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  // --- BASIC INFO ---
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [productType, setProductType] = useState<ProductType>("simple");
  const [status, setStatus] = useState<ProductStatus>("draft");
  const [tags, setTags] = useState(""); // nhập chuỗi "tag1, tag2"

  // --- PRICE & STOCK ---
  const [basePrice, setBasePrice] = useState<string>("");
  const [currency, setCurrency] = useState("VND");
  const [sku, setSku] = useState("");
  const [stockTracking, setStockTracking] = useState(true);
  const [stockQty, setStockQty] = useState<string>("0");
  const [minOrderQty, setMinOrderQty] = useState<string>("1");

  // --- DESCRIPTION (HTML) ---
  const [descriptionHtml, setDescriptionHtml] = useState("");

  // --- BUNDLE ITEMS (nếu productType = "bundle") ---
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);

  // --- MEDIA (thô, UI cho tương lai – backend có thể cập nhật sau) ---
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // --- SEO (chưa lưu backend, dùng sau này) ---
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");

  // --- TECH DOCS (chưa lưu backend, dùng sau) ---
  const [datasheetUrl, setDatasheetUrl] = useState("");
  const [schematicUrl, setSchematicUrl] = useState("");
  const [stepModelUrl, setStepModelUrl] = useState("");
  const [stlFilesUrl, setStlFilesUrl] = useState("");
  const [userManualUrl, setUserManualUrl] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");

  // --- META ---
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto slug từ title (nếu slug đang rỗng hoặc giống slug cũ)
  useEffect(() => {
    if (!title.trim()) return;
    if (slug.trim().length === 0) {
      setSlug(slugify(title));
    }
  }, [title]);

  const handleSlugGenerate = () => {
    if (!title.trim()) return;
    setSlug(slugify(title));
  };

  // Thêm 1 item bundle
  const handleAddBundleItem = () => {
    setBundleItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        childProductId: "",
        quantity: 1,
        isOptional: false,
        isDefault: true,
        displayOrder: prev.length + 1,
        note: "",
      },
    ]);
  };

  // Cập nhật 1 field trong bundle item
  const updateBundleItem = (id: number, field: keyof BundleItem, value: string | boolean | number) => {
    setBundleItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // Xóa 1 bundle item
  const removeBundleItem = (id: number) => {
    setBundleItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Gallery
  const handleAddGalleryUrl = () => {
    const url = newGalleryUrl.trim();
    if (!url) return;
    setGallery((prev) => [...prev, url]);
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryUrl = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit tạo sản phẩm
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề sản phẩm.");
      setActiveTab("basic");
      return;
    }
    if (!slug.trim()) {
      setError("Vui lòng nhập hoặc tạo slug cho sản phẩm.");
      setActiveTab("basic");
      return;
    }

    const priceNumber = basePrice.trim().length > 0 ? Number(basePrice.replace(",", "")) : 0;
    const stockNumber = stockQty.trim().length > 0 ? Number(stockQty.replace(",", "")) : 0;
    const minOrderNumber = minOrderQty.trim().length > 0 ? Number(minOrderQty.replace(",", "")) : 1;

    // Chuẩn bị payload cho backend Django hiện tại
    // (đúng với ProductSerializer mình đã đề xuất trước đó)
    const payload: any = {
      title: title.trim(),
      slug: slug.trim(),
      short_description: shortDescription.trim(),
      description_html: descriptionHtml,
      productType,
      status,
      base_price: priceNumber || null,
      currency: currency.trim() || "VND",
      sku: sku.trim(),
      stock_tracking: stockTracking,
      stock_qty: stockNumber >= 0 ? stockNumber : 0,
      min_order_qty: minOrderNumber > 0 ? minOrderNumber : 1,
      tags: tags.trim(),
      // items: bundleItems sẽ được xử lý ở backend sau,
      // hiện tại serializer đang để read_only, nên sẽ bị bỏ qua.
    };

    setSaving(true);
    try {
      const url = getApiUrl("/products/");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${text}`);
      }

      const data = await res.json();
      // Sau khi tạo sản phẩm mới → chuyển về trang chi tiết hoặc danh sách
      // tạm thời push về /admin (bạn có thể đổi theo route thực tế)
      router.push("/admin");
    } catch (err) {
      if (err instanceof Error) {
        setError(`Không thể tạo sản phẩm: ${err.message}`);
      } else {
        setError("Đã xảy ra lỗi không xác định khi tạo sản phẩm.");
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Tab definitions
  const tabs: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Thông tin" },
    { key: "description", label: "Mô tả" },
    { key: "bundle", label: "Thành phần" },
    { key: "media", label: "Ảnh" },
    { key: "seo", label: "SEO" },
    { key: "docs", label: "Tài liệu" },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 pt-16 pb-20 px-6 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Header page */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Admin • Sản phẩm</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-50">Tạo sản phẩm mới</h1>
              <p className="mt-1 text-xs text-gray-500">Thiết lập thông tin cơ bản, mô tả, thành phần bundle và SEO cho sản phẩm.</p>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => router.back()} className="inline-flex items-center rounded-full border border-gray-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-300 hover:bg-gray-900">
                Hủy
              </button>
              <button type="submit" form="new-product-form" disabled={saving} className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow hover:bg-blue-500 disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div className="mb-4 rounded-xl border border-red-500/60 bg-red-900/20 px-4 py-3 text-sm text-red-200">{error}</div>}

          {/* Card lớn chứa Tabs + Form */}
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#050608] shadow-lg">
            {/* Tabs */}
            <div className="border-b border-gray-800 bg-[#0b0c10] px-4">
              <nav className="flex flex-wrap gap-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`relative px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${isActive ? "text-blue-300" : "text-gray-500 hover:text-gray-300"}`}>
                      {tab.label}
                      {isActive && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Form */}
            <form id="new-product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-0">
              {/* Left column: tab content */}
              <div className="border-b border-gray-800 lg:border-b-0 lg:border-r border-gray-800 bg-[#050608] px-4 py-4 sm:px-6 sm:py-6 min-h-[360px]">
                {activeTab === "basic" && <BasicTab title={title} setTitle={setTitle} slug={slug} setSlug={setSlug} onGenerateSlug={handleSlugGenerate} shortDescription={shortDescription} setShortDescription={setShortDescription} productType={productType} setProductType={setProductType} status={status} setStatus={setStatus} tags={tags} setTags={setTags} basePrice={basePrice} setBasePrice={setBasePrice} currency={currency} setCurrency={setCurrency} sku={sku} setSku={setSku} stockTracking={stockTracking} setStockTracking={setStockTracking} stockQty={stockQty} setStockQty={setStockQty} minOrderQty={minOrderQty} setMinOrderQty={setMinOrderQty} />}

                {activeTab === "description" && <DescriptionTab descriptionHtml={descriptionHtml} setDescriptionHtml={setDescriptionHtml} />}

                {activeTab === "bundle" && <BundleTab productType={productType} bundleItems={bundleItems} onAddItem={handleAddBundleItem} onChangeItem={updateBundleItem} onRemoveItem={removeBundleItem} />}

                {activeTab === "media" && <MediaTab mainImageUrl={mainImageUrl} setMainImageUrl={setMainImageUrl} gallery={gallery} newGalleryUrl={newGalleryUrl} setNewGalleryUrl={setNewGalleryUrl} onAddGalleryUrl={handleAddGalleryUrl} onRemoveGalleryUrl={handleRemoveGalleryUrl} />}

                {activeTab === "seo" && <SeoTab seoTitle={seoTitle} setSeoTitle={setSeoTitle} seoDescription={seoDescription} setSeoDescription={setSeoDescription} ogImage={ogImage} setOgImage={setOgImage} />}

                {activeTab === "docs" && <DocsTab datasheetUrl={datasheetUrl} setDatasheetUrl={setDatasheetUrl} schematicUrl={schematicUrl} setSchematicUrl={setSchematicUrl} stepModelUrl={stepModelUrl} setStepModelUrl={setStepModelUrl} stlFilesUrl={stlFilesUrl} setStlFilesUrl={setStlFilesUrl} userManualUrl={userManualUrl} setUserManualUrl={setUserManualUrl} githubRepoUrl={githubRepoUrl} setGithubRepoUrl={setGithubRepoUrl} />}
              </div>

              {/* Right column: summary / preview */}
              <div className="bg-[#050608] px-4 py-4 sm:px-5 sm:py-6">
                <RightSummary title={title} slug={slug} productType={productType} status={status} basePrice={basePrice} currency={currency} sku={sku} stockTracking={stockTracking} stockQty={stockQty} minOrderQty={minOrderQty} tags={tags} mainImageUrl={mainImageUrl} seoTitle={seoTitle} seoDescription={seoDescription} />
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- TAB COMPONENTS ---------- */

interface BasicTabProps {
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  onGenerateSlug: () => void;
  shortDescription: string;
  setShortDescription: (v: string) => void;
  productType: ProductType;
  setProductType: (v: ProductType) => void;
  status: ProductStatus;
  setStatus: (v: ProductStatus) => void;
  tags: string;
  setTags: (v: string) => void;
  basePrice: string;
  setBasePrice: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  sku: string;
  setSku: (v: string) => void;
  stockTracking: boolean;
  setStockTracking: (v: boolean) => void;
  stockQty: string;
  setStockQty: (v: string) => void;
  minOrderQty: string;
  setMinOrderQty: (v: string) => void;
}

function BasicTab(props: BasicTabProps) {
  const { title, setTitle, slug, setSlug, onGenerateSlug, shortDescription, setShortDescription, productType, setProductType, status, setStatus, tags, setTags, basePrice, setBasePrice, currency, setCurrency, sku, setSku, stockTracking, setStockTracking, stockQty, setStockQty, minOrderQty, setMinOrderQty } = props;

  return (
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <section>
        <h2 className="text-sm font-semibold text-gray-100 mb-3">Thông tin cơ bản</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Tên sản phẩm</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ví dụ: Trục tuyến tính NEMA 17 – 300mm" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Slug</label>
              <div className="flex gap-2">
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="truc-tuyen-tinh-nema-17-300mm" />
                <button type="button" onClick={onGenerateSlug} className="rounded-lg border border-gray-600 px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-gray-900">
                  Tạo từ tên
                </button>
              </div>
            </div>

            <div className="w-full sm:w-40">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Loại sản phẩm</label>
              <select value={productType} onChange={(e) => setProductType(e.target.value as ProductType)} className="w-full rounded-lg border border-gray-700 bg-black px-2 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="simple">Đơn (simple)</option>
                <option value="bundle">Bundle / Kit</option>
                <option value="service">Dịch vụ</option>
              </select>
            </div>

            <div className="w-full sm:w-40">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="w-full rounded-lg border border-gray-700 bg-black px-2 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Mô tả ngắn</label>
            <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" rows={3} placeholder="Tóm tắt 1–2 câu về sản phẩm..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Tags (ngăn cách bằng dấu phẩy)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="esp32, nema17, stepper, diy" />
          </div>
        </div>
      </section>

      {/* Giá & tồn kho */}
      <section>
        <h2 className="text-sm font-semibold text-gray-100 mb-3">Giá & tồn kho</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Giá bán (VND)</label>
            <input type="text" inputMode="decimal" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ví dụ: 350000" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Đơn vị tiền</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-2 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">SKU</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="AIOT-NEMA17-300" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Số lượng tối thiểu</label>
            <input type="text" inputMode="numeric" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="1" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-gray-300">
            <input type="checkbox" checked={stockTracking} onChange={(e) => setStockTracking(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-black text-blue-500 focus:ring-blue-500" />
            Theo dõi tồn kho
          </label>

          {stockTracking && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Tồn kho:</span>
              <input type="text" inputMode="numeric" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="w-20 rounded-lg border border-gray-700 bg-black px-2 py-1 text-xs text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface DescriptionTabProps {
  descriptionHtml: string;
  setDescriptionHtml: (v: string) => void;
}

// Ở đây mình dùng textarea đơn giản để nhập HTML
// Sau này bạn có thể reuse PostEditor (Tiptap) cho mô tả sản phẩm.
function DescriptionTab({ descriptionHtml, setDescriptionHtml }: DescriptionTabProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-100 mb-1.5">Mô tả chi tiết</h2>
      <p className="text-xs text-gray-500 mb-2">Bạn có thể dùng HTML hoặc nội dung text thông thường. Sau này có thể nâng cấp sử dụng editor giống phần blog.</p>
      <textarea value={descriptionHtml} onChange={(e) => setDescriptionHtml(e.target.value)} className="min-h-[260px] w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" placeholder="<p>Nội dung mô tả HTML...</p>" />
    </div>
  );
}

interface BundleTabProps {
  productType: ProductType;
  bundleItems: BundleItem[];
  onAddItem: () => void;
  onChangeItem: (id: number, field: keyof BundleItem, value: string | boolean | number) => void;
  onRemoveItem: (id: number) => void;
}

function BundleTab({ productType, bundleItems, onAddItem, onChangeItem, onRemoveItem }: BundleTabProps) {
  if (productType !== "bundle") {
    return (
      <div className="text-xs text-gray-400">
        Sản phẩm hiện tại không phải loại <strong className="text-gray-200">bundle</strong>. Chọn &quot;Bundle / Kit&quot; ở tab <span className="font-semibold">Thông tin</span> để thêm danh sách sản phẩm con.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-100">Thành phần trong bundle</h2>
        <button type="button" onClick={onAddItem} className="inline-flex items-center rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-100 hover:bg-gray-900">
          + Thêm sản phẩm con
        </button>
      </div>

      {bundleItems.length === 0 ? (
        <p className="text-xs text-gray-500">Chưa có sản phẩm con nào. Nhấn &quot;Thêm sản phẩm con&quot; để bắt đầu dựng bộ kit.</p>
      ) : (
        <div className="space-y-3">
          {bundleItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-800 bg-black/40 px-3 py-3 sm:px-4 sm:py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Thứ tự: <input type="number" value={item.displayOrder} onChange={(e) => onChangeItem(item.id, "displayOrder", Number(e.target.value) || 0)} className="ml-1 w-16 rounded-md border border-gray-700 bg-black px-2 py-1 text-xs text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <button type="button" onClick={() => onRemoveItem(item.id)} className="text-[11px] text-red-400 hover:text-red-300">
                  Xóa
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)_minmax(0,0.8fr)] gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">ID sản phẩm con</label>
                  <input type="text" value={item.childProductId} onChange={(e) => onChangeItem(item.id, "childProductId", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ví dụ: ESP32-WATERING-BOARD" />
                  <p className="mt-1 text-[10px] text-gray-500">Sau này có thể nâng cấp thành ô search sản phẩm.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Số lượng</label>
                  <input type="number" value={item.quantity} onChange={(e) => onChangeItem(item.id, "quantity", Number(e.target.value) || 1)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" min={1} />
                </div>

                <div className="flex flex-col gap-1.5 text-[11px] text-gray-300">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={item.isOptional} onChange={(e) => onChangeItem(item.id, "isOptional", e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-600 bg-black text-blue-500 focus:ring-blue-500" />
                    Tuỳ chọn (có thể bỏ)
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={item.isDefault} onChange={(e) => onChangeItem(item.id, "isDefault", e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-600 bg-black text-blue-500 focus:ring-blue-500" />
                    Chọn mặc định
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Ghi chú</label>
                <input type="text" value={item.note} onChange={(e) => onChangeItem(item.id, "note", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ví dụ: Có thể thay thế bằng cảm biến X..." />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaTabProps {
  mainImageUrl: string;
  setMainImageUrl: (v: string) => void;
  gallery: string[];
  newGalleryUrl: string;
  setNewGalleryUrl: (v: string) => void;
  onAddGalleryUrl: () => void;
  onRemoveGalleryUrl: (index: number) => void;
}

function MediaTab({ mainImageUrl, setMainImageUrl, gallery, newGalleryUrl, setNewGalleryUrl, onAddGalleryUrl, onRemoveGalleryUrl }: MediaTabProps) {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-sm font-semibold text-gray-100 mb-3">Ảnh chính</h2>
        <div className="space-y-2">
          <input type="text" value={mainImageUrl} onChange={(e) => setMainImageUrl(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="URL ảnh chính của sản phẩm..." />
          {mainImageUrl && (
            <div className="mt-2 rounded-xl border border-gray-800 bg-black/60 p-2">
              <img src={mainImageUrl} alt="Main image preview" className="max-h-48 w-full object-contain rounded-lg" />
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-100 mb-3">Gallery</h2>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input type="text" value={newGalleryUrl} onChange={(e) => setNewGalleryUrl(e.target.value)} className="flex-1 rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="URL ảnh thêm..." />
            <button type="button" onClick={onAddGalleryUrl} className="rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-100 hover:bg-gray-900">
              Thêm
            </button>
          </div>

          {gallery.length === 0 ? (
            <p className="text-xs text-gray-500">Chưa có ảnh gallery. Bạn có thể thêm một hoặc nhiều URL ảnh.</p>
          ) : (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((url, index) => (
                <div key={index} className="relative rounded-xl border border-gray-800 bg-black/60 p-2">
                  <img src={url} alt={`Gallery ${index + 1}`} className="h-24 w-full object-contain rounded-md" />
                  <button type="button" onClick={() => onRemoveGalleryUrl(index)} className="absolute right-1 top-1 rounded-full bg-black/80 px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-900/70">
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface SeoTabProps {
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  ogImage: string;
  setOgImage: (v: string) => void;
}

function SeoTab({ seoTitle, setSeoTitle, seoDescription, setSeoDescription, ogImage, setOgImage }: SeoTabProps) {
  return (
    <div className="space-y-4">
      <section>
        <h2 className="text-sm font-semibold text-gray-100 mb-3">SEO & mạng xã hội</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">SEO Title</label>
            <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Tiêu đề hiển thị trên Google..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">SEO Description</label>
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" rows={3} placeholder="Mô tả ngắn gọn, thu hút cho kết quả tìm kiếm..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">OG Image (URL)</label>
            <input type="text" value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ảnh chia sẻ trên mạng xã hội..." />
          </div>
        </div>
      </section>
    </div>
  );
}

interface DocsTabProps {
  datasheetUrl: string;
  setDatasheetUrl: (v: string) => void;
  schematicUrl: string;
  setSchematicUrl: (v: string) => void;
  stepModelUrl: string;
  setStepModelUrl: (v: string) => void;
  stlFilesUrl: string;
  setStlFilesUrl: (v: string) => void;
  userManualUrl: string;
  setUserManualUrl: (v: string) => void;
  githubRepoUrl: string;
  setGithubRepoUrl: (v: string) => void;
}

function DocsTab({ datasheetUrl, setDatasheetUrl, schematicUrl, setSchematicUrl, stepModelUrl, setStepModelUrl, stlFilesUrl, setStlFilesUrl, userManualUrl, setUserManualUrl, githubRepoUrl, setGithubRepoUrl }: DocsTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-100 mb-3">Tài liệu kỹ thuật</h2>
      <div className="space-y-3">
        <FieldUrl label="Datasheet (PDF)" value={datasheetUrl} onChange={setDatasheetUrl} placeholder="https://.../datasheet.pdf" />
        <FieldUrl label="Schematic (PDF/PNG)" value={schematicUrl} onChange={setSchematicUrl} placeholder="https://.../schematic.pdf" />
        <FieldUrl label="STEP model (3D)" value={stepModelUrl} onChange={setStepModelUrl} placeholder="https://.../model.step" />
        <FieldUrl label="STL files (3D printed parts)" value={stlFilesUrl} onChange={setStlFilesUrl} placeholder="https://.../stl-files.zip" />
        <FieldUrl label="User manual" value={userManualUrl} onChange={setUserManualUrl} placeholder="https://.../manual.pdf" />
        <FieldUrl label="Github repo" value={githubRepoUrl} onChange={setGithubRepoUrl} placeholder="https://github.com/..." />
      </div>
      <p className="text-[11px] text-gray-500">Các trường trên hiện mới dùng để chuẩn hóa dữ liệu nội bộ, backend có thể được mở rộng sau để lưu & hiển thị trên trang sản phẩm.</p>
    </div>
  );
}

interface FieldUrlProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function FieldUrl({ label, value, onChange, placeholder }: FieldUrlProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-300 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder={placeholder} />
    </div>
  );
}

/* ---------- RIGHT SUMMARY (preview) ---------- */

interface RightSummaryProps {
  title: string;
  slug: string;
  productType: ProductType;
  status: ProductStatus;
  basePrice: string;
  currency: string;
  sku: string;
  stockTracking: boolean;
  stockQty: string;
  minOrderQty: string;
  tags: string;
  mainImageUrl: string;
  seoTitle: string;
  seoDescription: string;
}

function RightSummary({ title, slug, productType, status, basePrice, currency, sku, stockTracking, stockQty, minOrderQty, tags, mainImageUrl, seoTitle, seoDescription }: RightSummaryProps) {
  return (
    <div className="space-y-5">
      {/* Preview thẻ sản phẩm */}
      <section className="rounded-xl border border-gray-800 bg-black/50 p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Xem nhanh sản phẩm</h3>

        <div className="flex gap-3">
          <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-[10px] text-gray-600">{mainImageUrl ? <img src={mainImageUrl} alt="Preview" className="h-full w-full object-cover rounded-lg" /> : "No image"}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500 mb-1">
              {productType.toUpperCase()} • <span className={status === "active" ? "text-green-400" : status === "draft" ? "text-yellow-300" : "text-gray-400"}>{status.toUpperCase()}</span>
            </p>
            <p className="text-sm font-semibold text-gray-100 truncate">{title || "Tên sản phẩm"}</p>
            <p className="mt-1 text-xs text-gray-500 truncate">/products/{slug || "slug-san-pham"}</p>
            <p className="mt-1 text-sm font-semibold text-blue-300">{basePrice ? `${basePrice} ${currency}` : "Chưa có giá"}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
          {sku && <span className="rounded-full border border-gray-700 px-2 py-0.5">SKU: {sku}</span>}
          {stockTracking && <span className="rounded-full border border-gray-700 px-2 py-0.5">Tồn kho: {stockQty || "0"}</span>}
          {minOrderQty && <span className="rounded-full border border-gray-700 px-2 py-0.5">Tối thiểu: {minOrderQty}</span>}
        </div>
      </section>

      {/* SEO preview */}
      <section className="rounded-xl border border-gray-800 bg-black/40 p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Preview kết quả tìm kiếm</h3>
        <div className="rounded-lg bg-[#111827] px-3 py-2 text-xs">
          <p className="text-[#4b8bf5] truncate">{seoTitle || title || "Tiêu đề sản phẩm – AIOT Autotech"}</p>
          <p className="text-[#4d5156] text-[11px]">aiotautotech.com › products › {slug || "slug-san-pham"}</p>
          <p className="mt-1 text-[#bdc1c6] text-[11px] line-clamp-3">{seoDescription || "Mô tả ngắn gọn về sản phẩm để thu hút người dùng và cải thiện SEO."}</p>
        </div>
      </section>

      {/* Tags */}
      {tags && (
        <section className="rounded-xl border border-gray-800 bg-black/40 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Tags</h3>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t, i) => (
                <span key={i} className="rounded-full border border-gray-700 px-2 py-0.5 text-gray-200">
                  {t}
                </span>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- UTILS ---------- */

// Chuyển "Trục tuyến tính NEMA 17 – 300mm" → "truc-tuyen-tinh-nema-17-300mm"
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD") // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, "") // remove dấu
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric -> -
    .replace(/^-+|-+$/g, ""); // trim -
}
