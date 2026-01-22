import Link from 'next/link';
import React from 'react';

export const ProjectBreadcrumb: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-2 border-b border-gray-100">
      <nav className="flex" aria-label="Breadcrumb">
        <ol role="list" className="flex items-center space-x-2">
          <li className="flex">
            <div className="flex items-center">
              <Link href="/" className="text-gray-400 hover:text-gray-500">
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Trang chủ</span>
              </Link>
            </div>
          </li>
          <li>
            <span className="text-gray-300">&gt;</span>
          </li>
          <li>
            <Link
              href="/projects"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Projects
            </Link>
          </li>
        </ol>
      </nav>
    </div>
  );
};
