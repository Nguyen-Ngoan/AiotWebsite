'use client';

import React, { useEffect, useState } from 'react';
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
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Chỉnh sửa dự án: {project.title}
          </h2>
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
