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
}

// Tabs
type TabKey = "basic" | "description" | "bundle" | "media" | "seo" | "docs";

// Slug helper
function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

// ====== Props cho từng Tab ======
interface BasicInfoTabProps {
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  onSlugGenerate: () => void;
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

interface DescriptionTabProps {
  descriptionHtml: string;
  setDescriptionHtml: (v: string) => void;
}

interface BundleTabProps {
  productType: ProductType;
  bundleItems: BundleItem[];
  setBundleItems: (items: BundleItem[]) => void;
}

interface MediaTabProps {
  mainImageUrl: string;
  setMainImageUrl: (v: string) => void;
  gallery: string[];
  setGallery: (v: string[]) => void;
}

interface SeoTabProps {
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  ogImage: string;
  setOgImage: (v: string) => void;
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

// ====== Tabs Header ======
interface TabsHeaderProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

function TabsHeader({ activeTab, setActiveTab }: TabsHeaderProps) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Thông tin cơ bản" },
    { key: "description", label: "Mô tả" },
    { key: "bundle", label: "Bundle" },
    { key: "media", label: "Ảnh" },
    { key: "seo", label: "SEO" },
    { key: "docs", label: "Tài liệu kỹ thuật" },
  ];

  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="-mb-px flex flex-wrap gap-3" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={"whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium transition-colors " + (isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}>
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ====== Tab: Thông tin cơ bản ======
function BasicInfoTab(props: BasicInfoTabProps) {
  const { title, setTitle, slug, setSlug, onSlugGenerate, shortDescription, setShortDescription, productType, setProductType, status, setStatus, tags, setTags, basePrice, setBasePrice, currency, setCurrency, sku, setSku, stockTracking, setStockTracking, stockQty, setStockQty, minOrderQty, setMinOrderQty } = props;

  return (
    <div className="space-y-4">
      {/* Tên & slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên sản phẩm *</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Bộ trục tuyến tính X 400mm" />
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="bo-truc-tuyen-tinh-x-400mm" />
        </div>
        <button type="button" onClick={onSlugGenerate} className="mb-[2px] inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          Tạo từ tên
        </button>
      </div>

      {/* Mô tả ngắn */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả ngắn</label>
        <textarea className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" rows={3} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Mô tả ngắn gọn cho trang listing, thẻ meta..." />
      </div>

      {/* Loại & trạng thái */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Loại sản phẩm</label>
          <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={productType} onChange={(e) => setProductType(e.target.value as ProductType)}>
            <option value="simple">Simple</option>
            <option value="bundle">Bundle</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
          <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tags (phân tách bằng dấu phẩy)</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="stepper, nema17, linear-guide" />
      </div>

      {/* Giá / tồn kho */}
      <div className="border-t pt-4 mt-2 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Giá & tồn kho</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Giá cơ bản</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="VD: 350000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Đơn vị tiền</label>
            <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Mã quản lý nội bộ" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tồn kho hiện tại</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="VD: 10" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số lượng tối thiểu mỗi đơn</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} placeholder="VD: 1" />
          </div>

          <div className="flex items-center gap-2">
            <input id="stock_tracking" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={stockTracking} onChange={(e) => setStockTracking(e.target.checked)} />
            <label htmlFor="stock_tracking" className="text-sm font-medium text-gray-700">
              Theo dõi tồn kho
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== Tab: Mô tả ======
function DescriptionTab({ descriptionHtml, setDescriptionHtml }: DescriptionTabProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Nội dung mô tả (HTML)</label>
      <textarea className="mt-1 block w-full min-h-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-blue-500 focus:ring-blue-500" value={descriptionHtml} onChange={(e) => setDescriptionHtml(e.target.value)} placeholder="<p>Mô tả chi tiết sản phẩm, bảng thông số kỹ thuật...</p>" />
      <p className="text-xs text-gray-500">Bạn có thể dán HTML đã format từ editor (Tiptap) vào đây.</p>
    </div>
  );
}

// ====== Tab: Bundle (tạm placeholder) ======
function BundleTab({ productType, bundleItems, setBundleItems }: BundleTabProps) {
  if (productType !== "bundle") {
    return (
      <div className="text-sm text-gray-500">
        Loại sản phẩm hiện tại không phải <b>bundle</b>. Hãy chọn loại <b>bundle</b> trong tab &quot;Thông tin cơ bản&quot; nếu muốn cấu hình danh sách sản phẩm con.
      </div>
    );
  }

  const updateItem = (id: number, field: keyof BundleItem, value: string) => {
    setBundleItems(
      bundleItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "quantity" ? Number(value) || 1 : value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    const nextId = bundleItems.length > 0 ? Math.max(...bundleItems.map((i) => i.id)) + 1 : 1;
    setBundleItems([...bundleItems, { id: nextId, childProductId: "", quantity: 1 }]);
  };

  const removeItem = (id: number) => {
    setBundleItems(bundleItems.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Cấu hình các sản phẩm con thuộc bundle này. Backend hiện tại chưa lưu cấu trúc này trong Firestore, nhưng UI đã sẵn sàng để sau này nối với model <code>ProductItem</code>.
      </p>

      <div className="space-y-3">
        {bundleItems.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row md:items-end gap-2 rounded-md border border-gray-200 p-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700">ID sản phẩm con (childProductId)</label>
              <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500" value={item.childProductId} onChange={(e) => updateItem(item.id, "childProductId", e.target.value)} />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-gray-700">Số lượng</label>
              <input type="number" min={1} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} />
            </div>
            <button type="button" onClick={() => removeItem(item.id)} className="self-start md:self-auto inline-flex items-center rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50">
              Xóa
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={addItem} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
        + Thêm sản phẩm con
      </button>
    </div>
  );
}

// ====== Tab: Media ======
function MediaTab({ mainImageUrl, setMainImageUrl, gallery, setGallery }: MediaTabProps) {
  const handleGalleryChange = (value: string) => {
    const lines = value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    setGallery(lines);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Ảnh chính (main_image_url)</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={mainImageUrl} onChange={(e) => setMainImageUrl(e.target.value)} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Gallery URLs (mỗi dòng 1 URL)</label>
        <textarea className="mt-1 block w-full min-h-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={gallery.join("\n")} onChange={(e) => handleGalleryChange(e.target.value)} placeholder={"https://...\nhttps://...\nhttps://..."} />
        <p className="text-xs text-gray-500 mt-1">
          Backend sẽ lưu vào field <code>gallery_urls</code> (array string).
        </p>
      </div>
    </div>
  );
}

// ====== Tab: SEO ======
function SeoTab({ seoTitle, setSeoTitle, seoDescription, setSeoDescription, ogImage, setOgImage }: SeoTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">SEO title</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Tiêu đề hiển thị trên tab & search result" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">SEO description</label>
        <textarea className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Mô tả ngắn cho SEO (160 ký tự)..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">OG image (og_image)</label>
        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="URL ảnh chia sẻ social" />
      </div>
    </div>
  );
}

// ====== Tab: Docs ======
function DocsTab({ datasheetUrl, setDatasheetUrl, schematicUrl, setSchematicUrl, stepModelUrl, setStepModelUrl, stlFilesUrl, setStlFilesUrl, userManualUrl, setUserManualUrl, githubRepoUrl, setGithubRepoUrl }: DocsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Datasheet URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={datasheetUrl} onChange={(e) => setDatasheetUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Schematic URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={schematicUrl} onChange={(e) => setSchematicUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">STEP model URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={stepModelUrl} onChange={(e) => setStepModelUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">STL files URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={stlFilesUrl} onChange={(e) => setStlFilesUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User manual URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={userManualUrl} onChange={(e) => setUserManualUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">GitHub repo URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" value={githubRepoUrl} onChange={(e) => setGithubRepoUrl(e.target.value)} placeholder="https://github.com/..." />
        </div>
      </div>
    </div>
  );
}

// ====== Trang tạo sản phẩm mới ======
export default function NewProductPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  // --- BASIC INFO ---
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [productType, setProductType] = useState<ProductType>("simple");
  const [status, setStatus] = useState<ProductStatus>("draft");
  const [tags, setTags] = useState("");

  // --- PRICING / STOCK ---
  const [basePrice, setBasePrice] = useState<string>("");
  const [currency, setCurrency] = useState("VND");
  const [sku, setSku] = useState("");
  const [stockTracking, setStockTracking] = useState<boolean>(true);
  const [stockQty, setStockQty] = useState<string>("");
  const [minOrderQty, setMinOrderQty] = useState<string>("1");

  // --- DESCRIPTION ---
  const [descriptionHtml, setDescriptionHtml] = useState("");

  // --- BUNDLE (UI trước, chưa lưu backend) ---
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);

  // --- MEDIA ---
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);

  // --- SEO ---
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");

  // --- TECH DOCS ---
  const [datasheetUrl, setDatasheetUrl] = useState("");
  const [schematicUrl, setSchematicUrl] = useState("");
  const [stepModelUrl, setStepModelUrl] = useState("");
  const [stlFilesUrl, setStlFilesUrl] = useState("");
  const [userManualUrl, setUserManualUrl] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");

  // --- UI state ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tự generate slug khi sửa title (nếu slug đang trống)
  useEffect(() => {
    if (!title.trim()) return;
    if (!slug.trim()) {
      setSlug(slugify(title));
    }
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSlugGenerate = () => {
    if (!title.trim()) return;
    setSlug(slugify(title));
  };

  // Helper parse số (chấp nhận "." hoặc "," làm phân cách)
  const parseNumber = (value: string): number | null => {
    if (!value) return null;
    const cleaned = value.replace(/\./g, "").replace(",", ".");
    const num = Number(cleaned);
    if (Number.isNaN(num)) return null;
    return num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Vui lòng nhập tên sản phẩm");
      setActiveTab("basic");
      return;
    }

    const finalSlug = (slug || slugify(title)).trim();
    if (!finalSlug) {
      setErrorMessage("Slug không hợp lệ");
      setActiveTab("basic");
      return;
    }

    const priceNumber = parseNumber(basePrice);
    const stockNumber = parseNumber(stockQty);
    const minOrderNumber = parseNumber(minOrderQty);

    const payload: any = {
      title: title.trim(),
      slug: finalSlug,
      short_description: shortDescription.trim(),
      description_html: descriptionHtml.trim(),
      product_type: productType,
      status,
      base_price: priceNumber,
      currency,
      sku: sku.trim(),
      stock_tracking: stockTracking,
      stock_qty: stockNumber,
      min_order_qty: minOrderNumber,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),

      // Media
      main_image_url: mainImageUrl.trim(),
      gallery_urls: gallery,

      // SEO
      seo_title: seoTitle.trim(),
      seo_description: seoDescription.trim(),
      og_image: ogImage.trim(),

      // Tech docs
      datasheet_url: datasheetUrl.trim(),
      schematic_url: schematicUrl.trim(),
      step_model_url: stepModelUrl.trim(),
      stl_files_url: stlFilesUrl.trim(),
      user_manual_url: userManualUrl.trim(),
      github_repo_url: githubRepoUrl.trim(),
    };

    try {
      setIsSubmitting(true);
      const res = await fetch(getApiUrl("/products/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `Tạo sản phẩm thất bại (HTTP ${res.status})`;
        try {
          const data = await res.json();
          if (data && typeof data.error === "string") {
            msg = data.error;
          }
        } catch {
          // ignore
        }
        setErrorMessage(msg);
        return;
      }

      // OK -> chuyển về trang listing DIY maker
      router.push("/diy-maker");
    } catch (err: any) {
      setErrorMessage(err?.message || "Có lỗi kết nối server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Tạo sản phẩm mới</h1>
            <p className="mt-1 text-sm text-gray-500">Nhập đầy đủ thông tin sản phẩm. Tất cả field sẽ được lưu vào Firestore qua API /products/.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: form chi tiết */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
                <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

                {activeTab === "basic" && <BasicInfoTab title={title} setTitle={setTitle} slug={slug} setSlug={setSlug} onSlugGenerate={handleSlugGenerate} shortDescription={shortDescription} setShortDescription={setShortDescription} productType={productType} setProductType={setProductType} status={status} setStatus={setStatus} tags={tags} setTags={setTags} basePrice={basePrice} setBasePrice={setBasePrice} currency={currency} setCurrency={setCurrency} sku={sku} setSku={setSku} stockTracking={stockTracking} setStockTracking={setStockTracking} stockQty={stockQty} setStockQty={setStockQty} minOrderQty={minOrderQty} setMinOrderQty={setMinOrderQty} />}

                {activeTab === "description" && <DescriptionTab descriptionHtml={descriptionHtml} setDescriptionHtml={setDescriptionHtml} />}

                {activeTab === "bundle" && <BundleTab productType={productType} bundleItems={bundleItems} setBundleItems={setBundleItems} />}

                {activeTab === "media" && <MediaTab mainImageUrl={mainImageUrl} setMainImageUrl={setMainImageUrl} gallery={gallery} setGallery={setGallery} />}

                {activeTab === "seo" && <SeoTab seoTitle={seoTitle} setSeoTitle={setSeoTitle} seoDescription={seoDescription} setSeoDescription={setSeoDescription} ogImage={ogImage} setOgImage={setOgImage} />}

                {activeTab === "docs" && <DocsTab datasheetUrl={datasheetUrl} setDatasheetUrl={setDatasheetUrl} schematicUrl={schematicUrl} setSchematicUrl={setSchematicUrl} stepModelUrl={stepModelUrl} setStepModelUrl={setStepModelUrl} stlFilesUrl={stlFilesUrl} setStlFilesUrl={setStlFilesUrl} userManualUrl={userManualUrl} setUserManualUrl={setUserManualUrl} githubRepoUrl={githubRepoUrl} setGithubRepoUrl={setGithubRepoUrl} />}
              </div>
            </div>

            {/* Cột phải: summary & nút lưu */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-gray-800">Tóm tắt nhanh</h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">Tên:</span> {title || <span className="text-gray-400">Chưa nhập</span>}
                  </div>
                  <div>
                    <span className="font-medium">Slug:</span> {slug || <span className="text-gray-400">Sẽ tự sinh từ tên</span>}
                  </div>
                  <div>
                    <span className="font-medium">Trạng thái:</span> <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">{status}</span>
                  </div>
                  <div>
                    <span className="font-medium">Loại:</span> <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">{productType}</span>
                  </div>
                  <div>
                    <span className="font-medium">Giá:</span>{" "}
                    {basePrice ? (
                      <>
                        {basePrice} {currency}
                      </>
                    ) : (
                      <span className="text-gray-400">Chưa nhập</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Tồn kho:</span> {stockQty || <span className="text-gray-400">Chưa đặt</span>}
                  </div>
                  <div>
                    <span className="font-medium">Tags:</span> {tags || <span className="text-gray-400">Chưa có tag</span>}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                {errorMessage && <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{errorMessage}</div>}

                <div className="flex gap-2">
                  <button type="submit" disabled={isSubmitting} className="inline-flex flex-1 justify-center items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
                  </button>
                  <button type="button" onClick={() => router.push("/diy-maker")} className="inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    Hủy
                  </button>
                </div>

                <p className="text-xs text-gray-500">Sau khi lưu thành công, bạn sẽ được chuyển về trang danh sách sản phẩm DIY.</p>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
