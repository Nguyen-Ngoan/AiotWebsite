'use client';

import React, { useState, useEffect } from 'react';
import {
  Project,
  projectService,
  BOMItem,
  ProjectProduct,
  ProjectMaterial,
} from '@/lib/api/projectService';
import { getApiUrl } from '@/lib/apiConfig';

interface BOMManagerProps {
  project: Project;
  onUpdate: () => void;
}

interface ProductOption {
  id: string;
  title: string;
  base_price: number;
  sku?: string;
}

interface MaterialOption {
  id: string;
  name: string;
  current_cost: number;
  unit: string;
}

export default function BOMManager({ project, onUpdate }: BOMManagerProps) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [materials, setMaterials] = useState<MaterialOption[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productQty, setProductQty] = useState<number>(1);

  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [materialQty, setMaterialQty] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch danh sách Products và Materials để hiển thị trong dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, matRes] = await Promise.all([
          fetch(getApiUrl('/products/')),
          fetch(getApiUrl('/materials/')),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }

        if (matRes.ok) {
          const matData = await matRes.json();
          setMaterials(matData);
        }
      } catch (err) {
        console.error('Failed to fetch options', err);
        setError('Không thể tải danh sách sản phẩm/vật tư.');
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setError(null);
    try {
      await projectService.addProduct(project.id, {
        product_id: selectedProduct,
        quantity: productQty,
      });
      setSelectedProduct('');
      setProductQty(1);
      onUpdate(); // Refresh lại dữ liệu dự án
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi thêm sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!selectedMaterial) return;
    setLoading(true);
    setError(null);
    try {
      await projectService.addMaterial(project.id, {
        material_id: selectedMaterial,
        quantity: materialQty,
      });
      setSelectedMaterial('');
      setMaterialQty(1);
      onUpdate(); // Refresh lại dữ liệu dự án
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi thêm vật tư.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SECTION 1: LIVE PRODUCTS */}
      <div className="bg-white shadow sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Products (Live Reference)
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Sản phẩm được liên kết trực tiếp. Giá sẽ tự động cập nhật khi sản
            phẩm thay đổi.
          </p>
        </div>
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn sản phẩm
            </label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} - {formatCurrency(p.base_price)}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              min="1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={productQty}
              onChange={(e) => setProductQty(parseInt(e.target.value) || 1)}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleAddProduct}
            disabled={loading || !selectedProduct}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {project.products?.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-blue-600 truncate">
                    {item.product.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    Live Price: {formatCurrency(item.product.base_price)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900">
                    x{item.quantity}
                  </span>
                  <span className="text-sm font-bold text-gray-900 w-24 text-right">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              </div>
            </li>
          ))}
          {(!project.products || project.products.length === 0) && (
            <li className="px-4 py-8 text-center text-sm text-gray-500 italic">
              Chưa có sản phẩm nào được thêm.
            </li>
          )}
        </ul>
      </div>

      {/* SECTION 2: LIVE MATERIALS */}
      <div className="bg-white shadow sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Materials (Live Reference)
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Vật tư tiêu hao (ốc vít, dây điện, nhựa in 3D...).
          </p>
        </div>
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn vật tư
            </label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Chọn vật tư --</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.unit}) - {formatCurrency(m.current_cost)}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              min="1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={materialQty}
              onChange={(e) => setMaterialQty(parseInt(e.target.value) || 1)}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleAddMaterial}
            disabled={loading || !selectedMaterial}
            className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Material'}
          </button>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {project.materials?.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-green-700 truncate">
                    {item.material.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.material.specifications}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900">
                    x{item.quantity}
                  </span>
                  <span className="text-sm font-bold text-gray-900 w-24 text-right">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              </div>
            </li>
          ))}
          {(!project.materials || project.materials.length === 0) && (
            <li className="px-4 py-8 text-center text-sm text-gray-500 italic">
              Chưa có vật tư nào được thêm.
            </li>
          )}
        </ul>
      </div>

      {/* Tổng kết chi phí */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
        <span className="text-blue-900 font-medium">
          Tổng chi phí ước tính (Live):
        </span>
        <span className="text-2xl font-bold text-blue-700">
          {formatCurrency(project.total_cost || 0)}
        </span>
      </div>
    </div>
  );
}
