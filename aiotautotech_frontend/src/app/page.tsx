// src/app/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link
import Header from "@/components/layout/Header"; // Import Header component
import Footer from "@/components/layout/Footer";
import DiyMakerSection from "@/components/home/DiyMakerSection";
import TechDocsSection from "@/components/home/TechDocsSection";
import BlogSection from "@/components/home/BlogSection";

// Định nghĩa kiểu dữ liệu (Interface) cho bài viết
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setIsMounted(true);

    if (!API_URL) {
      setError("Biến môi trường NEXT_PUBLIC_API_URL chưa được thiết lập.");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const url = `${API_URL}/posts/`;
        console.log(`Fetching data from: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
        }

        const data: Post[] = await response.json();
        setPosts(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Không thể kết nối đến Backend: ${err.message}. Kiểm tra Django Server và cấu hình CORS.`);
        } else {
          setError("Đã xảy ra lỗi không xác định khi tải dữ liệu.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [API_URL]);

  if (!isMounted) {
    return <div className="min-h-screen bg-apple-gray" />;
  }

  // Nếu có lỗi hoặc đang tải, hiển thị thông báo thay vì toàn bộ trang
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-apple-gray text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800">Đang tải dữ liệu từ API Django...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-center p-4">
        <h1 className="text-2xl font-bold text-red-700">LỖI KẾT NỐI:</h1>
        <p className="mt-2 text-red-600 max-w-lg">{error}</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray dark:bg-apple-gray-dark dark:text-apple-text-dark">
      <Header /> {/* Sử dụng Header component */}
      <main className="pt-20">
        <DiyMakerSection />
        <TechDocsSection />
        <BlogSection />
        <Footer />
      </main>
    </div>
  );
}
