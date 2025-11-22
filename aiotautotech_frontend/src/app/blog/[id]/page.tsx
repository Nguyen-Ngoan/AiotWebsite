// src/app/blog/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getApiUrl } from "@/lib/apiConfig";

interface Post {
  id: string;
  title: string;
  content: string; // HTML từ Tiptap
  author: string;
  created_at: string;
}

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") {
      setError("Thiếu ID bài viết hoặc ID không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const url = getApiUrl(`/posts/${id}/`);
        console.log(`Fetching post detail from: ${url}`);

        const response = await fetch(url);
        if (response.status === 404) {
          setError("Không tìm thấy bài viết.");
          return;
        }
        if (!response.ok) {
          throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
        }

        const data: Post = await response.json();
        setPost(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Không thể tải bài viết: ${err.message}.`);
        } else {
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm("Bạn có chắc chắn muốn xoá bài viết này?");
    if (!ok) return;

    setDeleting(true);
    try {
      const url = getApiUrl(`/posts/${id}/`);
      const res = await fetch(url, { method: "DELETE" });

      if (res.status !== 204 && !res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${text}`);
      }

      // Sau khi xoá, quay về trang chủ / blog
      router.push("/#blog");
    } catch (err) {
      setDeleting(false);
      if (err instanceof Error) {
        alert(`Không thể xoá bài viết: ${err.message}`);
      } else {
        alert("Đã xảy ra lỗi không xác định khi xoá bài.");
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-apple-gray text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800">Đang tải nội dung bài viết...</h1>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center p-4">
        <h1 className="text-2xl font-bold text-red-700 mb-3">KHÔNG ĐỌC ĐƯỢC BÀI VIẾT</h1>
        <p className="text-red-600 mb-4 max-w-lg">{error || "Không có dữ liệu."}</p>
        <Link href="/#blog" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
          ← Quay lại danh sách bài viết
        </Link>
      </main>
    );
  }

  const createdDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-apple-gray dark:bg-apple-gray-dark dark:text-apple-text-dark">
      <Header />

      <main className="pt-20">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <Link href="/#blog" className="mb-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500">
            ← Quay lại blog
          </Link>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Bài viết</p>
          <h1 className="mb-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">{post.title}</h1>

          {/* Dòng meta: tác giả bên trái, nút Sửa/Xoá bên phải */}
          <div className="mb-6 flex items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {createdDate && <>Ngày đăng: {createdDate} • </>}
              Tác giả: <span className="font-medium text-gray-700 dark:text-gray-200">{post.author || "Ẩn danh"}</span>
            </span>

            <div className="flex items-center gap-2">
              <Link href={`/admin/posts/${post.id}/edit`} className="inline-flex items-center rounded-lg border border-gray-400 px-2.5 py-1 font-semibold text-[11px] uppercase tracking-wide text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-800">
                Sửa bài viết
              </Link>

              <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex items-center rounded-lg border border-red-500 px-2.5 py-1 font-semibold text-[11px] uppercase tracking-wide text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40">
                {deleting ? "Đang xoá..." : "Xoá bài viết"}
              </button>
            </div>
          </div>

          {/* Nội dung HTML từ Tiptap */}
          <div
            className="
              prose max-w-none prose-sm sm:prose-base
              text-gray-800 dark:prose-invert dark:text-gray-100
              [&_p]:my-2
              [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2.5 [&_h3]:mb-2
              [&_strong]:font-semibold
              [&_em]:italic
              [&_ul]:list-disc [&_ul]:pl-5
              [&_ol]:list-decimal [&_ol]:pl-5
              [&_li]:my-1
              [&_img]:my-4 [&_img]:mx-auto [&_img]:max-w-full
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <Footer />
      </main>
    </div>
  );
}
