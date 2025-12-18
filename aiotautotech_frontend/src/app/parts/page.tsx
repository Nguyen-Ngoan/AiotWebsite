// src/app/parts/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import { getApiUrl } from '@/lib/apiConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

// --- Types ---
interface PrintProfile {
  profile_name: string;
  material_type: string;
}

interface PrintedPart {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  print_profiles: PrintProfile[];
}

export default function PartsPage() {
  const [parts, setParts] = useState<PrintedPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const url = getApiUrl('/printing/parts/');
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to fetch parts');
          return;
        }
        const data = await res.json();
        setParts(data);
      } catch (error) {
        console.error('Error fetching parts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParts();
  }, []);

  return (
    <>
      <Header navItems={navItems} />
      <div className="bg-gray-50 min-h-screen pt-12 md:pt-28 lg:pt-32 pb-12">
        {/* Breadcrumb */}
        <nav
          className="flex border-b border-gray-200 bg-gray-50 py-3"
          aria-label="Breadcrumb"
        >
          <ol
            role="list"
            className="mx-auto flex w-full max-w-7xl space-x-4 px-4 sm:px-6 lg:px-8"
          >
            <li className="flex">
              <div className="flex items-center">
                <Link href="/" className="text-gray-400 hover:text-gray-500">
                  <svg
                    className="h-5 w-5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">Trang chủ</span>
                </Link>
              </div>
            </li>
            <li className="flex">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500">
                  3D Printed Parts
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              3D Printed Parts Catalog
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-500">
              High-quality 3D printed components, custom gears, and enclosures.
            </p>
          </div>

          {/* Search & Filter (Simplified) */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary focus:ring-primary sm:text-sm py-2 border"
                placeholder="Search parts..."
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-12">Loading parts...</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {parts.length > 0 ? (
                parts.map((part) => (
                  <Link
                    key={part.id}
                    href={`/parts/${part.slug}`}
                    className="group block h-full"
                  >
                    <Card className="h-full overflow-hidden transition-all hover:shadow-lg border-gray-200 flex flex-col">
                      <div className="aspect-square relative bg-gray-100 overflow-hidden">
                        {part.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={part.thumbnail_url}
                            alt={part.title}
                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <span className="text-sm">No Image</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                          {part.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {Array.from(
                            new Set(
                              part.print_profiles?.map((p) => p.material_type)
                            )
                          )
                            .slice(0, 3)
                            .map((mat) => (
                              <Badge
                                key={mat}
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {mat}
                              </Badge>
                            ))}
                          {part.print_profiles &&
                            new Set(
                              part.print_profiles.map((p) => p.material_type)
                            ).size > 3 && (
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                +
                                {new Set(
                                  part.print_profiles.map(
                                    (p) => p.material_type
                                  )
                                ).size - 3}
                              </Badge>
                            )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          variant="outline"
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No parts found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
