// src/components/home/BlogSection.tsx

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

type BlogItem = {
  title: string;
  description: string;
  href: string;
  tag: string;
};

const BLOG_ITEMS: BlogItem[] = [
  {
    title: "Làm trục tuyến tính giá rẻ bằng in 3D",
    description: "Hướng dẫn thiết kế, in và lắp ráp trục tuyến tính dùng cho CNC mini, robot nhỏ và dự án DIY.",
    href: "/blog/truc-tuyen-tinh-3d-gia-re",
    tag: "Cơ khí & 3D print",
  },
  {
    title: "Điều khiển Stepper bằng ESP32 – hướng dẫn chi tiết",
    description: "Từ kết nối driver, cấu hình microstep, đến dựng profile tăng giảm tốc cho động cơ bước.",
    href: "/blog/dieu-khien-stepper-esp32",
    tag: "ESP32 & Stepper",
  },
  {
    title: "Cách làm hệ thống tưới cây tự động tại nhà",
    description: "Thiết kế bộ tưới cây dùng ESP32, cảm biến độ ẩm đất, hẹn giờ và giám sát từ điện thoại.",
    href: "/blog/tuoi-cay-tu-dong-tai-nha",
    tag: "IoT nông nghiệp",
  },
];

export default function BlogSection() {
  return (
    <section id="blog" className="w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        {/* Heading */}
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Blog</p>
          <h2 className="mb-3 text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl">Kiến thức IoT – DIY – Tự động hoá.</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">Chia sẻ kinh nghiệm thực tế về ESP32, động cơ bước, trục tuyến tính, hệ thống tưới cây và các dự án DIY ứng dụng trong xưởng nhỏ.</p>
        </div>

        {/* Grid bài viết kiểu Apple Newsroom */}
        <div className="grid gap-6 md:grid-cols-3">
          {BLOG_ITEMS.map((post) => (
            <article key={post.href} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)] dark:border-gray-800 dark:bg-[#111111]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{post.tag}</p>
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">{post.title}</h3>
              <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300 sm:text-[13px]">{post.description}</p>

              <div className="mt-auto">
                <Link href={post.href} className="inline-flex items-center text-xs font-semibold text-[#0066CC] hover:underline dark:text-[#2997FF]">
                  <span>Đọc bài viết</span>
                  <ChevronRightIcon className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* CTA tổng blog */}
        <div className="mt-10 text-center">
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-[#0066CC] hover:underline dark:text-[#2997FF]">
            <span>Xem blog</span>
            <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
