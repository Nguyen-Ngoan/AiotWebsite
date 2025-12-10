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

const PREDEFINED_UNITS = ['piece', 'kg', 'g', 'meter', 'cm', 'l', 'ml'];

interface Material {
  id: string;
  name: string;
  current_cost: number;
  unit: string;
}

export default function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [name, setName] = useState('');
  const [currentCost, setCurrentCost] = useState('');
  const [unit, setUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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
        setCurrentCost(String(data.current_cost));
        setUnit(data.unit);
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
          current_cost: cost,
          unit: unit.trim(),
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
            <CardTitle>Chỉnh Sửa Nguyên Vật Liệu</CardTitle>
            <CardDescription>Cập nhật thông tin chi tiết.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên nguyên vật liệu</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
