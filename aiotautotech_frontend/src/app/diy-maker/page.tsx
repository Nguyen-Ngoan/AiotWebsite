// src/app/diy-maker/page.tsx

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getApiUrl } from "@/lib/apiConfig";

interface Product {
  id: string;
  title: string;
  slug?: string;
  short_description?: string;
  description_html?: string;
  product_type?: string;
  status?: "draft" | "active" | "archived" | string;
  base_price?: number | null;
  currency?: string;
  sku?: string;
  stock_tracking?: boolean;
  stock_qty?: number;
  min_order_qty?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;

  // Media
  main_image_url?: string;
  gallery_urls?: string[];
}

async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(getApiUrl("/products/"), {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch products", res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    console.log("Fetched products count:", data.length);
    return data;
  } catch (err) {
    console.error("Error fetching products", err);
    return [];
  }
}

function formatPrice(price?: number | null, currency?: string) {
  if (price == null) return "Liên hệ";
  const cur = currency || "VND";

  try {
    if (cur === "VND") {
      return price.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      });
    }

    return price.toLocaleString("en-US", {
      style: "currency",
      currency: cur,
    });
  } catch {
    return `${price} ${cur}`;
  }
}

function formatStatus(status?: string) {
  switch (status) {
    case "active":
      return "Đang bán";
    case "draft":
      return "Nháp";
    case "archived":
      return "Ngừng bán";
    default:
      return status || "Không rõ";
  }
}

// sắp xếp: active → draft → archived → còn lại, rồi theo updated_at
function sortProducts(products: Product[]): Product[] {
  const order: Record<string, number> = {
    active: 0,
    draft: 1,
    archived: 2,
  };

  return [...products].sort((a, b) => {
    const aKey = (a.status || "").toString().toLowerCase();
    const bKey = (b.status || "").toString().toLowerCase();
    const aOrder = order[aKey] ?? 3;
    const bOrder = order[bKey] ?? 3;

    if (aOrder !== bOrder) return aOrder - bOrder;

    const aTime = a.updated_at ? Date.parse(a.updated_at) : 0;
    const bTime = b.updated_at ? Date.parse(b.updated_at) : 0;
    return bTime - aTime;
  });
}

export default async function DiyMakerPage() {
  const products = await fetchProducts();
  const sortedProducts = sortProducts(products);
  const hasProducts = sortedProducts.length > 0;

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">DIY &amp; Maker</p>
            <h1 className="text-2xl font-semibold leading-tight text-gray-100 sm:text-3xl">Sản phẩm DIY &amp; linh kiện tự động hoá</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">Danh sách các sản phẩm, module và bộ kit dùng cho dự án IoT, trục tuyến tính, step motor và các hệ thống tự động hoá nhỏ.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="rounded-full border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-900">
              ← Về trang chủ
            </Link>
            <Link href="/admin/products/new" className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-500">
              + Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* Không có sản phẩm */}
        {!hasProducts && (
          <div className="rounded-2xl border border-dashed border-gray-800 bg-[#050608] px-6 py-10 text-center text-sm text-gray-400">
            Chưa có sản phẩm nào được tạo.
            <br />
            Hãy bấm <span className="font-semibold text-gray-200">“+ Thêm sản phẩm”</span> ở góc phải để tạo sản phẩm đầu tiên.
          </div>
        )}

        {/* Grid sản phẩm */}
        {hasProducts && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => {
              const priceLabel = formatPrice(product.base_price, product.currency);
              const statusLabel = formatStatus(product.status);
              const typeLabel = product.product_type === "bundle" ? "Bundle / Kit" : product.product_type === "service" ? "Service" : "Simple";

              // Ảnh chính: ưu tiên main_image_url, sau đó gallery_urls[0]
              const mainImage = product.main_image_url && product.main_image_url.trim().length > 0 ? product.main_image_url : product.gallery_urls && product.gallery_urls.length > 0 ? product.gallery_urls[0] : undefined;

              const slugPart = product.slug && product.slug.trim().length > 0 ? product.slug : "san-pham";

              const detailHref = `/diy-maker/${product.id}-${slugPart}`;

              return (
                <div key={product.id} className="flex flex-col rounded-2xl border border-gray-800 bg-[#050608] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                  {/* Vùng clickable dẫn tới trang chi tiết */}
                  <Link href={detailHref} className="flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-xl">
                    {/* Ảnh sản phẩm */}
                    {mainImage && (
                      <div className="mb-3 overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mainImage} alt={product.title || "Ảnh sản phẩm"} className="h-40 w-full object-contain" />
                      </div>
                    )}

                    {/* Header card */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h2 className="line-clamp-2 text-sm font-semibold text-gray-100 sm:text-base">{product.title || "Sản phẩm chưa đặt tên"}</h2>
                        {product.sku && <p className="mt-1 text-[11px] text-gray-500">SKU: {product.sku}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={["inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", product.status === "active" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40" : product.status === "draft" ? "bg-amber-500/10 text-amber-300 border border-amber-500/40" : product.status === "archived" ? "bg-gray-700/40 text-gray-300 border border-gray-600/60" : "bg-gray-800/40 text-gray-300 border border-gray-700/60"].join(" ")}>{statusLabel}</span>
                        <span className="inline-flex rounded-full border border-gray-700 px-2 py-0.5 text-[10px] text-gray-300">{typeLabel}</span>
                      </div>
                    </div>

                    {/* Mô tả ngắn */}
                    {product.short_description && <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-gray-300">{product.short_description}</p>}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {product.tags.map((tag) => (
                          <span key={tag} className="inline-flex rounded-full bg-gray-900 px-2 py-0.5 text-[10px] text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price + stock */}
                    <div className="mt-auto border-t border-gray-800 pt-3 text-xs text-gray-300">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-gray-400">Giá bán</span>
                        <span className="font-semibold text-blue-400">{priceLabel}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        {product.stock_tracking ? (
                          <span>
                            Tồn kho: <span className="text-gray-200">{product.stock_qty ?? 0}</span>
                          </span>
                        ) : (
                          <span>Không theo dõi tồn kho</span>
                        )}

                        {product.min_order_qty && product.min_order_qty > 1 && <span>Min: {product.min_order_qty} / đơn</span>}
                      </div>
                    </div>
                  </Link>

                  {/* Footer: ID + nút Edit (không nằm trong Link chi tiết) */}
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">
                      ID: <span className="text-gray-300">{product.id}</span>
                    </span>
                    <Link href={`/admin/products/${product.id}/edit`} className="rounded-full border border-gray-700 px-3 py-1 text-[11px] font-medium text-gray-100 hover:bg-gray-900">
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
