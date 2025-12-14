// src/components/Footer.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect, Fragment } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const brandName = 'AIOT AutoTech'; // Đổi tên thương hiệu tại đây

type SectionId = 'products' | 'docs' | 'blog' | 'contact';

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
        className="flex w-full items-center justify-between py-1.5 text-left text-sm font-semibold text-white"
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
          className={`pb-1.5 pt-1 transform transition-all duration-300 ${
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
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-8 md:pt-10 md:pb-12 lg:px-6 text-xs text-gray-300">
        {/* ====== GIAO DIỆN MOBILE (DẠNG ACCORDION) ====== */}
        <div className="md:hidden">
          {/* Cột 1: Sản phẩm */}
          <MobileAccordionSection
            id="products"
            title="Sản phẩm"
            isOpen={openSection === 'products'}
            onToggle={() => toggleSection('products')}
            withBorderBottom={true}
          >
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="#" className="hover:underline">
                  Linh kiện DIY & Maker
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Máy tự động hóa cho xưởng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Thiết bị IoT nông nghiệp
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          {/* Cột 3: Tài liệu & Hướng dẫn */}
          <MobileAccordionSection
            id="docs"
            title="Tài liệu & Hướng dẫn"
            isOpen={openSection === 'docs'}
            onToggle={() => toggleSection('docs')}
            withBorderBottom={true}
          >
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="/docs/3d-files" className="hover:underline">
                  File 3D
                </Link>
              </li>
              <li>
                <Link href="/docs/schematics" className="hover:underline">
                  Sơ đồ mạch
                </Link>
              </li>
              <li>
                <Link href="/docs/guides" className="hover:underline">
                  Hướng dẫn kỹ thuật
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          {/* Cột 4: Blog */}
          <MobileAccordionSection
            id="blog"
            title="Blog"
            isOpen={openSection === 'blog'}
            onToggle={() => toggleSection('blog')}
            withBorderBottom={true}
          >
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="#" className="hover:underline">
                  Bài viết mới
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Kiến thức DIY & Maker
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Case Study Tự động hóa
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          {/* Cột 5: Thông tin liên hệ */}
          <MobileAccordionSection
            id="contact"
            title="Thông tin liên hệ"
            isOpen={openSection === 'contact'}
            onToggle={() => toggleSection('contact')}
            withBorderBottom={false} // <-- bỏ đường phân cách dưới
          >
            <ul className="mt-1 space-y-1">
              <li>Hotline: 0xxx xxx xxx</li>
              <li>Email: contact@aiotautotech.com</li>
              <li>Địa chỉ: (địa chỉ của bạn)</li>
            </ul>
          </MobileAccordionSection>
        </div>

        {/* ====== GIAO DIỆN DESKTOP (DẠNG CỘT) ====== */}
        <div className="hidden md:block">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Cột 1: Sản phẩm */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">
                Sản phẩm
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:underline">
                    Linh kiện DIY & Maker
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Máy tự động hóa cho xưởng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Thiết bị IoT nông nghiệp
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 3: Tài liệu & Hướng dẫn */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">
                Tài liệu & Hướng dẫn
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs/3d-files" className="hover:underline">
                    File 3D
                  </Link>
                </li>
                <li>
                  <Link href="/docs/schematics" className="hover:underline">
                    Sơ đồ mạch
                  </Link>
                </li>
                <li>
                  <Link href="/docs/guides" className="hover:underline">
                    Hướng dẫn kỹ thuật
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 4: Blog */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Blog</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:underline">
                    Bài viết mới
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Kiến thức DIY & Maker
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Case Study Tự động hóa
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 5: Thông tin liên hệ */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">
                Thông tin liên hệ
              </h3>
              <ul className="space-y-2">
                <li>Hotline: 0xxx xxx xxx</li>
                <li>Email: contact@aiotautotech.com</li>
                <li>Địa chỉ: (địa chỉ của bạn)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PHẦN GIỚI THIỆU THƯƠNG HIỆU & BẢN QUYỀN */}
        <div className="mt-6 border-t border-gray-700 pt-5">
          <div className="mb-4 flex items-center justify-center space-x-2 md:justify-start">
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

        <div className="mt-6 border-t border-gray-700 pt-4 text-center text-[11px] text-gray-500">
          <p className="text-center">
            © 2025 {brandName} — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
