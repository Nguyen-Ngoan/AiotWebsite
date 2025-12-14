'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import ProjectForm from '@/components/admin/projects/ProjectForm';
import {
  projectService,
  CreateProjectData,
  Project,
} from '@/lib/api/projectService';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const handleUpdate = async (data: CreateProjectData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updatedProject = await projectService.updateProject(slug, data);
      // Nếu slug thay đổi, cần redirect sang URL mới, nếu không thì về trang BOM hoặc danh sách
      if (updatedProject.slug !== slug) {
        router.push(`/admin/projects/${updatedProject.slug}/bom`);
      } else {
        router.push(`/admin/projects/${slug}/bom`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật dự án.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
    );
  if (!project)
    return (
      <div className="p-8 text-center text-red-600">Dự án không tồn tại</div>
    );

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại chi tiết dự án
        </Link>
      </div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight">
            Edit Project
          </h2>
          <p className="mt-1 text-sm text-gray-500">{project.title}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <ProjectForm
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
        initialData={project}
        submitLabel="Cập nhật dự án"
      />
    </div>
  );
}
