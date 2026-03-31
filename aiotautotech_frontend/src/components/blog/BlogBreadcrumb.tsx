'use client';

import Link from 'next/link';

export type BlogBreadcrumbTone = 'light' | 'dark';

type BlogBreadcrumbProps = {
  tone?: BlogBreadcrumbTone;
  /** `list`: Trang chủ &gt; Blog (Blog là trang hiện tại). `detail`: Trang chủ &gt; Blog (Blog là link về danh sách). */
  page: 'list' | 'detail';
  className?: string;
};

const homeIcon = (
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
);

export function BlogBreadcrumb({
  tone = 'light',
  page,
  className = '',
}: BlogBreadcrumbProps) {
  const isDark = tone === 'dark';
  const sepClass = isDark ? 'text-gray-600' : 'text-gray-300';
  const homeLinkClass = isDark
    ? 'text-gray-400 hover:text-gray-300'
    : 'text-gray-400 hover:text-gray-500';
  const blogLinkClass = isDark
    ? 'font-medium text-blue-400 hover:text-blue-300'
    : 'font-medium text-gray-800';
  const blogCurrentClass = isDark
    ? 'font-medium text-gray-200'
    : 'font-medium text-gray-800';

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <li className="flex min-w-0 items-center">
          <Link href="/" className={`flex items-center ${homeLinkClass}`}>
            {homeIcon}
            <span className="sr-only">Trang chủ</span>
          </Link>
        </li>
        <li className={sepClass} aria-hidden="true">
          &gt;
        </li>
        {page === 'list' ? (
          <li className={blogCurrentClass}>Blog</li>
        ) : (
          <li>
            <Link href="/blog" className={blogLinkClass}>
              Blog
            </Link>
          </li>
        )}
      </ol>
    </nav>
  );
}
