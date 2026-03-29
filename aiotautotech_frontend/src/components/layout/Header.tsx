// src/components/Header.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { MobileMenu, NavItem } from '@/components/layout/MobileMenu';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useMemo, useState, forwardRef } from 'react';

interface HeaderProps {
  /** Giữ để tương thích với các trang truyền navItems; menu hiển thị cố định trong Header. */
  navItems: NavItem[];
}

/** Menu chính: HOME, SẢN PHẨM, DỰ ÁN, TÀI LIỆU KỸ THUẬT, BLOG */
const MAIN_NAV_ITEMS: NavItem[] = [
  { href: '/', title: 'HOME', subtitle: 'Trang chủ' },
  {
    href: '/diy-maker',
    title: 'SẢN PHẨM',
    subtitle: 'Linh kiện DIY – Máy tự động',
  },
  { href: '/projects', title: 'DỰ ÁN', subtitle: 'Các dự án DIY' },
  {
    href: '/technical-docs',
    title: 'TÀI LIỆU KỸ THUẬT',
    subtitle: 'Hướng dẫn, datasheet, file 3D',
  },
  { href: '/blog', title: 'BLOG', subtitle: 'Blog kỹ thuật' },
];

const ADMIN_NAV_ITEM: NavItem = {
  href: '/admin',
  title: 'ADMIN',
  subtitle: 'Trang quản trị',
};

const Header = forwardRef<HTMLElement, HeaderProps>(({ navItems: _navItems }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, isLoading } = useIsAdmin();

  const mainNavItems = useMemo(() => {
    if (isLoading) return MAIN_NAV_ITEMS;
    return isAdmin ? [...MAIN_NAV_ITEMS, ADMIN_NAV_ITEM] : MAIN_NAV_ITEMS;
  }, [isAdmin, isLoading]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      ref={ref}
      className="
        fixed top-0 left-0 z-50 w-full 
        bg-[#1d67b0]
        shadow-md
        transition-colors duration-300
        min-h-10 md:min-h-28
      "
    >
      <div className="mx-auto flex max-w-6xl flex-col">
        {/* HÀNG TRÊN: LOGO + ICONS */}
        <nav className="flex items-center justify-between px-4 py-2 md:px-6 md:py-3">
          <div className="flex items-center">
            {/* LOGO */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold transition-opacity duration-200 hover:opacity-75"
            >
              <Image
                src="/aiotautotech-icon.png"
                alt="AIOT AutoTech Logo"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-sm font-semibold tracking-tight text-white sm:inline">
                AIOT AutoTech
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* SEARCH ICON */}
            <Link
              href="#"
              className="text-gray-200 transition-colors duration-200 hover:text-white"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Link>

            {/* MENU ICON: CHỈ HIỂN THỊ TRÊN MOBILE */}
            <button
              type="button"
              onClick={toggleMenu}
              className="text-gray-200 transition-colors duration-200 hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* HÀNG DƯỚI: TOP NAVIGATION DESKTOP */}
        <div className="hidden md:block">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-start justify-center gap-x-1.5 gap-y-2 px-4 py-2 text-sm md:gap-x-2 md:px-6">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.href === '/admin'
                    ? 'group shrink-0 bg-amber-500/25 px-5 py-2 ring-1 ring-amber-300/40 transition-colors duration-200 hover:bg-amber-500/35 sm:px-6 lg:px-7'
                    : 'group shrink-0 bg-black/10 px-5 py-2 transition-colors duration-200 hover:bg-black/20 sm:px-6 lg:px-7'
                }
              >
                <div className="flex flex-col items-center leading-tight">
                  <span className="whitespace-nowrap font-semibold text-white">
                    {item.title}
                  </span>
                  <span
                    className="
                      mt-0.5 hidden text-center text-xs text-gray-300
                      group-hover:text-white lg:block
                    "
                  >
                    {item.subtitle}
                  </span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* MOBILE MENU: CHỈ HIỂN THỊ TRÊN MÀN HÌNH NHỎ */}
        <MobileMenu
          open={isMenuOpen}
          items={mainNavItems}
          onClose={closeMenu}
        />
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;
