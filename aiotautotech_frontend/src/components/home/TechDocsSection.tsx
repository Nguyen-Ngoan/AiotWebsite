// src/components/home/TechDocsSection.tsx

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

const TECH_DOC_ITEMS = [
  {
    icon: "🧩",
    title: "File 3D – STEP & STL",
    description: "Mô hình 3D cho trục tuyến tính, khung máy, case ESP32…",
  },
  {
    icon: "📐",
    title: "Sơ đồ mạch – ESP32/STM32",
    description: "Schematic rõ ràng, sẵn file để tự in mạch hoặc đặt PCB.",
  },
  {
    icon: "🔧",
    title: "Code mẫu – DIY & Automation",
    description: "Ví dụ ESP32/STM32 cho IoT, stepper, CNC mini, bộ tưới cây.",
  },
  {
    icon: "📘",
    title: "Hướng dẫn lắp đặt – Bộ tưới & CNC mini",
    description: "Các bước lắp ráp, đấu dây, test hệ thống cho người mới.",
  },
];

export default function TechDocsSection() {
  return (
    <section id="tech-docs" className="w-full border-b border-gray-200 bg-apple-gray-light dark:border-gray-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        {/* Heading + mô tả */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Tech Docs</p>
          <h2 className="mb-3 text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl">Tài liệu &amp; Hướng dẫn kỹ thuật</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
            Sơ đồ mạch, code mẫu, file 3D (STEP/STL), hướng dẫn lắp đặt.
            <br />
            Miễn phí cho cộng đồng.
          </p>
        </div>

        {/* Grid 4 ô kiểu Apple Support */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_DOC_ITEMS.map((item) => (
            <article key={item.title} className="flex flex-col rounded-2xl bg-white px-4 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-transform duration-150 hover:-translate-y-1 dark:bg-[#111111] dark:shadow-[0_12px_36px_rgba(0,0,0,0.7)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-lg dark:bg-blue-500/20">
                  <span aria-hidden="true">{item.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{item.description}</p>
            </article>
          ))}
        </div>

        {/* CTA kiểu “Shop iPhone >”, màu giống link Apple */}
        <div className="mt-8 text-center">
          <Link href="/docs" className="inline-flex items-center text-md font-semibold text-[#0066CC] hover:underline dark:text-[#2997FF]">
            <span>Xem tất cả tài liệu</span>
            <ChevronRightIcon className="ml-1 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
