'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import {
  CubeIcon,
  CpuChipIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const SECTIONS = [
  {
    href: '/technical-docs/file-3d',
    title: 'File 3D',
    description: 'STEP, STL — mô hình in 3D và lắp ráp.',
    icon: CubeIcon,
    accent: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
  {
    href: '/technical-docs/schematics',
    title: 'Sơ đồ mạch',
    description: 'Sơ đồ ESP32, STM32 và mạch điều khiển.',
    icon: CpuChipIcon,
    accent: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  {
    href: '/technical-docs/datasheets',
    title: 'Datasheet & hướng dẫn',
    description: 'Thông số, hướng dẫn lắp đặt và tài liệu PDF.',
    icon: DocumentTextIcon,
    accent: 'bg-amber-50 text-amber-800 ring-amber-100',
  },
  {
    href: '/technical-docs/code-samples',
    title: 'Code mẫu',
    description: 'Đoạn mã, firmware và ví dụ tích hợp.',
    icon: CodeBracketIcon,
    accent: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
] as const;

export default function TechnicalDocsHubPage() {
  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  useEffect(() => {
    const updatePadding = () => {
      if (headerRef.current) {
        setMainPaddingTop(headerRef.current.offsetHeight);
      }
    };
    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header ref={headerRef} navItems={navItems} />
      <main
        className="flex-1"
        style={{
          paddingTop: mainPaddingTop > 0 ? `${mainPaddingTop}px` : '7rem',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <li className="flex">
                <Link href="/" className="text-gray-400 hover:text-gray-500">
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
              </li>
              <li className="text-gray-300">&gt;</li>
              <li className="font-medium text-gray-800">
                Tài liệu kỹ thuật
              </li>
            </ol>
          </nav>

          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Tài liệu kỹ thuật
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Chọn loại tài liệu: mô hình 3D, sơ đồ mạch, datasheet hoặc code
              mẫu.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 lg:gap-6">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`inline-flex rounded-lg p-3 ring-1 ${section.accent}`}
                      >
                        <Icon className="h-7 w-7" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                          {section.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                          {section.description}
                        </p>
                        <span className="mt-3 inline-flex items-center text-sm font-medium text-blue-600">
                          Xem thư viện
                          <ChevronRightIcon className="ml-0.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
