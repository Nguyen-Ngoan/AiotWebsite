import React from 'react';
import { getApiUrl } from '@/lib/apiConfig';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DiyMakerSection from '@/components/home/DiyMakerSection';
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

async function getPosts() {
  try {
    const res = await fetch(getApiUrl('/posts/'), { next: { revalidate: 60 } });
    if (!res.ok) {
      throw new Error(`Failed to fetch posts (HTTP ${res.status})`);
    }
    return res.json();
  } catch (err: any) {
    console.error('Error fetching posts:', err.message);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header navItems={navItems} />
      <main className="flex-1 pt-[52px] md:pt-24">
        <DiyMakerSection />
        <BlogSection posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
