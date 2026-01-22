'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { projectService, Project } from '@/lib/api/projectService';
import PlaybookManager from '@/components/admin/projects/PlaybookManager';

export default function ProjectPlaybooksPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await projectService.getProjectBySlug(slug);
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin dự án.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải dữ liệu dự án...
      </div>
    );
  }

  if (!project || error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error || 'Dự án không tồn tại'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
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
            Playbooks & Prompts
          </h2>
          <p className="mt-1 text-sm text-gray-500">{project.title}</p>
        </div>
      </div>

      <PlaybookManager projectId={project.id} />
    </div>
  );
}
