'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/apiConfig';
import { navItems } from '@/components/layout/nav-items';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Post {
  id: string;
  title: string;
  content?: string | null;
  author?: string | null;
  slug?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const getPlainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const formatDate = (iso?: string | null) => {
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

function BlogPostItem({ post }: { post: Post }) {
  const detailHref = `/blog/${post.slug || 'bai-viet'}-${post.id}`;
  const excerpt = post.content
    ? getPlainText(post.content).substring(0, 200) + '...'
    : '';

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-4 text-xs text-gray-500">
        <span>{formatDate(post.created_at)}</span>
        {post.author && <span>•</span>}
        {post.author && <span>Tác giả: {post.author}</span>}
      </div>
      <Link href={detailHref} className="group">
        <h2 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
          {post.title}
        </h2>
      </Link>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">
        {excerpt}
      </p>
      <div className="mt-4">
        <Link
          href={detailHref}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Đọc tiếp →
        </Link>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(getApiUrl('/posts/'));
        if (!res.ok) {
          throw new Error(`Failed to fetch posts (HTTP ${res.status})`);
        }
        const data: Post[] = await res.json();
        setPosts(data);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const updatePadding = () => {
      if (headerRef.current) {
        setMainPaddingTop(headerRef.current.offsetHeight);
      }
    };
    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header ref={headerRef} navItems={navItems} />
      <main
        className="flex-1"
        style={{
          paddingTop: mainPaddingTop > 0 ? `${mainPaddingTop}px` : '7rem',
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Trang chủ
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li className="font-medium text-gray-800">Blog</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Blog Kỹ thuật
            </h1>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-1.5 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Thêm bài viết</span>
            </Link>
          </div>

          <p className="mt-2 text-lg text-gray-600">
            Kiến thức, ghi chép và các dự án về IoT, DIY và Tự động hóa.
          </p>

          <div className="mt-8">
            {isLoading && <p className="text-gray-500">Đang tải bài viết...</p>}
            {error && <p className="text-red-600">Lỗi: {error}</p>}
            {!isLoading && !error && posts.length === 0 && (
              <p className="text-gray-500">Chưa có bài viết nào.</p>
            )}
            <div className="space-y-8">
              {posts.map((post) => (
                <BlogPostItem key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
