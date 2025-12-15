import React from 'react';

interface ProjectHeaderProps {
  project: { title: string };
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  return (
    <div className="mb-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
        {project.title}
      </h1>
    </div>
  );
};
