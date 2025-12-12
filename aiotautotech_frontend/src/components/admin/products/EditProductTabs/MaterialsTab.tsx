'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { getApiUrl } from '@/lib/apiConfig';
import { toast } from 'sonner';
import type { ProductFormState } from '@/app/admin/products/[id]/edit/page';

interface Material {
  id: string;
  name: string;
  unit: string;
  current_cost: number;
}

interface MaterialsTabProps {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
}

export function MaterialsTab({ form, setForm }: MaterialsTabProps) {
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoadingMaterials(true);
      try {
        const res = await fetch(getApiUrl('/materials/'));
        if (!res.ok) throw new Error('Failed to fetch materials');
        const data = await res.json();
        setAvailableMaterials(data);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải danh sách vật tư');
      } finally {
        setIsLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleAddMaterial = () => {
    if (!selectedMaterialId) {
      toast.error('Vui lòng chọn vật tư');
      return;
    }
    if (quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    const materialToAdd = availableMaterials.find(
      (m) => m.id === selectedMaterialId
    );
    if (!materialToAdd) return;

    // Check if already exists
    const exists = form.materials.some((m) => m.id === selectedMaterialId);
    if (exists) {
      toast.error('Vật tư này đã có trong danh sách');
      return;
    }

    const newMaterialEntry = {
      ...materialToAdd,
      quantity: quantity,
    };

    setForm((prev) => ({
      ...prev,
      materials: [...prev.materials, newMaterialEntry],
    }));

    // Reset fields
    setSelectedMaterialId('');
    setQuantity(1);
  };

  const handleRemoveMaterial = (id: string) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  };

  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty < 0) return;
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === id ? { ...m, quantity: newQty } : m
      ),
    }));
  };

  const totalCost = form.materials.reduce(
    (sum, m) => sum + m.current_cost * m.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Quản lý Vật tư (BOM)</h3>
        <p className="text-sm text-muted-foreground">
          Thêm các nguyên vật liệu cấu thành sản phẩm này.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label>Chọn vật tư</Label>
          <Select
            value={selectedMaterialId}
            onValueChange={setSelectedMaterialId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn vật tư..." />
            </SelectTrigger>
            <SelectContent>
              {availableMaterials.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} ({m.unit}) - {m.current_cost.toLocaleString()} VND
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full space-y-2 sm:w-32">
          <Label>Số lượng</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <Button
          type="button"
          onClick={handleAddMaterial}
          disabled={isLoadingMaterials}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên vật tư</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-center">Số lượng</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {form.materials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Chưa có vật tư nào được thêm.
                </TableCell>
              </TableRow>
            ) : (
              form.materials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.unit}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.current_cost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="1"
                      className="mx-auto h-8 w-20 text-center"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(item.current_cost * item.quantity).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveMaterial(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end rounded-md bg-muted/50 p-4">
        <div className="text-right">
          <span className="text-sm font-medium text-muted-foreground">
            Tổng chi phí vật tư:
          </span>
          <div className="text-2xl font-bold text-primary">
            {totalCost.toLocaleString()} VND
          </div>
        </div>
      </div>
    </div>
  );
}
