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
          <Link href="/" className="hover:text-gray-300">
            Trang chủ
          </Link>
          <span className="mx-1">/</span>
          <Link href="/diy-maker" className="hover:text-gray-300">
            DIY &amp; Maker
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-300 line-clamp-1 max-w-[260px] sm:max-w-[360px]">
            {displayTitle}
          </span>
        </nav>

        <h1 className="text-2xl font-semibold leading-tight text-gray-100 sm:text-3xl">
          {displayTitle}
        </h1>
      </div>
    </div>
  );
}
