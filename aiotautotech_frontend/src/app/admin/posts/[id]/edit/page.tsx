// src/app/admin/posts/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostEditor from '@/components/admin/PostEditor';
import { navItems } from '@/components/layout/nav-items';
import { getApiUrl } from '@/lib/apiConfig';

interface Post {
  id: string;
  title: string;
  content: string; // HTML từ Tiptap
  author: string;
  created_at: string;
}

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('AiotAutotech');
  const [contentHtml, setContentHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dữ liệu bài viết
  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Thiếu ID bài viết hoặc ID không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const url = getApiUrl(`/posts/${id}/`);
        console.log('Fetching post for edit from:', url);
        const res = await fetch(url);

        if (res.status === 404) {
          setError('Không tìm thấy bài viết để chỉnh sửa.');
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data: Post = await res.json();
        setPost(data);
        setTitle(data.title || '');
        setAuthor(data.author || 'AiotAutotech');
        setContentHtml(data.content || '');
      } catch (err) {
        if (err instanceof Error) {
          setError(`Không thể tải bài viết: ${err.message}`);
        } else {
          setError('Đã xảy ra lỗi không xác định khi tải bài viết.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError(null);

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    if (!contentHtml || contentHtml.trim() === '') {
      setError('Nội dung bài viết đang rỗng.');
      return;
    }

    setSaving(true);
    try {
      const url = getApiUrl(`/posts/${id}/`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: contentHtml,
          author: author.trim() || 'AiotAutotech',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${text}`);
      }

      // Sau khi lưu xong → quay lại trang chi tiết bài
      router.push(`/blog/${id}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Không thể lưu thay đổi: ${err.message}`);
      } else {
        setError('Đã xảy ra lỗi không xác định khi lưu bài viết.');
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-gray dark:bg-apple-gray-dark dark:text-apple-text-dark">
        <Header navItems={navItems} />
        <main className="pt-20 flex items-center justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Đang tải dữ liệu bài viết...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-apple-gray dark:bg-apple-gray-dark dark:text-apple-text-dark">
        <Header navItems={navItems} />
        <main className="pt-20 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-xl font-semibold text-red-600">
            KHÔNG CHỈNH SỬA ĐƯỢC BÀI VIẾT
          </h1>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 max-w-md">
            {error || 'Không tìm thấy dữ liệu bài viết.'}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray dark:bg-apple-gray-dark dark:text-apple-text-dark">
      <main className="py-2 sm:py-4">
        <div className="mx-auto max-w-4xl px-2 sm:px-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Editor */}
            <div>
              {/* Chỉ render editor khi đã có contentHtml (sau khi load xong) */}
              <PostEditor
                initialContent={contentHtml}
                onChange={setContentHtml}
                toolbarActions={
                  <>
                    <button
                      type="submit"
                      disabled={saving}
                      aria-label="Save"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white shadow hover:bg-blue-500 disabled:opacity-60"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M4 7a2 2 0 012-2h9l5 5v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
                        <path d="M14 5v6H8V5" />
                        <path d="M7 19h10" />
                      </svg>
                    </button>
                  </>
                }
              />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
