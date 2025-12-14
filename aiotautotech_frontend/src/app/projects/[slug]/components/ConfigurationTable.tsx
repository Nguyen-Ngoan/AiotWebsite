import Link from 'next/link';
import React from 'react';

// NOTE: It would be best to define and share a specific type for the `project` object.
// For now, we'll use `any` to match the existing structure.
interface ConfigurationTableProps {
  project: any;
  isAdmin: boolean;
  hasGallery: boolean;
}

export const ConfigurationTable: React.FC<ConfigurationTableProps> = ({
  project,
  isAdmin,
  hasGallery,
}) => {
  const hasLiveItems =
    (project.products && project.products.length > 0) ||
    (project.materials && project.materials.length > 0);

  return (
    <section id="configuration" className="mb-4 scroll-mt-20">
      <h2 className="group text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-gray-400 font-mono">
          {hasGallery ? '5.' : '4.'}
        </span>{' '}
        DANH SÁCH VẬT TƯ
        {isAdmin && (
          <Link
            href={`/admin/projects/${project.slug}/bom`}
            className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
          >
            [Edit]
          </Link>
        )}
      </h2>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="pl-4 pr-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
              >
                Component
              </th>
              <th
                scope="col"
                className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
              >
                Qty
              </th>
              <th
                scope="col"
                className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
              >
                Subtotal
              </th>
              <th
                scope="col"
                className="pl-2 pr-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
              >
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Render Live Products */}
            {project.products?.map((item: any) => (
              <tr key={`prod-${item.id}`} className="hover:bg-gray-50">
                <td className="pl-4 pr-2 py-3 text-xs sm:text-sm font-medium text-gray-900">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {item.product.title}
                  </Link>
                  {item.product.short_description && (
                    <div className="hidden sm:block text-xs text-gray-500 font-normal">
                      {item.product.short_description}
                    </div>
                  )}
                </td>
                <td className="px-2 py-3 text-xs sm:text-sm text-gray-500 text-right font-mono">
                  {new Intl.NumberFormat('vi-VN').format(
                    item.product.base_price
                  )}
                </td>
                <td className="px-2 py-3 text-xs sm:text-sm text-gray-500 text-right font-mono">
                  {item.quantity}
                </td>
                <td className="px-2 py-3 text-xs sm:text-sm text-gray-900 text-right font-mono font-medium">
                  {new Intl.NumberFormat('vi-VN').format(item.subtotal)}
                </td>
                <td className="pl-2 pr-4 py-3 text-xs text-gray-500 uppercase">
                  Pro
                </td>
              </tr>
            ))}

            {/* Render Live Materials */}
            {project.materials?.map((item: any) => (
              <tr key={`mat-${item.id}`} className="hover:bg-gray-50">
                <td className="pl-4 pr-2 py-3 text-xs sm:text-sm font-medium text-gray-900">
                  {item.material.name}
                  <div className="hidden sm:block text-xs text-gray-500 font-normal">
                    {item.material.specifications}
                  </div>
                </td>
                <td className="px-2 py-3 text-xs sm:text-sm text-gray-500 text-right font-mono">
                  {new Intl.NumberFormat('vi-VN').format(
                    item.material.unit_price
                  )}
                </td>
                <td className="px-2 py-3 text-xs sm:text-sm text-gray-500 text-right font-mono">
                  {item.quantity}
                </td>
                <td className="px-2 py-3 text-xs sm:text-sm text-gray-900 text-right font-mono font-medium">
                  {new Intl.NumberFormat('vi-VN').format(item.subtotal)}
                </td>
                <td className="pl-2 pr-4 py-3 text-xs text-gray-500 uppercase">
                  Mat
                </td>
              </tr>
            ))}

            {/* Fallback to Legacy BOM or show no data message */}
            {!hasLiveItems &&
              (project.bom && project.bom.length > 0 ? (
                project.bom.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="pl-4 pr-2 py-3 text-xs sm:text-sm font-medium text-gray-900">
                      <Link
                        href={`/diy-maker/${item.product_id}`}
                        className="hover:text-blue-600 hover:underline decoration-blue-600/30"
                        title="View Component Details"
                      >
                        {item.product_name}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-xs sm:text-sm text-gray-500 text-right font-mono">
                      {new Intl.NumberFormat('vi-VN').format(item.unit_price)}
                    </td>
                    <td className="px-2 py-3 text-xs sm:text-sm text-gray-500 text-right font-mono">
                      {item.quantity}
                    </td>
                    <td className="px-2 py-3 text-xs sm:text-sm text-gray-900 text-right font-mono font-medium">
                      {new Intl.NumberFormat('vi-VN').format(
                        item.unit_price * item.quantity
                      )}
                    </td>
                    <td className="pl-2 pr-4 py-3 text-xs text-gray-500 uppercase">
                      Snapshot
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-xs sm:text-sm text-gray-500 italic"
                  >
                    No configuration data available.
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Display Total Cost if available (Live Reference) */}
      {typeof project.total_cost === 'number' && project.total_cost > 0 && (
        <div className="mb-4 mt-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
          <span className="text-sm text-blue-900 font-medium">
            Chi phí ước tính
          </span>
          <span className="text-lg font-bold text-blue-700">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(project.total_cost)}
          </span>
        </div>
      )}
    </section>
  );
};
