import React from 'react';

interface ProjectDownloadsProps {
  project: {
    attachments?: (string | null)[] | null;
  };
  hasGallery: boolean;
}

export const ProjectDownloads: React.FC<ProjectDownloadsProps> = ({
  project,
  hasGallery,
}) => {
  return (
    <section
      id="downloads"
      className="pt-4 border-t border-gray-200 scroll-mt-20"
    >
      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4">
        <span className="text-gray-400 font-mono">
          {hasGallery ? '6.' : '5.'}
        </span>{' '}
        TÀI LIỆU
      </h2>
      <div className="flex flex-wrap gap-4">
        {project.attachments && project.attachments.length > 0 ? (
          project.attachments.map(
            (att, i) =>
              att && (
                <a
                  key={i}
                  href={att}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  Download Source ({i + 1})
                </a>
              )
          )
        ) : (
          <span className="text-sm text-gray-400 italic">
            No downloadable resources.
          </span>
        )}
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2.4-9h6m-6 4h6m-6-9h6M5 3a2 2 0 012-2h10a2 2 0 012 2v2H5V3z"
            ></path>
          </svg>
          Print Spec Sheet
        </button>
      </div>
    </section>
  );
};
