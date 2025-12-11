// src/app/admin/materials/[id]/edit/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import { getApiUrl } from '@/lib/apiConfig';
import { X, Upload } from 'lucide-react';

const PREDEFINED_UNITS = ['piece', 'kg', 'g', 'meter', 'cm', 'l', 'ml'];

interface MaterialImage {
  id: string;
  url: string;
  url_medium?: string;
  url_thumb?: string;
  fileName?: string;
  alt?: string;
  title?: string;
  type?: string;
  isPrimary?: boolean;
}

interface Material {
  id: string;
  name: string;
  english_name?: string;
  description?: string;
  specifications?: string;
  current_cost: number;
  unit: string;
  images?: MaterialImage[];
}

export default function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [currentCost, setCurrentCost] = useState('');
  const [unit, setUnit] = useState('');
  const [images, setImages] = useState<MaterialImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMaterial = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(getApiUrl(`/materials/${id}/`));
        if (!response.ok) {
          throw new Error('Không tìm thấy nguyên vật liệu.');
        }
        const data: Material = await response.json();
        setName(data.name);
        setEnglishName(data.english_name || '');
        setDescription(data.description || '');
        setSpecifications(data.specifications || '');
        setCurrentCost(String(data.current_cost));
        setUnit(data.unit);
        setImages(data.images || []);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải dữ liệu nguyên vật liệu.');
        router.push('/admin/materials');
      } finally {
        setIsFetching(false);
      }
    };

    fetchMaterial();
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    // Tạo seo_file_name từ tên file (bỏ đuôi mở rộng)
    const seoName = file.name.split('.').slice(0, -1).join('.');
    formData.append('seo_file_name', seoName);
    formData.append('type', 'gallery');
    formData.append('is_primary', 'false');

    try {
      const res = await fetch(getApiUrl(`/materials/${id}/images/`), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      // Backend trả về { images: [...] } là danh sách mới nhất
      setImages(data.images);
      toast.success('Upload ảnh thành công');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteImage = async (image: MaterialImage) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      // 1. Xóa file trên R2
      const resDelete = await fetch(
        getApiUrl(`/materials/${id}/images/delete/`),
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: image.fileName }),
        }
      );
      if (!resDelete.ok) throw new Error('Không thể xóa file trên server');

      // 2. Cập nhật lại danh sách images trong Firestore (loại bỏ ảnh vừa xóa)
      const newImages = images.filter((img) => img.id !== image.id);

      // Gọi PUT để lưu mảng images mới
      const resUpdate = await fetch(getApiUrl(`/materials/${id}/`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImages }),
      });

      if (!resUpdate.ok)
        throw new Error('Lỗi cập nhật dữ liệu sau khi xóa ảnh');

      setImages(newImages);
      toast.success('Đã xóa ảnh');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi xóa ảnh');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const cost = parseInt(currentCost, 10);
    if (isNaN(cost) || cost < 0) {
      toast.error('Giá phải là một số nguyên hợp lệ.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/materials/${id}/`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          english_name: englishName.trim(),
          description: description.trim(),
          specifications: specifications.trim(),
          current_cost: cost,
          unit: unit.trim(),
          images: images,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Cập nhật không thành công.');
      }

      toast.success('Đã cập nhật nguyên vật liệu thành công!');
      router.push('/admin/materials');
    } catch (error) {
      console.error('Failed to update material:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="container p-4">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên linh kiện (TV)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="english_name">Tên tiếng Anh</Label>
              <Input
                id="english_name"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="English Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specifications">Thông số kỹ thuật</Label>
              <textarea
                id="specifications"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                placeholder="Thông số kỹ thuật..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current_cost">Giá / Đơn vị (VND)</Label>
                <Input
                  id="current_cost"
                  type="number"
                  value={currentCost}
                  onChange={(e) => setCurrentCost(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Đơn vị tính</Label>
                <Select onValueChange={setUnit} value={unit} required>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="grid gap-2">
              <Label>Hình ảnh</Label>
              <div className="flex flex-wrap gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative h-24 w-24 overflow-hidden rounded-md border bg-gray-100 dark:bg-gray-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url_thumb || img.url}
                      alt={img.alt || 'Material Image'}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img)}
                      className="absolute right-1 top-1 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600"
                      title="Xóa ảnh"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed hover:bg-accent/50">
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                    {isUploading ? (
                      <span className="text-xs">Uploading...</span>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="mt-1 text-xs text-muted-foreground">
                          Upload
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/materials">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
