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

const navItems: NavItem[] = [
  {
    href: '#diy-maker',
    title: 'Sản phẩm cho DIY',
    subtitle: 'Linh kiện – ESP32 – CNC nhỏ',
  },
  {
    href: '#automation',
    title: 'Máy tự động cho sản xuất nhỏ',
    subtitle: 'Máy phun men – bơm hồ – trục tuyến tính',
  },
  {
    href: '#iot-farm',
    title: 'Sản phẩm nông nghiệp thông minh',
    subtitle: 'Tưới tự động – giám sát độ ẩm',
  },
  {
    href: '#docs-support',
    title: 'Hướng dẫn kỹ thuật',
    subtitle: 'Code mẫu – sơ đồ – tư vấn kỹ thuật',
  },
];

const Header = forwardRef<HTMLElement>((props, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2 md:py-3 md:px-6">
        {/* HÀNG TRÊN: LOGO + ICONS */}
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold transition-opacity duration-200 hover:opacity-75"
          >
            {/* Logo tạm: Apple */}
            <Image
              src="/apple_logo.svg"
              alt="AIOT AutoTech Logo"
              width={20} // Đặt chiều rộng thực tế của logo
              height={20} // Đặt chiều cao thực tế của logo
              className="h-5 w-auto invert dark:invert-0"
            />
            <span className="text-sm font-semibold tracking-tight text-white sm:inline">
              AIOT AutoTech
            </span>
          </Link>

          {/* ICONS BÊN PHẢI */}
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
        </div>

        {/* HÀNG DƯỚI: TOP NAVIGATION DESKTOP (4 MỤC, 2 DÒNG) */}
        <div className="mt-3 hidden md:block">
          <div className="grid grid-cols-4 gap-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-white/10"
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
          </div>
        </div>

        {/* MOBILE MENU: CHỈ HIỂN THỊ TRÊN MÀN HÌNH NHỎ */}
        <MobileMenu open={isMenuOpen} items={navItems} onClose={closeMenu} />
      </nav>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;
