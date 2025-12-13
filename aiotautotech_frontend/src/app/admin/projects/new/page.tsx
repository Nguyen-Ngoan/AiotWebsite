'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/admin/projects/ProjectForm';
import { projectService, CreateProjectData } from '@/lib/api/projectService';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCreate = async (data: CreateProjectData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newProject = await projectService.createProject(data);
      // Sau khi tạo xong, chuyển hướng đến trang thêm linh kiện (BOM)
      // vì một dự án DIY thường bắt đầu bằng việc xác định linh kiện.
      router.push(`/admin/projects/${newProject.slug}/bom`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã xảy ra lỗi khi tạo dự án.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Tạo dự án mới
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Điền thông tin cơ bản để bắt đầu một dự án DIY mới.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <ProjectForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </div>
  );
}
