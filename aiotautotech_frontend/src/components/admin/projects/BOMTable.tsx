import React from 'react';
import { BOMItem } from '@/lib/api/projectService';

interface BOMTableProps {
  items?: BOMItem[];
}

export default function BOMTable({ items = [] }: BOMTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        Chưa có danh sách linh kiện cho dự án này.
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Tính tổng chi phí (chỉ tính những món bắt buộc - không phải optional)
  const totalEstimatedCost = items.reduce((sum, item) => {
    if (!item.is_optional) {
      return sum + item.quantity * item.unit_price;
    }
    return sum;
  }, 0);

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Tên linh kiện
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
            >
              Số lượng
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
            >
              Đơn giá
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
            >
              Thành tiền
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Ghi chú
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((item, index) => {
            const total = item.quantity * item.unit_price;
            return (
              <tr
                key={`${item.product_id}-${index}`}
                className={item.is_optional ? 'bg-yellow-50' : ''}
              >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {item.product_name}
                  {item.is_optional && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                      Tùy chọn
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                  {item.quantity}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right font-medium">
                  {formatCurrency(total)}
                </td>
                <td
                  className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate"
                  title={item.usage_note}
                >
                  {item.usage_note || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td
              colSpan={3}
              className="py-3.5 pl-4 pr-3 text-right text-sm font-bold text-gray-900 sm:pl-6"
            >
              Tổng ước tính (Bắt buộc):
            </td>
            <td className="px-3 py-3.5 text-right text-sm font-bold text-blue-600">
              {formatCurrency(totalEstimatedCost)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
