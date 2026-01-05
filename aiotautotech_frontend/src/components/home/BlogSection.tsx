// src/components/home/BlogSection.tsx

import Link from 'next/link';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import type { Post } from '@/app/page';

interface BlogSectionProps {
  posts: Post[];
}

// Chuyển HTML của Tiptap thành text thuần để làm excerpt
const getPlainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export default function BlogSection({ posts }: BlogSectionProps) {
  const hasPosts = Array.isArray(posts) && posts.length > 0;
  const dynamicPosts = hasPosts ? posts.slice(0, 3) : [];

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return String(iso);
    }
  };

  return (
    <section
      id="blog"
      className="w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black"
    >
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 lg:px-6">
        {/* Heading */}
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            Blog
          </p>
          <h2 className="mb-3 text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            KINH NGHIỆM LẬP TRÌNH
            <br />
            DIY - TỰ ĐỘNG HOÁ
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
            Tổng kết kinh nghiệm về ESP32, điều khiển động cơ bước. Thiết kế chế
            tạo chi tiết máy bằng cách in 3D Các dự án tự động hoá giá rẻ ứng
            dụng trong xưởng sản xuất nhỏ.
          </p>
        </div>

        {/* Nếu chưa có bài viết */}
        {!hasPosts && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-[#111111] dark:text-gray-300">
            Chưa có bài viết nào được xuất bản.
            <br />
            Hãy tạo bài mới trong trang admin để hiển thị tại đây.
          </div>
        )}

        {/* Grid bài viết */}
        {hasPosts && (
          <div className="grid gap-6 md:grid-cols-3">
            {dynamicPosts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.12)] dark:border-gray-800 dark:bg-[#111111]"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {formatDate(post.created_at)} • Tác giả:{' '}
                  {post.author || 'Ẩn danh'}
                </p>
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:text-[13px]">
                  {getPlainText(post.content ?? '')}
                </p>

                <div className="mt-auto">
                  <Link
                    href={`/blog/${post.slug ?? ''}-${post.id}`}
                    className="inline-flex items-center text-sm font-semibold text-[#0066CC] hover:underline dark:text-[#2997FF]"
                  >
                    <span>Đọc bài viết</span>
                    <ChevronRightIcon className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA tổng blog + nút thêm bài viết */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-[#0066CC] hover:bg-[#e5e5f0] dark:bg-[#111111] dark:text-[#2997FF] dark:hover:bg-[#1b1b1f]"
          >
            <span>Xem blog</span>
            <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
