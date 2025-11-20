// src/components/home/DiyMakerSection.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { CpuChipIcon, WrenchScrewdriverIcon, CubeTransparentIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";

export default function DiyMakerSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Cuộn sang card kế trước / kế tiếp, rồi canh nó vào giữa
  const scrollToNext = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLDivElement>("[data-card]"));
    if (!cards.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    // Tìm card hiện tại gần giữa nhất
    let closestIndex = 0;
    let closestDist = Infinity;

    cards.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - containerCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = idx;
      }
    });

    let targetIndex = closestIndex;
    if (direction === "left") {
      targetIndex = Math.max(0, closestIndex - 1);
    } else {
      targetIndex = Math.min(cards.length - 1, closestIndex + 1);
    }

    const target = cards[targetIndex];
    const targetRect = target.getBoundingClientRect();
    const targetCenter = targetRect.left + targetRect.width / 2;
    const delta = targetCenter - containerCenter;

    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section id="diy-maker" className="w-full border-b border-gray-800 bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 md:flex-row md:items-center md:py-20 lg:px-6">
        {/* LEFT: TEXT */}
        <div className="flex-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">DIY &amp; Maker</p>

          <h2 className="mb-3 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Dành cho Maker &amp; người yêu công nghệ.</h2>

          <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
            Linh kiện IoT, board ESP32/STM32, trục tuyến tính in 3D, CNC mini.
            <br />
            Miễn phí tài liệu. Dễ học. Dễ làm.
          </p>

          <Link href="/diy-maker" className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300">
            Xem sản phẩm DIY
            <span className="ml-1 text-base">→</span>
          </Link>
        </div>

        {/* RIGHT: CARDS – horizontal scroll + snap + arrow buttons (góc dưới phải) */}
        <div className="relative flex-1 pb-10">
          {/* Dải card trượt ngang */}
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-3 md:pb-4 snap-x snap-mandatory hide-scrollbar">
            <DiyCard label="Board ESP32 / STM32" icon={<CpuChipIcon className="h-5 w-5" />} title="Bắt đầu lập trình IoT dễ dàng." description="WiFi/BLE, nhiều ví dụ mẫu, tài liệu tiếng Việt. Phù hợp cho cả người mới và maker nâng cao." imageSrc="/images/diy-esp32-board.jpg" imageAlt="Board ESP32 trên nền trắng" />

            <DiyCard label="Trục tuyến tính 3D-print" icon={<CubeTransparentIcon className="h-5 w-5" />} title="Xây CNC mini & robot nhỏ." description="Module trục tuyến tính in 3D, dùng cho CNC mini, plotter, robot gắp đồ chơi." imageSrc="/images/diy-linear-axis.jpg" imageAlt="Trục tuyến tính 3D-print trên nền trắng" />

            <DiyCard label="Bộ kit DIY hoàn chỉnh" icon={<WrenchScrewdriverIcon className="h-5 w-5" />} title="Từ ý tưởng tới sản phẩm nhanh hơn." description="Combo nguồn, driver, motor, cảm biến, kèm sơ đồ & code. Cắm là chạy." imageSrc="/images/diy-kit.jpg" imageAlt="Bộ kit DIY linh kiện IoT" />
          </div>

          {/* Nút trái/phải luôn hiển thị, đặt cạnh nhau góc dưới phải */}
          <div className="pointer-events-none absolute bottom-0 right-0 flex gap-2">
            <button type="button" onClick={() => scrollToNext("left")} className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1d] text-gray-200 hover:bg-[#2a2a30]" aria-label="Cuộn sang trái">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scrollToNext("right")} className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1d] text-gray-200 hover:bg-[#2a2a30]" aria-label="Cuộn sang phải">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

type DiyCardProps = {
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

function DiyCard({ label, icon, title, description, imageSrc, imageAlt }: DiyCardProps) {
  return (
    <div data-card className="relative flex min-w-[260px] max-w-[280px] flex-col rounded-[28px] bg-[#111111] shadow-[0_16px_40px_rgba(0,0,0,0.6)] snap-center md:min-w-[280px]">
      {/* Phần trên: text trên nền tối */}
      <div className="px-5 pt-5 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-gray-300">{label}</p>
          <span className="text-gray-400">{icon}</span>
        </div>

        <h3 className="mb-2 text-[17px] font-semibold leading-snug text-white">{title}</h3>
        <p className="text-[11px] leading-relaxed text-gray-300">{description}</p>
      </div>

      {/* Phần dưới: ảnh cover toàn bộ nửa dưới card */}
      <div className="relative mt-auto overflow-hidden rounded-b-[28px] bg-white">
        <div className="relative h-40 w-full">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        </div>

        {/* Nút tròn + trong vùng ảnh, góc dưới phải */}
        <button type="button" className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black" aria-label="Xem chi tiết">
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
