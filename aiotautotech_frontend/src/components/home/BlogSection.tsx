// src/components/home/BlogSection.tsx

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import type { Post } from "@/app/page";

interface BlogSectionProps {
  posts: Post[];
}

// Chuyển HTML của Tiptap thành text thuần để làm excerpt
const getPlainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function BlogSection({ posts }: BlogSectionProps) {
  const hasPosts = posts && posts.length > 0;
  const dynamicPosts = hasPosts ? posts.slice(0, 3) : [];

  const formatDate = (iso: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <section id="blog" className="w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        {/* Heading */}
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Blog</p>
          <h2 className="mb-3 text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl">Kiến thức IoT – DIY – Tự động hoá.</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">Chia sẻ kinh nghiệm thực tế về ESP32, động cơ bước, trục tuyến tính, hệ thống tưới cây và các dự án DIY ứng dụng trong xưởng nhỏ.</p>
        </div>

        {/* Nếu chưa có bài viết */}
        {!hasPosts && <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-[#111] dark:text-gray-400">Chưa có bài viết nào. Hãy tạo bài mới trong trang admin để hiển thị tại đây.</div>}

        {/* Grid bài viết */}
        {hasPosts && (
          <div className="grid gap-6 md:grid-cols-3">
            {dynamicPosts.map((post) => (
              <article key={post.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)] dark:border-gray-800 dark:bg-[#111111]">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {formatDate(post.created_at)} • Tác giả: {post.author || "Ẩn danh"}
                </p>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base line-clamp-2">{post.title}</h3>
                <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300 sm:text-[13px] line-clamp-4">{getPlainText(post.content)}</p>

                <div className="mt-auto">
                  <Link href={`/blog/${post.id}`} className="inline-flex items-center text-xs font-semibold text-[#0066CC] hover:underline dark:text-[#2997FF]">
                    <span>Đọc bài viết</span>
                    <ChevronRightIcon className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA tổng blog */}
        <div className="mt-10 text-center">
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-[#0066CC] hover:underline dark:text-[#2997FF]">
            <span>Xem blog</span>
            <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
