// src/app/admin/materials/new/page.tsx
'use client';

import { useState } from 'react';
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

export default function CreateMaterialPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [currentCost, setCurrentCost] = useState('');
  const [unit, setUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim() || !unit.trim()) {
      toast.error('Tên và Đơn vị tính là bắt buộc.');
      setIsLoading(false);
      return;
    }

    const cost = parseInt(currentCost, 10);
    if (isNaN(cost) || cost < 0) {
      toast.error('Giá phải là một số nguyên hợp lệ.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/materials/'), {
        method: 'POST',
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
        throw new Error(
          errorData.detail || 'Có lỗi xảy ra khi tạo nguyên vật liệu.'
        );
      }

      const newMaterial = await response.json();
      toast.success(`Đã tạo thành công nguyên vật liệu: ${newMaterial.name}`);

      // Chuyển hướng về trang danh sách nguyên vật liệu
      router.push('/admin/materials');
    } catch (error) {
      console.error('Failed to create material:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Tạo Nguyên Vật Liệu Mới</CardTitle>
            <CardDescription>
              Điền thông tin chi tiết cho nguyên vật liệu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên nguyên vật liệu</Label>
              <Input
                id="name"
                placeholder="Vít M3, Nhựa PLA,..."
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
                  placeholder="1000"
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
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
