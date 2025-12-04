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
import { useState, forwardRef } from 'react';

interface HeaderProps {
  navItems: NavItem[];
}

const Header = forwardRef<HTMLElement, HeaderProps>(({ navItems }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const filteredNavItems = navItems.filter(
    (item) => item.title !== 'Giải pháp Tự động hóa'
  );

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
          <nav className="mx-auto flex max-w-6xl items-start justify-between gap-2 px-4 py-2 text-sm md:px-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex-1 rounded-lg bg-black/10 px-2 py-2 text-center transition-colors duration-200 hover:bg-black/20"
              >
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-white">{item.title}</span>
                  <span
                    className="
                      hidden lg:block
                      mt-0.5 text-xs text-gray-300 group-hover:text-white
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
          items={filteredNavItems}
          onClose={closeMenu}
        />
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;
