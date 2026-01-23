import Link from 'next/link';
import React from 'react';

interface ProjectSidebarProps {
  slug: string;
  isAdmin: boolean;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  slug,
  isAdmin,
}) => {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-28">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
          Nội dung
        </h4>
        <nav className="space-y-1 border-l border-gray-200">
          <a
            href="#overview"
            className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
          >
            1. Giới thiệu
          </a>
          <a
            href="#solution"
            className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
          >
            2. Phân tích dự án
          </a>
          <a
            href="#implementation"
            className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
          >
            3. Các bước thực hiện
          </a>
          <a
            href="#configuration"
            className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
          >
            4. Danh sách vật tư
          </a>
          <a
            href="#downloads"
            className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
          >
            5. Tài liệu
          </a>
        </nav>

        {/* Admin Quick Link */}
        {isAdmin && (
          <div className="mt-8 pt-8 border-t border-gray-100 hidden sm:block">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Admin Controls
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/projects/${slug}/edit`}
                className="text-xs font-mono text-gray-500 hover:text-blue-600"
              >
                [Edit Metadata]
              </Link>
              <Link
                href={`/admin/projects/${slug}/bom`}
                className="text-xs font-mono text-gray-500 hover:text-blue-600"
              >
                [Edit BOM]
              </Link>
              <Link
                href={`/admin/projects/${slug}/steps`}
                className="text-xs font-mono text-gray-500 hover:text-blue-600"
              >
                [Edit Log]
              </Link>
              <Link
                href={`/admin/projects/${slug}/images`}
                className="text-xs font-mono text-gray-500 hover:text-blue-600"
              >
                [Edit Gallery]
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
