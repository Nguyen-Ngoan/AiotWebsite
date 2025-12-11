// src/app/admin/materials/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getApiUrl } from '@/lib/apiConfig';

interface MaterialImage {
  url: string;
  url_thumb?: string;
}

interface Material {
  id: string;
  name: string;
  english_name?: string;
  current_cost: number;
  unit: string;
  updated_at: string;
  images?: MaterialImage[];
}

export default function MaterialsListPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Material;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(getApiUrl('/materials/'));
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải danh sách nguyên vật liệu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleDelete = async (materialId: string, materialName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${materialName}" không?`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/materials/${materialId}/`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Xóa không thành công.');
      }

      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      toast.success(`Đã xóa thành công: ${materialName}`);
    } catch (error) {
      console.error(error);
      toast.error('Đã xảy ra lỗi khi xóa.');
    }
  };

  const handleSort = (key: keyof Material) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedMaterials = [...materials].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (key === 'name') {
      return direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    // Fallback for numbers or other types
    const valA = a[key];
    const valB = b[key];

    if (valA === undefined || valB === undefined) return 0;
    if (typeof valA === 'object' || typeof valB === 'object') return 0;

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="container mx-auto p-0 sm:p-4">
      <div className="mb-4 flex items-center space-x-2 px-4 pt-4 text-sm text-muted-foreground sm:px-2 sm:pt-0">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Materials</span>
      </div>
      <Card className="border-none shadow-none sm:border sm:shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between px-4 sm:px-0">
            <div>
              <CardTitle>QUẢN LÝ VẬT TƯ</CardTitle>
              <CardDescription>
                Xem, tạo, sửa, và xóa các vật tư.
              </CardDescription>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/admin/materials/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] pl-4 sm:pl-6">Ảnh</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="hover:bg-transparent hover:text-primary"
                  >
                    Tên Vật Tư
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Giá (VND)</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="pr-4 text-right sm:pr-6">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : (
                sortedMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="pl-4 sm:pl-6">
                      {material.images && material.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            material.images[0]?.url_thumb ||
                            material.images[0]?.url
                          }
                          alt={material.name}
                          className="h-10 w-10 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{material.name}</div>
                      {material.english_name && (
                        <div className="text-xs text-muted-foreground">
                          {material.english_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                      {material.current_cost.toLocaleString('en-US')}
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell className="pr-4 text-right sm:pr-6">
                      <Button variant="ghost" size="sm">
                        <Link href={`/admin/materials/${material.id}/edit`}>
                          Sửa
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(material.id, material.name)}
                      >
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
