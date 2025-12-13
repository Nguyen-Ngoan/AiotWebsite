import React from 'react';
import Link from 'next/link';
import { projectService, Project } from '@/lib/api/projectService';
import ProjectCard from '@/components/projects/ProjectCard';
import FilterSidebar from '@/components/projects/FilterSidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import { Search, SlidersHorizontal } from 'lucide-react';

export const metadata = {
  title: 'Dự án DIY - AiotAutotech',
  description:
    'Danh sách các dự án DIY, hướng dẫn chế tạo robot và tự động hóa.',
};

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    // Lấy danh sách dự án (Server Component fetch)
    projects = await projectService.getProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
  }

  return (
    <>
      <Header navItems={navItems} />
      <div className="bg-gray-50 min-h-screen pt-12 md:pt-28">
        <nav
          className="flex border-b border-gray-200 bg-gray-50 py-3"
          aria-label="Breadcrumb"
        >
          <ol
            role="list"
            className="mx-auto flex w-full max-w-7xl space-x-4 px-4 sm:px-6 lg:px-8"
          >
            <li className="flex">
              <div className="flex items-center">
                <Link href="/" className="text-gray-400 hover:text-gray-500">
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">Trang chủ</span>
                </Link>
              </div>
            </li>
            <li className="flex">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500">
                  Dự án DIY
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Dự án DIY & Giải pháp
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-500">
              Kho tàng kiến thức và hướng dẫn chế tạo robot, hệ thống tự động
              hóa cho mọi cấp độ.
            </p>
          </div>

          {/* Main Layout: Sidebar + Grid */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <FilterSidebar />

            {/* Main Content */}
            <div className="flex-1">
              {/* Search & Sort Bar */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="relative w-full sm:max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                    placeholder="Tìm kiếm dự án, linh kiện..."
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-48">
                    <select className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border">
                      <option>Mới nhất</option>
                      <option>Giá: Thấp đến Cao</option>
                      <option>Giá: Cao đến Thấp</option>
                      <option>Độ khó: Dễ đến Khó</option>
                    </select>
                  </div>
                  <button className="lg:hidden p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Project Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">
                      Hiện chưa có dự án nào phù hợp với bộ lọc.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination (Placeholder) */}
              {projects.length > 0 && (
                <div className="mt-10 flex justify-center">
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      aria-current="page"
                      className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      1
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      2
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      3
                    </button>
                    <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
