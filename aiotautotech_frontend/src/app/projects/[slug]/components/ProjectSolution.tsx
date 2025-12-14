import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { DetailedAnalysisPanel } from './DetailedAnalysisPanel';

interface ProjectSolutionProps {
  project: {
    slug: string;
    block_diagram_url?: string | null;
    thumbnail_url?: string | null;
    solution_analysis?: string | null;
    video_url?: string | null;
  };
  isAdmin: boolean;
}

export const ProjectSolution: React.FC<ProjectSolutionProps> = ({
  project,
  isAdmin,
}) => {
  return (
    <section id="solution" className="mb-6 scroll-mt-20">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-gray-400 font-mono">2.</span> PHÂN TÍCH DỰ ÁN
        {isAdmin && (
          <Link
            href={`/admin/projects/${project.slug}/solution`}
            className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
          >
            [Edit]
          </Link>
        )}
      </h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-4">
        {/* Image as Diagram */}
        {project.block_diagram_url || project.thumbnail_url ? (
          <div className="relative aspect-video w-full overflow-hidden rounded bg-white">
            <Image
              src={project.block_diagram_url || project.thumbnail_url || ''}
              alt="System Diagram"
              fill
              className="object-contain cursor-zoom-in"
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 italic">
            No system diagram available.
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 italic text-center font-mono">
        Figure 1: System Architecture & Design Overview
      </p>

      {project.solution_analysis && (
        <DetailedAnalysisPanel htmlContent={project.solution_analysis} />
      )}

      {project.video_url && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            VIDEO
            {isAdmin && (
              <Link
                href={`/admin/projects/${project.slug}/edit`}
                className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600 normal-case"
              >
                [Edit]
              </Link>
            )}
          </h3>
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 bg-black">
            <iframe
              src={project.video_url.replace('watch?v=', 'embed/')}
              title="Video hướng dẫn"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};
