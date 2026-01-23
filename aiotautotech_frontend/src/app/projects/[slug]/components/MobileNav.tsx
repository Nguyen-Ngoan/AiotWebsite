'use client';

import Link from 'next/link';
import React, { useState } from 'react';

interface MobileNavProps {
  slug: string;
  isAdmin: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({ slug, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden mb-4">
      {/* Mobile Table of Contents */}
      <div className="px-5 py-2 bg-gray-50 rounded-xl border border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center text-left"
        >
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            NỘI DUNG
          </h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px]' : 'max-h-0'
          }`}
        >
          <nav className="mt-4 flex flex-col space-y-2">
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
              <span className="w-6 text-gray-400 font-mono">2.</span> Phân tích
              dự án
            </a>
            <a
              href="#implementation"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
            >
              <span className="w-6 text-gray-400 font-mono">3.</span> Các bước
              thực hiện
            </a>
            <a
              href="#configuration"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
            >
              <span className="w-6 text-gray-400 font-mono">4.</span> Danh sách
              vật tư
            </a>
            <a
              href="#downloads"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
            >
              <span className="w-6 text-gray-400 font-mono">5.</span> Tài liệu
            </a>
          </nav>
          {/* Mobile Admin Controls */}
          {isAdmin && (
            <div className="mt-4 rounded-md border border-gray-200 bg-white px-3 py-2">
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
        </div>
      </div>
    </div>
  );
};
