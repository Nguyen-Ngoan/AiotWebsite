// src/components/MobileMenu.tsx

import Link from 'next/link';

export type NavItem = {
  href: string;
  title: string;
  subtitle: string;
};

type MobileMenuProps = {
  open: boolean;
  items: NavItem[];
  onClose: () => void;
};

export function MobileMenu({ open, items, onClose }: MobileMenuProps) {
  if (!open) return null;

  const adminItems: NavItem[] = [
    {
      href: '/admin/projects',
      title: 'Quản lý Dự án',
      subtitle: 'Danh sách dự án DIY',
    },
    {
      href: '/admin/projects/new',
      title: 'Tạo Dự án Mới',
      subtitle: 'Thêm dự án DIY',
    },
    {
      href: '/admin/materials',
      title: 'Quản lý vật tư',
      subtitle: 'Danh sách vật tư',
    },
    {
      href: '/admin/printing/parts',
      title: 'Quản lý In 3D (Parts)',
      subtitle: 'Danh sách part in 3D',
    },
    {
      href: '/admin/printing/settings',
      title: 'Cấu hình In 3D',
      subtitle: 'Máy in, nhựa, chi phí',
    },
  ];

  return (
    <div className="mt-3 md:hidden">
      <div className="space-y-2 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-md dark:border-gray-800 dark:bg-gray-900/95">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="block rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.title}
              </span>
              <span className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {item.subtitle}
              </span>
            </div>
          </Link>
        ))}

        <Link
          href="/parts"
          onClick={onClose}
          className="block rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Sản phẩm In 3D
            </span>
            <span className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
              Danh sách sản phẩm in 3D
            </span>
          </div>
        </Link>

        {/* Admin Section */}
        <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

        <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Admin
        </div>

        {adminItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="block rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.title}
              </span>
              <span className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {item.subtitle}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
