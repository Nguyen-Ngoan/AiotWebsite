import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/lib/api/projectService';
import { Clock, Banknote, Gauge, ArrowRight } from 'lucide-react';

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

  // Logic giả lập Badge "Best for..." dựa trên tags hoặc độ khó
  const getBadge = () => {
    if (project.tags?.includes('SME')) return 'Best for SME';
    if (project.complexity_mechanical === 1) return 'Beginner Friendly';
    return 'Popular';
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[#ffca47] bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-200">
      {/* Image Section - 16:9 Aspect Ratio */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <Gauge className="h-12 w-12 opacity-20" />
          </div>
        )}

        {/* Badge Overlay */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-md bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
            {getBadge()}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">
          {project.description}
        </p>

        {/* Specs Row with Icons */}
        <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-600">
          <div
            className="flex items-center gap-1.5"
            title="Thời gian thực hiện"
          >
            <Clock className="h-4 w-4 text-gray-400" />
            <span>
              {project.estimated_hours ? `${project.estimated_hours}h` : 'N/A'}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5"
            title="Độ phức tạp tổng thể"
          >
            <Gauge className="h-4 w-4 text-gray-400" />
            <span>
              Level{' '}
              {Math.max(
                project.complexity_mechanical || 1,
                project.complexity_electrical || 1
              )}
            </span>
          </div>
          {/* Payload giả lập hoặc lấy từ tags nếu có */}
          <div className="flex items-center gap-1.5" title="Tải trọng (Ví dụ)">
            <div className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] font-mono">
              kg
            </div>
            <span>--</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between bg-gray-50 px-5 py-3 border-t border-gray-100">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            Ước tính
          </span>
          <span className="font-mono text-sm font-bold text-green-600">
            {formatCurrency(project.estimated_cost)}
          </span>
        </div>
        <Link
          href={`/projects/${project.slug}`}
          className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
        >
          Chi tiết <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
