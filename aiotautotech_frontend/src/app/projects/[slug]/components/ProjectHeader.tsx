import React from 'react';

interface ProjectHeaderProps {
  project: {
    title: string;
    version?: string | null;
    complexity_mechanical?: number | null;
  };
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  return (
    <div className="mb-4 pb-0">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
        {project.title}
      </h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0 text-sm text-gray-500 font-mono">
        <span title="Phiên bản hiện tại">
          Ver: {project.version || '1.0.0'}
        </span>
        <span title="Ngày cập nhật cuối cùng">
          Last Updated: {new Date().toLocaleDateString('en-US')}
        </span>
        <span title="Tác giả">Author: AiotAutotech Engineering</span>
        {project.complexity_mechanical && (
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
            Level: {project.complexity_mechanical}/3
          </span>
        )}
      </div>
    </div>
  );
};
