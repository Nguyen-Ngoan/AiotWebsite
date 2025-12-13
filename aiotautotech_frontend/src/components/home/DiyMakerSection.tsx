// src/components/home/DiyMakerSection.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CpuChipIcon,
  WrenchScrewdriverIcon,
  CubeTransparentIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useRef, type ReactNode } from 'react';

export default function DiyMakerSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Cuộn sang card kế trước / kế tiếp, rồi canh nó vào giữa
  const scrollToNext = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLDivElement>('[data-diy-card]')
    );
    if (!cards.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    // Tìm card gần trung tâm
    let closestIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(center - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    const targetIndex =
      direction === 'left'
        ? Math.max(0, closestIndex - 1)
        : Math.min(cards.length - 1, closestIndex + 1);

    const target = cards[targetIndex];
    const targetRect = target.getBoundingClientRect();
    const targetCenter = targetRect.left + targetRect.width / 2;
    const delta = targetCenter - containerCenter;

    container.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section
      id="diy-maker"
      className="w-full border-b border-gray-800 bg-black text-white"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 md:flex-row md:items-center md:py-20 lg:px-6">
        {/* LEFT: TEXT */}
        <div className="flex-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            DIY PRODUCT
          </p>

          <h2 className="mb-3 text-3xl font-semibold leading-tight md:text-4xl">
            SẢN PHẨM
          </h2>

          <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
            Linh kiện IoT, board ESP32/STM32, trục tuyến tính in 3D, CNC mini.
            Miễn phí tài liệu. Dễ học. Dễ làm.
          </p>

          {/* Hàng nút: xem sản phẩm + thêm sản phẩm */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/diy-maker"
              className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Xem sản phẩm
              <span className="ml-1 text-base">→</span>
            </Link>
          </div>
        </div>

        {/* RIGHT: CARDS – horizontal scroll + arrow buttons */}
        <div className="relative flex-1 pb-10">
          {/* Dải card trượt ngang */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 md:pb-4 snap-x snap-mandatory hide-scrollbar"
          >
            <DiyCard
              label="Board ESP32 / STM32"
              icon={<CpuChipIcon className="h-5 w-5" />}
              description="Các board phát triển cho dự án IoT, robot nhỏ, hệ thống điều khiển bước."
              bullets={[
                'ESP32 DevKit, ESP32-S3, STM32 Bluepill',
                'Tài liệu ví dụ, code mẫu',
              ]}
              imageSrc="/images/diy-esp32-board.jpg"
              imageAlt="Board ESP32 trên nền trắng"
            />

            <DiyCard
              label="Trục tuyến tính 3D-print"
              icon={<CubeTransparentIcon className="h-5 w-5" />}
              description="Module trục X/Y in 3D cho máy tự động hoá nhỏ & hệ thống tưới cây."
              bullets={['NEMA17 + GT2', 'Tuỳ chỉnh hành trình theo nhu cầu']}
              imageSrc="/images/diy-linear-axis.jpg"
              imageAlt="Trục tuyến tính 3D-print trên nền trắng"
            />

            <DiyCard
              label="Bộ kit DIY hoàn chỉnh"
              icon={<WrenchScrewdriverIcon className="h-5 w-5" />}
              description="Combo linh kiện + tài liệu để tự ráp bộ điều khiển step motor, tưới cây tự động."
              bullets={['Có sơ đồ đấu dây', 'Hướng dẫn từng bước chi tiết']}
              imageSrc="/images/diy-kit.jpg"
              imageAlt="Bộ kit DIY linh kiện IoT"
            />
          </div>

          {/* Nút trái/phải – góc dưới phải */}
          <div className="pointer-events-none absolute bottom-0 right-0 flex gap-2">
            <button
              type="button"
              onClick={() => scrollToNext('left')}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 bg-black/70 text-gray-200 hover:bg-[#2a2a30]"
              aria-label="Cuộn sang trái"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToNext('right')}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 bg-black/70 text-gray-200 hover:bg-[#2a2a30]"
              aria-label="Cuộn sang phải"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface DiyCardProps {
  label: string;
  icon: ReactNode;
  description: string;
  bullets: string[];
  imageSrc: string;
  imageAlt: string;
}

function DiyCard({
  label,
  icon,
  description,
  bullets,
  imageSrc,
  imageAlt,
}: DiyCardProps) {
  return (
    <div
      data-diy-card
      className="flex w-72 flex-shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-gray-800 bg-[#050509] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
    >
      {/* Phần trên: text */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-700 px-2.5 py-1">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/70">
            {icon}
          </span>
          <span className="text-xs font-semibold text-gray-100">{label}</span>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-gray-300">
          {description}
        </p>

        <ul className="mb-3 space-y-1 text-xs text-gray-400">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-1.5">
              <Squares2X2Icon className="mt-[2px] h-3.5 w-3.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-auto text-[11px] text-gray-500">
          Tài liệu kèm theo file 3D / code mẫu.
        </p>
      </div>

      {/* Phần dưới: ảnh cover toàn bộ nửa dưới card */}
      <div className="relative mt-auto overflow-hidden rounded-b-[28px] bg-white">
        <div className="relative h-40 w-full">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        </div>

        {/* Nút tròn + trong vùng ảnh, góc dưới phải */}
        <button
          type="button"
          className="absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black"
          aria-label="Xem chi tiết"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
