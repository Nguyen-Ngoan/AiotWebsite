import React from 'react';
import Link from 'next/link';
import { projectService, Project } from '@/lib/api/projectService';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';

export const metadata = {
  title: 'Quản lý Dự án DIY - Admin',
};

export default async function AdminProjectsPage() {
  let projects: Project[] = [];
  try {
    // Lấy danh sách dự án (limit 100 cho admin)
    projects = await projectService.getProjects(100);
  } catch (error) {
    console.error('Failed to fetch projects', error);
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header navItems={navItems} />
      <main className="flex-1 py-8 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">
                Quản lý Dự án DIY
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Danh sách các dự án DIY, bài hướng dẫn chế tạo robot và tự động
                hóa.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link
                href="/admin/projects/new"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                Thêm dự án mới
              </Link>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Tên dự án
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Chi phí ước tính
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Ngày tạo
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {projects.length > 0 ? (
                        projects.map((project) => (
                          <tr key={project.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {project.title}
                              <div className="text-gray-500 font-normal text-xs">
                                {project.slug}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(project.estimated_cost)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {project.created_at
                                ? new Date(
                                    project.created_at
                                  ).toLocaleDateString('vi-VN')
                                : '-'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                              <Link
                                href={`/admin/projects/${project.slug}/bom`}
                                className="text-blue-600 hover:text-blue-900 font-semibold"
                              >
                                BOM
                              </Link>
                              <span className="text-gray-300">|</span>
                              <Link
                                href={`/admin/projects/${project.slug}/steps`}
                                className="text-blue-600 hover:text-blue-900 font-semibold"
                              >
                                Steps
                              </Link>
                              <span className="text-gray-300">|</span>
                              <Link
                                href={`/admin/projects/${project.slug}/playbooks`}
                                className="text-blue-600 hover:text-blue-900 font-semibold"
                              >
                                Playbooks
                              </Link>
                              <span className="text-gray-300">|</span>
                              <Link
                                href={`/projects/${project.slug}`}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-sm text-gray-500"
                          >
                            Chưa có dự án nào. Hãy tạo dự án mới!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
