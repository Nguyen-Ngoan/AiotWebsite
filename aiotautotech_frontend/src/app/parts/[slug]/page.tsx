'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import PartDetailClient, { PrintedPart } from './part-detail-client';
import { getApiUrl } from '@/lib/apiConfig';

export default function PartDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [part, setPart] = useState<PrintedPart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Tích hợp logic kiểm tra quyền Admin thực tế tại đây (tương tự Project Detail)
  const isAdmin = true;

  useEffect(() => {
    const fetchPart = async () => {
      try {
        const url = getApiUrl(`/printing/parts/by-slug/${slug}/`);
        const res = await fetch(url);

        if (!res.ok) {
          if (res.status === 404) {
            setPart(null);
          } else {
            console.error('Failed to fetch part data');
          }
        } else {
          const data = await res.json();
          setPart(data);
        }
      } catch (error) {
        console.error('Error fetching part:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPart();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">Loading...</div>
    );
  }

  if (!part) {
    notFound();
  }

  return (
    <>
      <Header navItems={navItems} />
      <div className="container mx-auto min-h-screen pt-12 md:pt-28 lg:pt-32 pb-10 px-4 md:px-6">
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link
            href="/parts"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            3D Printed Parts
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-foreground truncate">
            {part.title}
          </span>
        </nav>
        <PartDetailClient part={part} isAdmin={isAdmin} />
      </div>
      <Footer />
    </>
  );
}
