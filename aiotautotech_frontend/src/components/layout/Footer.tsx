// src/components/Footer.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const brandName = 'AIOT AutoTech'; // Đổi tên thương hiệu tại đây

/** Giống menu chính / mobile menu: chữ hoa + tracking */
const footerHeadingClass =
  'text-sm font-semibold uppercase tracking-wide text-white';
const footerLinkClass =
  'uppercase tracking-wide hover:underline';
const footerListTextClass = 'uppercase tracking-wide';

type SectionId = 'products' | 'projects' | 'docs' | 'blog' | 'contact';

type MobileSectionProps = {
  id: SectionId;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  withBorderBottom?: boolean;
};

function MobileAccordionSection({
  title,
  isOpen,
  onToggle,
  children,
  withBorderBottom = true,
}: MobileSectionProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState<string>('0px');

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight + 'px');
    } else {
      setMaxHeight('0px');
    }
  }, [isOpen, children]);

  return (
    <div className={`${withBorderBottom ? 'border-b border-gray-600' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-1 text-left text-sm font-semibold uppercase tracking-wide text-white"
      >
        <span>{title}</span>
        <span className="ml-2 text-gray-400">
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </span>
      </button>

      <div
        style={{ maxHeight }}
        className="overflow-hidden transition-max-height duration-300 ease-in-out"
      >
        <div
          ref={contentRef}
          className={`pb-1 pt-0.5 transform transition-all duration-300 ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [openSection, setOpenSection] = useState<SectionId | null>(null);

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <footer className="mt-0 border-t border-gray-700 bg-[#3a4754]">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-2 sm:px-5 md:pt-6 md:pb-3 lg:px-6 text-xs text-gray-300">
        {/* ====== GIAO DIỆN MOBILE (DẠNG ACCORDION) ====== */}
        <div className="md:hidden">
          <MobileAccordionSection
            id="products"
            title="SẢN PHẨM"
            isOpen={openSection === 'products'}
            onToggle={() => toggleSection('products')}
            withBorderBottom={true}
          >
            <ul className="mt-0.5 space-y-0.5">
              <li>
                <Link href="/diy-maker" className={footerLinkClass}>
                  DIY Maker — linh kiện & máy tự động
                </Link>
              </li>
              <li>
                <Link href="/parts" className={footerLinkClass}>
                  Sản phẩm in 3D
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          <MobileAccordionSection
            id="projects"
            title="DỰ ÁN"
            isOpen={openSection === 'projects'}
            onToggle={() => toggleSection('projects')}
            withBorderBottom={true}
          >
            <ul className="mt-0.5 space-y-0.5">
              <li>
                <Link href="/projects" className={footerLinkClass}>
                  Các dự án DIY
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          <MobileAccordionSection
            id="docs"
            title="TÀI LIỆU KỸ THUẬT"
            isOpen={openSection === 'docs'}
            onToggle={() => toggleSection('docs')}
            withBorderBottom={true}
          >
            <ul className="mt-0.5 space-y-0.5">
              <li>
                <Link href="/technical-docs" className={footerLinkClass}>
                  Tổng quan tài liệu
                </Link>
              </li>
              <li>
                <Link
                  href="/technical-docs/file-3d"
                  className={footerLinkClass}
                >
                  File 3D
                </Link>
              </li>
              <li>
                <Link
                  href="/technical-docs/schematics"
                  className={footerLinkClass}
                >
                  Sơ đồ mạch
                </Link>
              </li>
              <li>
                <Link
                  href="/technical-docs/datasheets"
                  className={footerLinkClass}
                >
                  Datasheet & hướng dẫn
                </Link>
              </li>
              <li>
                <Link
                  href="/technical-docs/code-samples"
                  className={footerLinkClass}
                >
                  Code mẫu
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          <MobileAccordionSection
            id="blog"
            title="BLOG"
            isOpen={openSection === 'blog'}
            onToggle={() => toggleSection('blog')}
            withBorderBottom={true}
          >
            <ul className="mt-0.5 space-y-0.5">
              <li>
                <Link href="/blog" className={footerLinkClass}>
                  Blog kỹ thuật
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          <MobileAccordionSection
            id="contact"
            title="LIÊN HỆ"
            isOpen={openSection === 'contact'}
            onToggle={() => toggleSection('contact')}
            withBorderBottom={false}
          >
            <ul className={`mt-0.5 space-y-0.5 ${footerListTextClass}`}>
              <li>Hotline: 0xxx xxx xxx</li>
              <li>Email: contact@aiotautotech.com</li>
              <li>Địa chỉ: (địa chỉ của bạn)</li>
            </ul>
          </MobileAccordionSection>
        </div>

        {/* ====== GIAO DIỆN DESKTOP (DẠNG CỘT) ====== */}
        <div className="hidden md:block">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div>
              <h3 className={`mb-3 ${footerHeadingClass}`}>SẢN PHẨM</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/diy-maker" className={footerLinkClass}>
                    DIY Maker — linh kiện & máy tự động
                  </Link>
                </li>
                <li>
                  <Link href="/parts" className={footerLinkClass}>
                    Sản phẩm in 3D
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`mb-3 ${footerHeadingClass}`}>DỰ ÁN</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/projects" className={footerLinkClass}>
                    Các dự án DIY
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`mb-3 ${footerHeadingClass}`}>
                TÀI LIỆU KỸ THUẬT
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/technical-docs" className={footerLinkClass}>
                    Tổng quan tài liệu
                  </Link>
                </li>
                <li>
                  <Link
                    href="/technical-docs/file-3d"
                    className={footerLinkClass}
                  >
                    File 3D
                  </Link>
                </li>
                <li>
                  <Link
                    href="/technical-docs/schematics"
                    className={footerLinkClass}
                  >
                    Sơ đồ mạch
                  </Link>
                </li>
                <li>
                  <Link
                    href="/technical-docs/datasheets"
                    className={footerLinkClass}
                  >
                    Datasheet & hướng dẫn
                  </Link>
                </li>
                <li>
                  <Link
                    href="/technical-docs/code-samples"
                    className={footerLinkClass}
                  >
                    Code mẫu
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`mb-3 ${footerHeadingClass}`}>BLOG</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className={footerLinkClass}>
                    Blog kỹ thuật
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`mb-3 ${footerHeadingClass}`}>LIÊN HỆ</h3>
              <ul className={`space-y-2 ${footerListTextClass}`}>
                <li>Hotline: 0xxx xxx xxx</li>
                <li>Email: contact@aiotautotech.com</li>
                <li>Địa chỉ: (địa chỉ của bạn)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PHẦN GIỚI THIỆU THƯƠNG HIỆU & BẢN QUYỀN */}
        <div className="mt-5 border-t border-gray-700 pt-4">
          <div className="mb-3 flex items-center justify-center space-x-2 md:justify-start">
            <Image
              src="/aiotautotech-icon.png"
              alt={`${brandName} Logo`}
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-sm font-semibold text-white">
              {brandName}
            </span>
          </div>
          <div className="text-center md:text-left">
            <p className="mb-3 leading-relaxed text-gray-400">
              Chuyên cung cấp linh kiện IoT, bộ điều khiển chuyển động và giải
              pháp tự động hóa giá rẻ cho DIY, xưởng sản xuất nhỏ và nông nghiệp
              công nghệ.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:justify-start">
              <a href="#" className="underline-offset-2 hover:underline">
                Facebook
              </a>
              <span className="hidden md:inline">•</span>
              <a href="#" className="underline-offset-2 hover:underline">
                YouTube
              </a>
              <span className="hidden md:inline">•</span>
              <a href="#" className="underline-offset-2 hover:underline">
                TikTok
              </a>
              <span className="hidden md:inline">•</span>
              <a href="#" className="underline-offset-2 hover:underline">
                Zalo
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-gray-700 pt-3 text-center text-[11px] text-gray-500">
          <p className="text-center">
            © 2025 {brandName} — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
