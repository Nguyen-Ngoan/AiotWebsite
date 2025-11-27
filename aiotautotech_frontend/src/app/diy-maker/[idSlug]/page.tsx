// src/app/diy-maker/[idSlug]/page.tsx

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
  stock_qty?: number | null;
  min_order_qty?: number | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;

  // Media
  main_image_url?: string;
  gallery_urls?: string[];

  // SEO
  seo_title?: string;
  seo_description?: string;
  og_image?: string;

  // Tech docs
  datasheet_url?: string;
  schematic_url?: string;
  step_model_url?: string;
  stl_files_url?: string;
  user_manual_url?: string;
  github_repo_url?: string;
}

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(getApiUrl(`/products/${id}/`), {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch product detail", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    if (!data || !data.id) return null;
    return data as Product;
  } catch (err) {
    console.error("Error fetching product detail", err);
    return null;
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

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const ts = Date.parse(dateStr);
  if (Number.isNaN(ts)) return dateStr;
  const d = new Date(ts);
  return d.toLocaleString("vi-VN");
}

// LƯU Ý: với Next 15, params là Promise => phải await props.params
export default async function ProductDetailPage(props: { params: Promise<{ idSlug: string }> }) {
  const { idSlug } = await props.params; // unwrap Promise
  const raw = idSlug; // dạng "ID-slug-san-pham"

  if (!raw) {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-100">Không tìm thấy sản phẩm</h1>
            <Link href="/diy-maker" className="rounded-full border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-900">
              ← Về danh sách sản phẩm
            </Link>
          </div>
          <p className="text-sm text-gray-400">Tham số URL không hợp lệ.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Lấy ID trước dấu '-'
  const id = raw.split("-")[0];

  const product = await fetchProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-100">Không tìm thấy sản phẩm</h1>
            <Link href="/diy-maker" className="rounded-full border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-900">
              ← Về danh sách sản phẩm
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            Sản phẩm với ID <code>{id}</code> không tồn tại hoặc đã bị xoá.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const { id: productId, title, short_description, description_html, base_price, currency, sku, product_type, status, stock_tracking, stock_qty, min_order_qty, tags, main_image_url, gallery_urls, seo_title, seo_description, og_image, datasheet_url, schematic_url, step_model_url, stl_files_url, user_manual_url, github_repo_url, created_at, updated_at, slug } = product;

  const priceLabel = formatPrice(base_price, currency);
  const statusLabel = formatStatus(status);

  const mainImage = main_image_url && main_image_url.trim().length > 0 ? main_image_url : gallery_urls && gallery_urls.length > 0 ? gallery_urls[0] : undefined;

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        {/* Breadcrumbs + actions */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <nav className="text-xs text-gray-500">
              <Link href="/" className="hover:text-gray-300">
                Trang chủ
              </Link>
              <span className="mx-1">/</span>
              <Link href="/diy-maker" className="hover:text-gray-300">
                DIY &amp; Maker
              </Link>
              <span className="mx-1">/</span>
              <span className="text-gray-300">Chi tiết sản phẩm</span>
            </nav>
            <h1 className="text-2xl font-semibold leading-tight text-gray-100 sm:text-3xl">{title || "Sản phẩm chưa đặt tên"}</h1>
            {short_description && <p className="max-w-2xl text-sm text-gray-400">{short_description}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/diy-maker" className="rounded-full border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-900">
              ← Về danh sách
            </Link>
            <Link href={`/admin/products/${productId}/edit`} className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-500">
              ✏️ Sửa trong Admin
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* ===== KHỐI TRÁI: THÔNG TIN CHO KHÁCH HÀNG ===== */}
          <section className="space-y-4">
            {/* Ảnh + giá + info tổng quan */}
            <div className="rounded-2xl border border-gray-800 bg-[#050608] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                {/* Ảnh chính */}
                <div>
                  {mainImage ? (
                    <div className="overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mainImage} alt={title || "Ảnh sản phẩm"} className="h-64 w-full object-contain sm:h-72" />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-700 bg-black/40 text-xs text-gray-500 sm:h-72">Chưa có ảnh sản phẩm</div>
                  )}

                  {/* Gallery nhỏ */}
                  {gallery_urls && gallery_urls.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {gallery_urls.slice(0, 5).map((url, idx) => (
                        <div key={url + idx} className="h-14 w-20 overflow-hidden rounded-md border border-gray-800 bg-black/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Ảnh phụ ${idx + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {gallery_urls.length > 5 && <span className="flex h-14 items-center rounded-md border border-gray-800 bg-gray-900 px-3 text-[11px] text-gray-400">+ {gallery_urls.length - 5} ảnh nữa</span>}
                    </div>
                  )}
                </div>

                {/* Thông tin mua hàng */}
                <div className="flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Thông tin chính</p>
                    <p className="text-2xl font-semibold text-blue-400">{priceLabel}</p>

                    {product_type && (
                      <p className="text-xs text-gray-400">
                        Loại sản phẩm: <span className="font-medium text-gray-200">{product_type === "bundle" ? "Bundle / Kit" : product_type === "service" ? "Dịch vụ" : "Simple"}</span>
                      </p>
                    )}

                    <p className="text-xs text-gray-400">
                      Trạng thái: <span className={["inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", status === "active" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40" : status === "draft" ? "bg-amber-500/10 text-amber-300 border border-amber-500/40" : status === "archived" ? "bg-gray-700/40 text-gray-300 border border-gray-600/60" : "bg-gray-800/40 text-gray-300 border border-gray-700/60"].join(" ")}>{statusLabel}</span>
                    </p>

                    {stock_tracking ? (
                      <p className="text-xs text-gray-400">
                        Tồn kho: <span className="font-medium text-gray-100">{stock_qty ?? 0}</span>
                        {min_order_qty && min_order_qty > 1 && <span className="text-gray-500"> &nbsp;|&nbsp; Min: {min_order_qty} / đơn</span>}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Không theo dõi tồn kho.</p>
                    )}

                    {tags && tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span key={tag} className="inline-flex rounded-full bg-gray-900 px-2 py-0.5 text-[10px] text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-gray-400">
                    <button type="button" className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500">
                      Liên hệ đặt hàng
                    </button>
                    <p className="text-[11px] text-gray-500">Liên hệ trực tiếp qua Zalo / Email để được tư vấn cấu hình &amp; báo giá chi tiết cho từng dự án.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NHÓM: Mô tả chi tiết (collapsible) */}
            <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4" open>
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">
                Mô tả chi tiết
                <span className="ml-2 text-xs font-normal text-gray-500">(click để thu gọn / mở rộng)</span>
              </summary>
              <div className="mt-3 border-t border-gray-800 pt-3 text-sm text-gray-200">{description_html ? <div className="prose prose-invert max-w-none prose-sm prose-headings:text-gray-100 prose-strong:text-gray-100 prose-a:text-blue-400" dangerouslySetInnerHTML={{ __html: description_html }} /> : <p className="text-gray-400">Chưa có mô tả HTML cho sản phẩm này.</p>}</div>
            </details>

            {/* NHÓM: Tài liệu kỹ thuật (collapsible) */}
            <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">
                Tài liệu kỹ thuật cho DIY / Maker
                <span className="ml-2 text-xs font-normal text-gray-500">(datasheet, schematic, model 3D…)</span>
              </summary>
              <div className="mt-3 border-t border-gray-800 pt-3 text-sm text-gray-200 space-y-2">
                {!datasheet_url && !schematic_url && !step_model_url && !stl_files_url && !user_manual_url && !github_repo_url && <p className="text-gray-400">Chưa đính kèm tài liệu kỹ thuật cho sản phẩm này.</p>}

                <ul className="space-y-1 text-sm">
                  {datasheet_url && (
                    <li>
                      <span className="text-gray-400">Datasheet:&nbsp;</span>
                      <a href={datasheet_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                        Mở datasheet
                      </a>
                    </li>
                  )}
                  {schematic_url && (
                    <li>
                      <span className="text-gray-400">Schematic (mạch nguyên lý):&nbsp;</span>
                      <a href={schematic_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                        Xem schematic
                      </a>
                    </li>
                  )}
                  {step_model_url && (
                    <li>
                      <span className="text-gray-400">Model 3D STEP:&nbsp;</span>
                      <a href={step_model_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                        Tải file STEP
                      </a>
                    </li>
                  )}
                  {stl_files_url && (
                    <li>
                      <span className="text-gray-400">File STL in 3D:&nbsp;</span>
                      <a href={stl_files_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                        Tải file STL
                      </a>
                    </li>
                  )}
                  {user_manual_url && (
                    <li>
                      <span className="text-gray-400">Hướng dẫn sử dụng:&nbsp;</span>
                      <a href={user_manual_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                        Xem tài liệu
                      </a>
                    </li>
                  )}
                  {github_repo_url && (
                    <li>
                      <span className="text-gray-400">Source code / ví dụ:&nbsp;</span>
                      <a href={github_repo_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                        Mở GitHub repo
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </details>
          </section>

          {/* ===== KHỐI PHẢI: THÔNG TIN ADMIN ===== */}
          <aside className="space-y-4">
            {/* Group 1: Thông tin nội bộ cơ bản */}
            <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4 text-xs text-gray-300" open>
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">Thông tin nội bộ (Admin)</summary>
              <div className="mt-3 border-t border-gray-800 pt-3 space-y-1">
                <p>
                  <span className="text-gray-500">ID Firestore: </span>
                  <span className="font-mono text-[11px] text-gray-200">{productId}</span>
                </p>
                {slug && (
                  <p>
                    <span className="text-gray-500">Slug: </span>
                    <span className="text-gray-200">{slug}</span>
                  </p>
                )}
                {sku && (
                  <p>
                    <span className="text-gray-500">SKU: </span>
                    <span className="text-gray-200">{sku}</span>
                  </p>
                )}
                {product_type && (
                  <p>
                    <span className="text-gray-500">Loại: </span>
                    <span className="text-gray-200">{product_type}</span>
                  </p>
                )}
                {status && (
                  <p>
                    <span className="text-gray-500">Status: </span>
                    <span className="text-gray-200">{status}</span>
                  </p>
                )}
              </div>
            </details>

            {/* Group 2: Giá, tồn kho & tracking */}
            <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4 text-xs text-gray-300">
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">Giá &amp; tồn kho (Admin)</summary>
              <div className="mt-3 border-t border-gray-800 pt-3 space-y-1">
                <p>
                  <span className="text-gray-500">Giá cơ bản: </span>
                  <span className="text-gray-200">{base_price != null ? `${base_price} ${currency || ""}`.trim() : "—"}</span>
                </p>
                <p>
                  <span className="text-gray-500">Currency: </span>
                  <span className="text-gray-200">{currency || "VND"}</span>
                </p>
                <p>
                  <span className="text-gray-500">Theo dõi tồn kho: </span>
                  <span className="text-gray-200">{stock_tracking ? "true" : "false"}</span>
                </p>
                <p>
                  <span className="text-gray-500">stock_qty: </span>
                  <span className="text-gray-200">{stock_qty != null ? stock_qty : "—"}</span>
                </p>
                <p>
                  <span className="text-gray-500">min_order_qty: </span>
                  <span className="text-gray-200">{min_order_qty != null ? min_order_qty : "—"}</span>
                </p>
              </div>
            </details>

            {/* Group 3: SEO & meta */}
            <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4 text-xs text-gray-300">
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">SEO &amp; Meta (Admin)</summary>
              <div className="mt-3 border-t border-gray-800 pt-3 space-y-1">
                <p>
                  <span className="text-gray-500">SEO title: </span>
                  <span className="text-gray-200">{seo_title || <span className="text-gray-500">—</span>}</span>
                </p>
                <p>
                  <span className="text-gray-500">SEO description: </span>
                  <span className="text-gray-200">{seo_description || <span className="text-gray-500">—</span>}</span>
                </p>
                <p>
                  <span className="text-gray-500">OG image: </span>
                  <span className="text-gray-200">{og_image || <span className="text-gray-500">—</span>}</span>
                </p>
                <p>
                  <span className="text-gray-500">Tags: </span>
                  <span className="text-gray-200">{tags && tags.length > 0 ? tags.join(", ") : "—"}</span>
                </p>
              </div>
            </details>

            {/* Group 4: Thời gian tạo / cập nhật */}
            <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4 text-xs text-gray-300">
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">Thời gian &amp; lịch sử</summary>
              <div className="mt-3 border-t border-gray-800 pt-3 space-y-1">
                <p>
                  <span className="text-gray-500">Created at: </span>
                  <span className="text-gray-200">{formatDate(created_at)}</span>
                </p>
                <p>
                  <span className="text-gray-500">Updated at: </span>
                  <span className="text-gray-200">{formatDate(updated_at)}</span>
                </p>
              </div>
            </details>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
