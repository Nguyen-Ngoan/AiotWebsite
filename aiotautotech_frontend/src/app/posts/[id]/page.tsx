// src/app/posts/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!id) return;

    if (!API_URL) {
      setError("Biến môi trường NEXT_PUBLIC_API_URL chưa được thiết lập.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const url = `${API_URL}/posts/${id}/`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
        }

        const data: Post = await response.json();
        setPost(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Không thể tải bài viết: ${err.message}.`);
        } else {
          setError("Đã xảy ra lỗi không xác định khi tải bài viết.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, API_URL]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-apple-gray text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800">Đang tải bài viết...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-red-100 text-center p-4">
        <h1 className="text-2xl font-bold text-red-700">LỖI:</h1>
        <p className="mt-2 text-red-600">{error}</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-apple-gray text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy bài viết.</h1>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray">
      <Header />
      <main className="pt-20 container mx-auto px-4 md:px-6 py-12">
        <article className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-6">{post.title}</h1>
          <p className="text-lg text-gray-600 mb-8">
            <strong>Tác giả:</strong> {post.author} | Ngày tạo: {new Date(post.created_at).toLocaleDateString()}
          </p>
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
            {post.content}
          </div>
          <Link href="/" className="mt-12 inline-block text-apple-blue hover:underline font-semibold text-lg">
            ← Quay lại trang chủ
          </Link>
        </article>
      </main>
    </div>
  );
}
