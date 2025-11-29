// src/app/admin/posts/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostEditor from '@/components/admin/PostEditor';
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
        <Header />
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
        <Header />
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
      <Header />

      <main className="pt-20 pb-16">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Chỉnh sửa bài viết
          </h1>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Cập nhật nội dung cho bài:{' '}
            <span className="font-semibold">{post.title}</span>
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tiêu đề */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Tiêu đề
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#111] dark:text-gray-100"
                placeholder="Tiêu đề bài viết"
              />
            </div>

            {/* Tác giả */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Tác giả
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#111] dark:text-gray-100"
                />
              </div>
            </div>

            {/* Editor */}
            <div>
              {/* Nếu sau này bạn muốn bỏ text này thì chỉ cần xoá label */}
              <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Nội dung bài viết
              </label>

              {/* Chỉ render editor khi đã có contentHtml (sau khi load xong) */}
              <PostEditor
                initialContent={contentHtml}
                onChange={setContentHtml}
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Bạn có thể dùng tiêu đề (H1–H3), danh sách, in đậm, in nghiêng,
                chèn ảnh (URL) và bảng (table).
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/blog/${id}`)}
                className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#222]"
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
