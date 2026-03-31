// src/app/admin/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { PlusCircle, ChevronRight, ArrowUpDown, ImageIcon } from 'lucide-react';
import { getApiUrl } from '@/lib/apiConfig';
import { getPrimaryImageUrl } from '@/lib/productMedia';
import {
  formatPrice,
  type Product,
} from '@/components/diy-maker/DiyProductCard';
import { cn } from '@/lib/utils';

type SortKey = 'title' | 'updated_at';

export default function AdminProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: 'asc' | 'desc';
  }>({ key: 'updated_at', direction: 'desc' });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/products/'));
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      let list: Product[] = [];
      if (Array.isArray(data)) {
        list = data as Product[];
      } else if (
        data &&
        Array.isArray((data as { results?: Product[] }).results)
      ) {
        list = (data as { results: Product[] }).results;
      }
      setProducts(list);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${title}" không?`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/products/${productId}/`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Xóa không thành công.');
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success(`Đã xóa: ${title}`);
    } catch (error) {
      console.error(error);
      toast.error('Đã xảy ra lỗi khi xóa.');
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: key === 'title' ? 'asc' : 'desc' };
    });
  };

  const sortedProducts = [...products].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (key === 'title') {
      const ta = (a.title || '').localeCompare(b.title || '', 'vi');
      return direction === 'asc' ? ta : -ta;
    }
    const da = a.updated_at || a.created_at || '';
    const db = b.updated_at || b.created_at || '';
    const cmp = da.localeCompare(db);
    return direction === 'asc' ? cmp : -cmp;
  });

  const statusLabel = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Đang bán';
      case 'draft':
        return 'Bản nháp';
      case 'archived':
        return 'Lưu trữ';
      default:
        return status || '—';
    }
  };

  const statusBadgeClass = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'draft':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const shortDate = (p: Product) => {
    const raw = p.updated_at || p.created_at;
    if (!raw) return '—';
    return new Date(raw).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-none px-0 py-0 sm:py-4">
      <div className="mb-4 flex items-center space-x-2 px-4 pt-4 text-sm text-muted-foreground sm:px-4 sm:pt-0">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/admin" className="hover:text-primary">
          Admin
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Sản phẩm</span>
      </div>
      <Card className="w-full border-none shadow-none sm:border sm:shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>QUẢN LÝ SẢN PHẨM</CardTitle>
              <CardDescription>
                Xem, thêm, sửa và xóa sản phẩm DIY.
              </CardDescription>
            </div>
            <div className="flex w-full min-w-0 flex-row items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
                <span className="shrink-0 text-xs text-muted-foreground">
                  Sắp xếp:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 text-xs"
                  onClick={() => handleSort('title')}
                >
                  Tên
                  <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                  {sortConfig.key === 'title' && (
                    <span className="ml-1 text-[10px] opacity-70">
                      {sortConfig.direction === 'asc' ? 'A→Z' : 'Z→A'}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 text-xs"
                  onClick={() => handleSort('updated_at')}
                >
                  Cập nhật
                  <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                  {sortConfig.key === 'updated_at' && (
                    <span className="ml-1 text-[10px] opacity-70">
                      {sortConfig.direction === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
                    </span>
                  )}
                </Button>
              </div>
              <Button
                asChild
                className="h-8 w-fit shrink-0 rounded-full bg-blue-600 px-2.5 text-xs text-white hover:bg-blue-700"
              >
                <Link href="/admin/products/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-6">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Đang tải...
            </p>
          ) : sortedProducts.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Chưa có sản phẩm nào. Nhấn Add để tạo.
            </p>
          ) : (
            <ul className="grid gap-x-3 gap-y-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => {
                const thumb = getPrimaryImageUrl(
                  product.images || [],
                  'thumb'
                );
                return (
                  <li
                    key={product.id}
                    className="odd:bg-[#001a1a] even:bg-[#0d4040]"
                  >
                    <article
                      className={cn(
                        'flex h-full gap-3 p-3 shadow-sm transition',
                        'hover:shadow-md'
                      )}
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-black/25">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-50">
                          {product.title || '—'}
                        </h3>
                        {product.sku ? (
                          <p className="mt-1 truncate text-xs text-gray-400">
                            SKU: {product.sku}
                          </p>
                        ) : null}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-semibold tabular-nums text-cyan-300">
                            {formatPrice(
                              product.base_price,
                              product.currency
                            )}
                          </span>
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium leading-none',
                              statusBadgeClass(product.status)
                            )}
                          >
                            {statusLabel(product.status)}
                          </span>
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                          <span className="text-[11px] text-gray-400">
                            {shortDate(product)}
                          </span>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              asChild
                              className="border-0 bg-white/10 text-gray-100 hover:bg-white/20"
                            >
                              <Link
                                href={`/admin/products/${product.id}/edit`}
                              >
                                Sửa
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                              onClick={() =>
                                handleDelete(
                                  product.id,
                                  product.title || 'Sản phẩm'
                                )
                              }
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
