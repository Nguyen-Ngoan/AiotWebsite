// src/app/admin/posts/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostEditor from "@/components/admin/PostEditor";
import { getApiUrl } from "@/lib/apiConfig";

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("AiotAutotech");
  const [contentHtml, setContentHtml] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thêm symbol vào cuối nội dung HTML (state dùng để submit)
  const handleAddSymbol = (symbol: string) => {
    setContentHtml((prev) => {
      const base = prev || "";
      return base + symbol;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!contentHtml || contentHtml.trim() === "") {
      setError("Nội dung bài viết đang rỗng.");
      return;
    }

    setSubmitting(true);
    try {
      const url = getApiUrl(`/posts/`);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: contentHtml, // lưu HTML vào field 'content'
          author: author.trim() || "AiotAutotech",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${text}`);
      }

      const data = await res.json();
      console.log("Post created:", data);

      // Sau khi tạo xong, điều hướng về trang chủ hoặc blog
      router.push("/#blog");
    } catch (err) {
      if (err instanceof Error) {
        setError(`Không thể tạo bài viết: ${err.message}`);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray dark:bg-apple-gray-dark dark:text-apple-text-dark">
      <Header />

      <main className="pt-20 pb-16">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">Tạo bài viết mới</h1>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">Viết bài blog về ESP32, Stepper, IoT, trục tuyến tính… Nội dung sẽ được lưu trên Firestore và hiển thị ở phần Blog.</p>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tiêu đề */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Tiêu đề</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#111] dark:text-gray-100" placeholder="Ví dụ: Điều khiển Stepper bằng ESP32 – phần 1" />
            </div>

            {/* Tác giả */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Tác giả</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#111] dark:text-gray-100" />
              </div>
            </div>

            {/* Editor */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">Nội dung bài viết</label>

              {/* PostEditor hiện tại chỉ nhận onChange */}
              <PostEditor onChange={setContentHtml} />

              {/* Thanh symbol nhanh */}
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-[#141414] dark:text-gray-200">
                <div className="mb-1 font-medium">Symbol thường dùng (click để chèn vào nội dung gửi lên Firestore):</div>
                <div className="flex flex-wrap gap-2">
                  {["°C", "Ω", "µ", "µF", "kΩ", "MΩ", "±", "→", "←", "⇄", "²", "³", "≤", "≥"].map((sym) => (
                    <button key={sym} type="button" onClick={() => handleAddSymbol(sym)} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-[#111] dark:text-gray-100 dark:hover:bg-[#222]">
                      {sym}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">Dùng cho các ký hiệu điện – điện tử: nhiệt độ, điện trở, micro, sai số, mũ 2, mũ 3…</p>
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Bạn có thể dùng tiêu đề (H1–H3), danh sách, in đậm, in nghiêng và chèn ảnh (bằng URL). Sau này có thể nâng cấp thêm chức năng upload ảnh lên GCS.</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={submitting} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-60">
                {submitting ? "Đang lưu..." : "Lưu bài viết"}
              </button>

              <button type="button" onClick={() => router.push("/")} className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#222]">
                Hủy
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
