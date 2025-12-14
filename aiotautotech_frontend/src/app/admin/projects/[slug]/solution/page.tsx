'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectService, Project } from '@/lib/api/projectService';
import PostEditor from '@/components/admin/PostEditor';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function EditProjectSolutionPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const fetchedProject = await projectService.getProjectBySlug(slug);
        setProject(fetchedProject);
        setContent(fetchedProject.solution_analysis || '');
      } catch (err) {
        setError('Không thể tải dữ liệu dự án.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await projectService.updateProject(project.slug, {
        ...project,
        solution_analysis: content,
      } as any); // Cast as any to allow partial update
      setSuccessMessage('Đã lưu phân tích giải pháp thành công!');
      setTimeout(() => setSuccessMessage(null), 3000); // Hide after 3s
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Đang tải trình soạn thảo...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/projects/${slug}`}
                className="text-gray-500 hover:text-gray-800"
                title="Quay lại trang dự án"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Chỉnh sửa Phân tích Giải pháp
                </h1>
                <p className="text-sm text-gray-500 truncate">
                  Dự án: {project?.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {successMessage && (
                <p className="text-sm text-green-600">{successMessage}</p>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <PostEditor
            initialContent={content}
            onChange={(html) => setContent(html)}
            placeholder="Nhập nội dung phân tích giải pháp tại đây. Bạn có thể sử dụng Markdown hoặc các công cụ định dạng..."
          />
        </div>
      </main>
    </div>
  );
}
