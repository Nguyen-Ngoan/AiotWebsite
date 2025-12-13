'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { projectService, Project } from '@/lib/api/projectService';
import BOMManager from '@/components/admin/projects/BOMManager';
import Link from 'next/link';

export default function ProjectBOMPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      const data = await projectService.getProjectBySlug(slug);
      setProject(data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải thông tin dự án.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProject();
    }
  }, [slug]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải dữ liệu dự án...
      </div>
    );
  if (error || !project)
    return (
      <div className="p-8 text-center text-red-600">
        {error || 'Dự án không tồn tại'}
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Quản lý BOM: {project.title}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Slug: {project.slug}
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href={`/admin/projects/${slug}/steps`}
            className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Tiếp theo: Hướng dẫn &rarr;
          </Link>
        </div>
      </div>

      <BOMManager project={project} onUpdate={fetchProject} />
    </div>
  );
}
