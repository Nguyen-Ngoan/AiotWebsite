'use client';

import { useEffect, useState, useRef } from 'react';
import { getApiUrl } from '@/lib/apiConfig';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DiyMakerSection from '@/components/home/DiyMakerSection';
import TechDocsSection from '@/components/home/TechDocsSection';
import { navItems } from '@/components/layout/nav-items';
import BlogSection from '@/components/home/BlogSection';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        console.error('Error fetching posts:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const updatePadding = () => {
      if (headerRef.current) setMainPaddingTop(headerRef.current.offsetHeight);
    };
    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header ref={headerRef} navItems={navItems} />
      <main
        className="flex-1"
        style={{ paddingTop: mainPaddingTop > 0 ? `${mainPaddingTop}px` : '0' }}
      >
        <DiyMakerSection />
        <TechDocsSection />
        <BlogSection posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
