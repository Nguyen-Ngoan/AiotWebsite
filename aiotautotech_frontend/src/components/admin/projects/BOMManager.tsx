'use client';

import React, { useState, useEffect } from 'react';
import { Project, projectService } from '@/lib/api/projectService';
import { getApiUrl } from '@/lib/apiConfig';

// Interface tối giản cho Product dropdown
interface ProductSummary {
  id: string;
  title: string;
  base_price: number;
  sku?: string;
}

interface BOMManagerProps {
  project: Project;
  onUpdate: () => void; // Callback để refresh dữ liệu ở component cha
}

export default function BOMManager({ project, onUpdate }: BOMManagerProps) {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [usageNote, setUsageNote] = useState('');
  const [isOptional, setIsOptional] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch danh sách sản phẩm để chọn
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        // Gọi API lấy danh sách sản phẩm (giả sử endpoint này public hoặc đã auth)
        const url = getApiUrl('/products/');
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await projectService.addBOMItem(project.id, {
        product_id: selectedProductId,
        quantity: quantity,
        usage_note: usageNote,
        is_optional: isOptional,
      });

      // Reset form sau khi thêm thành công
      setQuantity(1);
      setUsageNote('');
      setIsOptional(false);
      // setSelectedProductId(''); // Giữ lại product id nếu muốn nhập nhanh nhiều dòng

      // Refresh dữ liệu dự án
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    } finally {
      setIsSubmitting(false);
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
      {/* Form Thêm Linh Kiện */}
      <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Thêm linh kiện vào BOM
        </h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6"
        >
          {/* Product Select */}
          <div className="sm:col-span-3">
            <label
              htmlFor="product"
              className="block text-sm font-medium text-gray-700"
            >
              Sản phẩm{' '}
              {loadingProducts && (
                <span className="text-gray-400 text-xs">(Đang tải...)</span>
              )}
            </label>
            <select
              id="product"
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatCurrency(p.base_price)})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="sm:col-span-1">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Số lượng
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </div>

          {/* Optional Checkbox */}
          <div className="sm:col-span-2 flex items-center pt-6">
            <input
              id="is_optional"
              type="checkbox"
              checked={isOptional}
              onChange={(e) => setIsOptional(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="is_optional"
              className="ml-2 block text-sm text-gray-900"
            >
              Là tùy chọn (Optional)
            </label>
          </div>

          {/* Usage Note */}
          <div className="sm:col-span-6">
            <label
              htmlFor="usage_note"
              className="block text-sm font-medium text-gray-700"
            >
              Ghi chú sử dụng
            </label>
            <input
              type="text"
              id="usage_note"
              value={usageNote}
              onChange={(e) => setUsageNote(e.target.value)}
              placeholder="Ví dụ: Dùng cho khớp nối vai..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </div>

          <div className="sm:col-span-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !selectedProductId}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm vào danh sách'}
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách BOM hiện tại */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Danh sách linh kiện hiện tại
          </h3>
          <span className="text-sm font-medium text-blue-600">
            Tổng ước tính: {formatCurrency(project.estimated_cost || 0)}
          </span>
        </div>
        <div className="">
          {!project.bom || project.bom.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có linh kiện nào trong danh sách.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sản phẩm
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    SL
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Đơn giá
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {project.bom.map((item, idx) => (
                  <tr
                    key={`${item.product_id}-${idx}`}
                    className={item.is_optional ? 'bg-yellow-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product_name}
                      {item.is_optional && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.usage_note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
