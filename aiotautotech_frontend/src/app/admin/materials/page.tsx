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
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import {
  Plus,
  ArrowUpDown,
  ImageIcon,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getApiUrl } from '@/lib/apiConfig';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

interface MaterialImage {
  url: string;
  url_medium?: string;
  url_thumb?: string;
}

interface Material {
  id: string;
  name: string;
  english_name?: string;
  description?: string;
  specifications?: string;
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
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
      <Card className="border-none shadow-none sm:border sm:shadow-sm">
        <CardHeader className="p-0">
          <div className="grid grid-cols-3 items-center px-0 pt-1">
            <div className="flex items-center justify-start">
              <Button asChild variant="ghost" size="icon" className="rounded-full">
                <Link href="/" aria-label="Back to home" title="Back to home">
                  <ChevronLeftIcon className="h-6 w-6" />
                </Link>
              </Button>
            </div>
            <CardTitle className="text-center">QUẢN LÝ VẬT TƯ</CardTitle>
            <div className="flex items-center justify-end pr-1 sm:pr-0">
            <Button
              asChild
              size="icon"
              className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Link href="/admin/materials/new" aria-label="Add material" title="Add material">
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <Table className="min-w-[680px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] pl-4 sm:pl-6">Image</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="hover:bg-transparent hover:text-primary"
                  >
                    Material Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Price (VND)</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="pr-4 text-right sm:pr-6">
                  Actions
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
                          className="h-10 w-10 cursor-pointer rounded-md border object-cover hover:opacity-80"
                          onClick={() => {
                            setSelectedMaterial(material);
                            setLightboxIndex(0);
                            setIsLightboxOpen(true);
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedMaterial(material);
                          setIsDetailOpen(true);
                        }}
                      >
                        <div>{material.name}</div>
                        {material.english_name && (
                          <div className="text-xs text-muted-foreground">
                            {material.english_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                      {material.current_cost.toLocaleString('en-US')}
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell className="pr-4 text-right sm:pr-6">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        title="Sửa vật tư"
                        aria-label="Sửa vật tư"
                      >
                        <Link href={`/admin/materials/${material.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(material.id, material.name)}
                        title="Xóa vật tư"
                        aria-label="Xóa vật tư"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader className="sm:text-center">
            <DialogTitle>{selectedMaterial?.name}</DialogTitle>
            {selectedMaterial?.english_name && (
              <DialogDescription>
                {selectedMaterial.english_name}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedMaterial && (
            <div className="grid gap-4 py-4 text-center">
              {selectedMaterial.images &&
                selectedMaterial.images.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedMaterial.images.map((img, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={img.url_medium || img.url}
                        alt={selectedMaterial.name}
                        className="h-32 w-auto cursor-pointer rounded-md border object-cover hover:opacity-80"
                        onClick={() => {
                          setLightboxIndex(idx);
                          setIsLightboxOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}

              <div className="flex justify-center gap-4">
                <div>
                  <h4 className="mb-1 font-semibold">Giá hiện tại</h4>
                  <p>
                    {selectedMaterial.current_cost.toLocaleString('en-US')} VND
                    / {selectedMaterial.unit}
                  </p>
                </div>
              </div>

              {selectedMaterial.description && (
                <div>
                  <h4 className="mb-1 font-semibold">Mô tả</h4>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {selectedMaterial.description}
                  </p>
                </div>
              )}

              {selectedMaterial.specifications && (
                <div>
                  <h4 className="mb-1 font-semibold">Thông số kỹ thuật</h4>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {selectedMaterial.specifications}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedMaterial && (
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          index={lightboxIndex}
          slides={
            selectedMaterial.images?.map((img) => ({ src: img.url })) || []
          }
          plugins={[Zoom]}
        />
      )}
    </div>
  );
}
