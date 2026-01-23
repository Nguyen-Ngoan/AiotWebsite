import React from 'react';
import { MobileNav } from './MobileNav';

interface ProjectOverviewProps {
  project: {
    problem_statement?: string | null;
    description?: string | null;
  };
  slug: string;
  isAdmin: boolean;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  slug,
  isAdmin,
}) => {
  return (
    <section id="overview" className="mb-6 scroll-mt-20">
      <div className="prose prose-slate max-w-none text-gray-700">
        {project.description && (
          <p className="whitespace-pre-line">{project.description}</p>
        )}
        {project.problem_statement && (
          <>
            <h3 className="text-md font-bold text-gray-900 mb-1 mt-6 flex items-center gap-2">
              NHU CẦU
            </h3>
            <p className="lead whitespace-pre-line mb-4">
              {project.problem_statement}
            </p>
          </>
        )}
      </div>
      <div className="mt-4">
        <MobileNav slug={slug} isAdmin={isAdmin} />
      </div>
    </section>
  );
};
