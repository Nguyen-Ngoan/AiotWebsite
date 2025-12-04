// src/components/home/TechDocsSection.tsx

import Link from 'next/link';
import {
  ChevronRightIcon,
  CubeIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CpuChipIcon,
} from '@heroicons/react/24/solid';
import { ReactNode } from 'react';

interface TechDocItem {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
}

const TECH_DOC_ITEMS: TechDocItem[] = [
  {
    icon: <CubeIcon className="h-5 w-5" />,
    title: 'File 3D – STEP & STL',
    description: 'Mô hình 3D cho trục tuyến tính, khung máy, case ESP32…',
    href: '/technical-docs/file-3d',
  },
  {
    icon: <CpuChipIcon className="h-5 w-5" />,
    title: 'Sơ đồ mạch – ESP32/STM32',
    description: 'Schematic rõ ràng, sẵn file để tự in mạch hoặc đặt PCB.',
    href: '/technical-docs/schematics',
  },
  {
    icon: <CodeBracketIcon className="h-5 w-5" />,
    title: 'Code mẫu – DIY & Automation',
    description: 'Ví dụ ESP32/STM32 cho IoT, stepper, CNC mini, bộ tưới cây.',
    href: '/technical-docs/code-samples',
  },
  {
    icon: <DocumentTextIcon className="h-5 w-5" />,
    title: 'Datasheet, Hướng dẫn lắp ráp',
    description: 'Các bước lắp ráp, đấu dây, test hệ thống cho người mới.',
    href: '/technical-docs/datasheets',
  },
];

export default function TechDocsSection() {
  return (
    <section
      id="tech-docs"
      className="w-full border-b border-gray-200 bg-apple-gray-light dark:border-gray-800 dark:bg-black"
    >
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 lg:px-6">
        {/* Heading + mô tả */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            Tech Docs
          </p>
          <h2 className="mb-3 text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            TÀI LIỆU KỸ THUẬT
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
            Sơ đồ mạch, code mẫu, file 3D (STEP/STL), hướng dẫn lắp đặt
          </p>
        </div>

        {/* Grid 4 ô kiểu Apple Support */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_DOC_ITEMS.map((item) => (
            <Link href={item.href} key={item.title}>
              <article className="relative flex h-full flex-col rounded-2xl bg-white px-5 pt-5 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-transform duration-150 hover:-translate-y-1 dark:bg-[#111111] dark:shadow-[0_12px_36px_rgba(0,0,0,0.7)]">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
                <div className="pointer-events-none absolute bottom-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
                  <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
