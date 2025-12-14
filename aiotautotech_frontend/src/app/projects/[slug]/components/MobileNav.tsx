import Link from 'next/link';
import React from 'react';

interface MobileNavProps {
  slug: string;
  hasGallery: boolean;
  isAdmin: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  slug,
  hasGallery,
  isAdmin,
}) => {
  return (
    <div className="lg:hidden mb-4">
      {/* Mobile Admin Controls */}
      {isAdmin && (
        <div className="mb-2 px-4 py-2 bg-gray-50 border border-gray-200">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/projects/${slug}/edit`}
              className="text-xs font-mono text-blue-600 hover:underline"
            >
              [Metadata]
            </Link>
            <Link
              href={`/admin/projects/${slug}/bom`}
              className="text-xs font-mono text-blue-600 hover:underline"
            >
              [BOM]
            </Link>
            <Link
              href={`/admin/projects/${slug}/steps`}
              className="text-xs font-mono text-blue-600 hover:underline"
            >
              [Log]
            </Link>
            <Link
              href={`/admin/projects/${slug}/images`}
              className="text-xs font-mono text-blue-600 hover:underline"
            >
              [Gallery]
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Table of Contents */}
      <div className="px-5 py-2 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          NỘI DUNG
        </h4>
        <nav className="flex flex-col space-y-2">
          <a
            href="#overview"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
          >
            <span className="w-6 text-gray-400 font-mono">1.</span> Giới thiệu
          </a>
          <a
            href="#solution"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
          >
            <span className="w-6 text-gray-400 font-mono">2.</span> Phân tích dự
            án
          </a>
          {hasGallery && (
            <a
              href="#gallery"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
            >
              <span className="w-6 text-gray-400 font-mono">3.</span> Thư viện
              ảnh
            </a>
          )}
          <a
            href="#implementation"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
          >
            <span className="w-6 text-gray-400 font-mono">
              {hasGallery ? '4.' : '3.'}
            </span>{' '}
            Các bước thực hiện
          </a>
          <a
            href="#configuration"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
          >
            <span className="w-6 text-gray-400 font-mono">
              {hasGallery ? '5.' : '4.'}
            </span>{' '}
            Danh sách vật tư
          </a>
          <a
            href="#downloads"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
          >
            <span className="w-6 text-gray-400 font-mono">
              {hasGallery ? '6.' : '5.'}
            </span>{' '}
            Tài liệu
          </a>
        </nav>
      </div>
    </div>
  );
};
