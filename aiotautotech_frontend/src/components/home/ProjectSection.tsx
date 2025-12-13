import React from 'react';
import Link from 'next/link';
import { projectService, Project } from '@/lib/api/projectService';
import ProjectCard from '@/components/projects/ProjectCard';
import { ArrowRight } from 'lucide-react';

export default async function ProjectSection() {
  let projects: Project[] = [];
  try {
    // Lấy 3 dự án mới nhất để hiển thị trên trang chủ
    projects = await projectService.getProjects(3);
  } catch (error) {
    console.error('Failed to fetch projects for home section:', error);
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="-mt-16 md:mt-0 pt-4 sm:pt-8 pb-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              PROJECT AUTOMATION & DIY
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              DỰ ÁN
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Tổng hợp các dự án tự động hoá và ứng dụng thực tế. Chia sẻ bản vẽ
              thiết kế, mã nguồn và tài liệu kỹ thuật chi tiết.
            </p>
            <div className="mt-6">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
