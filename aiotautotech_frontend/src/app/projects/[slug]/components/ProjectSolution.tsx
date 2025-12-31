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
        <span className="text-gray-400 font-mono">1.</span> PHÂN TÍCH DỰ ÁN
        {isAdmin && (
          <Link
            href={`/admin/projects/${project.slug}/solution`}
            className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
          >
            [Edit]
          </Link>
        )}
      </h2>

      {project.solution_analysis && (
        <DetailedAnalysisPanel htmlContent={project.solution_analysis} />
      )}
    </section>
  );
};
