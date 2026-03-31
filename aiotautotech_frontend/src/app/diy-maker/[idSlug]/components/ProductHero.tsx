// src/app/diy-maker/[idSlug]/components/ProductHero.tsx

import Link from 'next/link';

export interface ProductHeroProps {
  title?: string;
  idSlug?: string;
}

export function ProductHero({ title, idSlug }: ProductHeroProps) {
  const displayTitle =
    title && title.trim().length > 0 ? title : 'Sản phẩm chưa đặt tên';

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Bên trái: breadcrumb + title + mô tả ngắn */}
      <div className="space-y-2">
        <nav className="text-xs text-gray-500">
          <span className="inline-flex items-center gap-2">
            <Link href="/" className="text-gray-400 hover:text-gray-300">
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
            <span className="text-gray-500">&gt;</span>
            <Link href="/diy-maker" className="hover:text-gray-300">
              Sản phẩm DIY
            </Link>
          </span>
        </nav>

        <h1 className="text-xl font-semibold leading-tight text-gray-100 sm:text-3xl">
          {displayTitle}
        </h1>
      </div>
    </div>
  );
}
