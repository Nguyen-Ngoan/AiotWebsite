import Link from 'next/link';
import React from 'react';

interface ProjectImplementationLogProps {
  project: {
    slug: string;
  };
  sortedSteps: {
    title: string;
    content: string;
    image_url?: string | null;
  }[];
  isAdmin: boolean;
}

export const ProjectImplementationLog: React.FC<
  ProjectImplementationLogProps
> = ({ project, sortedSteps, isAdmin }) => {
  return (
    <section id="implementation" className="mb-6 scroll-mt-20">
      <h2 className="group text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-gray-400 font-mono">3.</span> CÁC BƯỚC THỰC HIỆN
        {isAdmin && (
          <Link
            href={`/admin/projects/${project.slug}/steps`}
            className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
          >
            [Edit]
          </Link>
        )}
      </h2>
      <div className="space-y-8 border-l-2 border-gray-100 pl-6 ml-2">
        {sortedSteps.length > 0 ? (
          sortedSteps.map((step, index) => (
            <div key={index} className="relative group">
              <span className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-gray-200 text-xs font-mono font-medium text-gray-500 group-hover:border-gray-900 group-hover:text-gray-900 transition-colors">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <div className="prose prose-slate max-w-none text-gray-600 text-sm">
                <div className="whitespace-pre-line">{step.content}</div>
              </div>
              {step.image_url && (
                <div className="mt-4">
                  <img
                    src={step.image_url}
                    alt={step.title}
                    className="rounded border border-gray-200 cursor-zoom-in hover:shadow-lg transition-shadow max-h-96 object-contain bg-gray-50"
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">
            No implementation steps recorded.
          </p>
        )}
      </div>
    </section>
  );
};
