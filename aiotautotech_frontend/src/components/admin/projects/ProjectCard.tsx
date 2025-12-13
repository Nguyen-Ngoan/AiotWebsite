import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/lib/api/projectService';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'Liên hệ';
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md h-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200 sm:aspect-[4/3]">
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
          <Link href={`/projects/${project.slug}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {project.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {project.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <span className="text-sm font-medium text-blue-600">
            {formatCurrency(project.estimated_cost)}
          </span>
        </div>
      </div>
    </div>
  );
}
