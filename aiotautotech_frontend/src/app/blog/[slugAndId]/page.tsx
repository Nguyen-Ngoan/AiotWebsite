// src/app/blog/[slugAndId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getApiUrl } from '@/lib/apiConfig';
import { navItems } from '@/components/layout/nav-items';
import { BlogBreadcrumb } from '@/components/blog/BlogBreadcrumb';
import { useMainHeaderOffset } from '@/hooks/useMainHeaderOffset';
import 'highlight.js/styles/vs2015.css';

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
  const { headerRef, paddingTop } = useMainHeaderOffset(24);

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

  // KaTeX & Highlight.js auto-render: dynamic import
  useEffect(() => {
    if (!post || !contentRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        // 1. Load KaTeX
        const katexModule = await import('katex/contrib/auto-render');
        const renderMathInElement =
          // một số phiên bản export default
          (katexModule as any).default ??
          // một số phiên bản export named
          (katexModule as any).renderMathInElement;

        // 2. Load Highlight.js
        const hljsModule = await import('highlight.js');
        const hljs = hljsModule.default;

        if (cancelled) return;

        if (typeof renderMathInElement !== 'function') {
          console.error(
            'KaTeX auto-render function not found in module:',
            katexModule
          );
          return;
        }

        if (contentRef.current) {
          // Render Math
          renderMathInElement(contentRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false },
              { left: '$', right: '$', display: false },
            ],
            throwOnError: false,
          });

          // Highlight Code & Add Copy Button
          contentRef.current.querySelectorAll('pre').forEach((preBlock) => {
            // 1. Highlight code
            const codeBlock = preBlock.querySelector('code');
            if (codeBlock) {
              hljs.highlightElement(codeBlock as HTMLElement);
            }

            // 2. Add Copy Button (Wrapper pattern)
            if (preBlock.parentElement?.classList.contains('code-wrapper'))
              return;

            const wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper relative group my-4';

            preBlock.parentNode?.insertBefore(wrapper, preBlock);
            wrapper.appendChild(preBlock);
            (preBlock as HTMLElement).style.margin = '0'; // Reset margin handled by wrapper

            const btn = document.createElement('button');
            btn.className =
              'absolute top-2 right-2 p-1.5 rounded bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100';
            btn.setAttribute('aria-label', 'Copy code');
            btn.innerHTML = `
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            `;

            btn.addEventListener('click', () => {
              const text = codeBlock
                ? (codeBlock as HTMLElement).innerText
                : (preBlock as HTMLElement).innerText;
              navigator.clipboard.writeText(text).then(() => {
                btn.innerHTML = `
                  <svg class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                `;
                setTimeout(() => {
                  btn.innerHTML = `
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  `;
                }, 2000);
              });
            });

            wrapper.appendChild(btn);
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            'Error loading external libs (KaTeX/Highlight.js):',
            err
          );
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
        <Header ref={headerRef} navItems={navItems} />
        <main
          className="flex flex-1 items-center justify-center px-4"
          style={{ paddingTop }}
        >
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
        <Header ref={headerRef} navItems={navItems} />
        <main
          className="flex flex-1 items-center justify-center px-4"
          style={{ paddingTop }}
        >
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
      <Header ref={headerRef} navItems={navItems} />

      <main
        className="flex-1 px-6 pb-8 sm:px-8"
        style={{ paddingTop }}
      >
        {/* <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-black to-black" /> */}

        <article className="mx-auto w-full max-w-3xl">
          <BlogBreadcrumb
            tone="dark"
            page="detail"
            className="mb-4"
          />

          {/* title */}
          <h1 className="mb-3 text-xl sm:text-2xl font-semibold text-gray-50 leading-tight">
            {post.title}
          </h1>

          {/* meta */}
          <div className="mb-8 flex min-w-0 flex-row flex-nowrap items-center justify-between gap-x-2 overflow-x-auto text-xs text-gray-500 sm:gap-x-4">
            <p className="min-w-0 flex-1 pr-1 sm:pr-2">
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
            <span className="inline-flex shrink-0 flex-nowrap items-center gap-x-3 sm:gap-x-5 md:gap-x-6">
              <Link
                href={`/admin/posts/${post.id}/edit-info`}
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Edit Info
              </Link>
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline border-0 bg-transparent p-0 font-semibold text-red-400 hover:text-red-300 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </span>
          </div>

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

              /* CODE BLOCK */
              [&_pre]:bg-[#1e1e1e] [&_pre]:text-gray-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
              [&_code]:font-mono [&_code]:text-sm
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
            `}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-8 border-t border-gray-800 pt-4 text-xs text-gray-500">
            <p className="mb-0">
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
