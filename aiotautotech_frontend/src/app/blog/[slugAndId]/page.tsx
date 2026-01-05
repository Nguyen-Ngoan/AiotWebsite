// src/app/blog/[slugAndId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';
import { navItems } from '@/components/layout/nav-items';

interface Post {
  id: string;
  title: string;
  content: string; // HTML từ editor (có thể chứa TeX trong $...$)
  author: string;
  created_at: string;
  updated_at?: string;
}

export default function BlogDetailPage() {
  const params = useParams<{ slugAndId: string }>();
  const slugAndId = params?.slugAndId;
  const id =
    slugAndId && typeof slugAndId === 'string'
      ? slugAndId.split('-').pop()
      : undefined;

  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ref vùng nội dung để KaTeX xử lý
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Tải bài viết
  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Thiếu ID bài viết hoặc ID không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const url = getApiUrl(`/posts/${id}/`);
        console.log(`Fetching post detail from: ${url}`);

        const response = await fetch(url);
        if (response.status === 404) {
          setError('Không tìm thấy bài viết.');
          return;
        }
        if (!response.ok) {
          throw new Error(
            `Lỗi HTTP: ${response.status} - ${response.statusText}`
          );
        }

        const data: Post = await response.json();
        setPost(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Không thể tải bài viết: ${err.message}.`);
        } else {
          setError('Đã xảy ra lỗi không xác định.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // KaTeX auto-render: dynamic import để tránh lỗi module
  useEffect(() => {
    if (!post || !contentRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        // dynamic import để tương thích ESM/CJS
        const katexModule = await import('katex/contrib/auto-render');
        const renderMathInElement =
          // một số phiên bản export default
          (katexModule as any).default ??
          // một số phiên bản export named
          (katexModule as any).renderMathInElement;

        if (cancelled) return;

        if (typeof renderMathInElement !== 'function') {
          console.error(
            'KaTeX auto-render function not found in module:',
            katexModule
          );
          return;
        }

        if (contentRef.current) {
          renderMathInElement(contentRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false },
              { left: '$', right: '$', display: false },
            ],
            throwOnError: false,
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading KaTeX auto-render:', err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [post]);

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('Bạn có chắc chắn muốn xoá bài viết này?');
    if (!ok) return;

    setDeleting(true);
    try {
      const url = getApiUrl(`/posts/${id}/`);
      const res = await fetch(url, { method: 'DELETE' });

      if (res.status !== 204 && !res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${text}`);
      }

      router.push('/#blog');
    } catch (err) {
      setDeleting(false);
      if (err instanceof Error) {
        alert(`Không thể xoá bài viết: ${err.message}`);
      } else {
        alert('Đã xảy ra lỗi không xác định khi xoá bài.');
      }
    }
  };

  const createdDate = post?.created_at
    ? new Date(post.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  // --- LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-gray-100">
        <Header navItems={navItems} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">
              Blog
            </p>
            <h1 className="text-2xl font-semibold text-gray-100 mb-2">
              Đang tải nội dung bài viết...
            </h1>
            <p className="text-sm text-gray-500">
              Vui lòng chờ trong giây lát.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- ERROR ---
  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-gray-100">
        <Header navItems={navItems} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-red-500 mb-2">
              Blog
            </p>
            <h1 className="text-2xl font-semibold text-red-400 mb-3">
              KHÔNG ĐỌC ĐƯỢC BÀI VIẾT
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              {error || 'Không có dữ liệu hoặc ID không hợp lệ.'}
            </p>
            <Link
              href="/#blog"
              className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              ← Quay lại danh sách bài viết
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100">
      <Header navItems={navItems} />

      <main className="flex-1 pt-16 pb-16 px-6 sm:px-8">
        {/* <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-black to-black" /> */}

        <article className="mx-auto w-full max-w-3xl">
          {/* breadcrumb + actions */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              ← Blog • AIOT AUTOTECH
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="inline-flex items-center rounded-full border border-gray-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-200 hover:bg-gray-900/80"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center rounded-full border border-red-500/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-400 hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Đang xoá...' : 'Xoá'}
              </button>
            </div>
          </div>

          {/* title */}
          <h1 className="mb-3 text-xl sm:text-2xl font-semibold text-gray-50 leading-tight">
            {post.title}
          </h1>

          {/* meta */}
          <p className="mb-8 text-xs text-gray-500">
            {createdDate && (
              <>
                {createdDate}
                {' • '}
              </>
            )}
            Tác giả:{' '}
            <span className="font-medium text-gray-200">
              {post.author || 'Ẩn danh'}
            </span>
          </p>

          {/* nội dung (KaTeX sẽ xử lý $...$ trong đây) */}
          <div
            ref={contentRef}
            className={`
              mt-8
              prose prose-invert max-w-none
              text-[16px] sm:text-[17px] leading-relaxed
              text-gray-100
              not-italic
              [&_p]:not-italic
              [&_li]:not-italic

              [&_p]:my-2
              [&_p:first-of-type]:mt-0

              [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-6 [&_h1]:mb-3
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-[#80a2ff]
              [&_h3]:text-md [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-[#8046f3]
              [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2

              [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5
              [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5
              [&_li]:my-1

              [&_a]:text-blue-400 [&_a]:underline-offset-2 [&_a]:hover:text-blue-300 [&_a]:hover:underline

              [&_strong]:font-semibold
              [&_em]:italic

              [&_figure]:my-8 [&_figure]:mx-auto [&_figure]:max-w-full
              [&_figure_img]:rounded-xl [&_figure_img]:shadow-lg
              [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-md

              [&_figcaption]:mt-3 [&_figcaption]:text-[11px] [&_figcaption]:leading-snug [&_figcaption]:text-gray-400

              [&_blockquote]:my-6 [&_blockquote]:border-l [&_blockquote]:border-gray-700
              [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-200
              [&_blockquote_p]:my-0

              [&_hr]:my-10 [&_hr]:border-gray-800

              [&_p.aiot-cite]:mt-1
              [&_p.aiot-cite]:text-xs sm:[&_p.aiot-cite]:text-[13px]
              [&_p.aiot-cite]:text-gray-400
              [&_p.aiot-cite]:not-italic

              /* TABLE */
              [&_table]:w-full
              [&_table]:border-collapse
              [&_table]:text-[14px]
              [&_table]:my-6
              [&_th]:border [&_th]:border-gray-700 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-[#111827] [&_th]:font-semibold
              [&_td]:border [&_td]:border-gray-700 [&_td]:px-3 [&_td]:py-2
              [&_tr:nth-child(even)]:bg-[#020617]
              [&_tr:nth-child(odd)]:bg-black
              [&_thead]:bg-[#111827]
              /* Đảm bảo bảng có thể cuộn ngang mà không làm vỡ layout */
              [&_table]:block
              [&_table]:max-w-full
              [&_table]:overflow-x-auto              
            `}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-10 border-t border-gray-800 pt-6 text-xs text-gray-500">
            <p>
              Bài viết này thuộc blog của AIOT AUTOTECH, chia sẻ kinh nghiệm về
              ESP32, stepper, tự động hoá và AI ứng dụng trong sản xuất nhỏ.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
