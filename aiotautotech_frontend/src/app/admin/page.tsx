import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  FolderOpenIcon,
  PlusCircleIcon,
  CubeIcon,
  PrinterIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';

export const metadata = {
  title: 'Trang quản trị - AIOT AutoTech',
  description: 'Điều hướng nhanh tới các mục quản lý nội dung và cấu hình.',
};

const LINKS: {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    href: '/admin/products',
    title: 'Quản lý sản phẩm',
    description: 'Danh sách, thêm, sửa, xóa sản phẩm DIY.',
    icon: ShoppingBagIcon,
  },
  {
    href: '/admin/projects',
    title: 'Quản lý dự án',
    description: 'Danh sách dự án DIY, chỉnh sửa metadata.',
    icon: FolderOpenIcon,
  },
  {
    href: '/admin/projects/new',
    title: 'Tạo dự án mới',
    description: 'Thêm dự án DIY mới.',
    icon: PlusCircleIcon,
  },
  {
    href: '/admin/materials',
    title: 'Quản lý vật tư',
    description: 'Danh sách vật tư, BOM.',
    icon: CubeIcon,
  },
  {
    href: '/admin/printing/parts',
    title: 'In 3D — Parts',
    description: 'Danh sách part in 3D.',
    icon: PrinterIcon,
  },
  {
    href: '/admin/printing/settings',
    title: 'Cấu hình In 3D',
    description: 'Máy in, nhựa, chi phí.',
    icon: Cog6ToothIcon,
  },
  {
    href: '/admin/technical-docs',
    title: 'Quản lý tài liệu kỹ thuật',
    description: 'Datasheet, schematic, file 3D…',
    icon: DocumentTextIcon,
  },
  {
    href: '/admin/posts/new',
    title: 'Bài viết blog',
    description: 'Tạo bài viết mới.',
    icon: PencilSquareIcon,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header navItems={navItems} />
      <main className="flex-1 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Trang quản trị
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Chọn mục cần quản lý. Các liên kết dưới đây trỏ tới giao diện admin hiện
              có trên site.
            </p>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <span className="inline-flex rounded-lg bg-blue-50 p-2 text-blue-700">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span className="mt-3 text-base font-semibold text-gray-900">
                      {item.title}
                    </span>
                    <span className="mt-1 text-sm text-gray-600">
                      {item.description}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
