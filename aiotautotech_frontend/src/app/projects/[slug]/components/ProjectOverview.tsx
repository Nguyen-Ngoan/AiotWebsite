import React from 'react';

interface ProjectOverviewProps {
  project: {
    problem_statement?: string | null;
    description?: string | null;
  };
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
}) => {
  return (
    <section id="overview" className="mb-6 scroll-mt-20">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-gray-400 font-mono">1.</span> GIỚI THIỆU
      </h2>
      <div className="prose prose-slate max-w-none text-gray-700">
        <p className="lead whitespace-pre-line">
          {project.problem_statement || project.description}
        </p>
      </div>
    </section>
  );
};
