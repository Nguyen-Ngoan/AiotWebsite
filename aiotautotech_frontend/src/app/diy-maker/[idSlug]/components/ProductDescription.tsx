// src/app/diy-maker/[idSlug]/components/ProductDescription.tsx

import { KaTeXContent } from './KaTeXContent';

interface ProductDescriptionProps {
  descriptionHtml?: string;
}

export function ProductDescription({
  descriptionHtml,
}: ProductDescriptionProps) {
  if (!descriptionHtml) {
    return null; // Không hiển thị gì nếu không có mô tả
  }

  return (
    <details className="group rounded-md border border-gray-800 bg-[#050608]">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 pl-3 pr-3 sm:pl-4 sm:pr-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-[#8883c8]">
            Mô tả chi tiết
          </h2>
        </div>
        <div className="relative ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-200">
          {/* Icon '-' (dấu trừ) hiển thị khi mở */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="hidden h-3.5 w-3.5 group-open:block"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {/* Icon '+' (dấu cộng) hiển thị khi đóng */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 group-open:hidden"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </summary>
      <div className="min-w-0 overflow-x-hidden border-t border-gray-800 px-4 pb-2 pt-2 sm:px-6 sm:pb-3 sm:pt-3 prose prose-invert max-w-none text-[15px] leading-relaxed text-gray-100 not-italic [&_p]:not-italic [&_li]:not-italic [&_p]:my-2.5 [&_p:first-of-type]:mt-0 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2 [&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_a]:text-blue-400 [&_a]:underline-offset-2 [&_a]:hover:text-blue-300 [&_a]:hover:underline [&_strong]:font-semibold [&_em]:italic [&_figure]:my-8 [&_figure]:mx-auto [&_figure]:max-w-full [&_figure_img]:rounded-md [&_figure_img]:shadow-lg [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:rounded-md [&_img]:shadow-md [&_figcaption]:mt-3 [&_figcaption]:text-[11px] [&_figcaption]:leading-snug [&_figcaption]:text-gray-400 [&_blockquote]:my-6 [&_blockquote]:border-l [&_blockquote]:border-gray-700 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-200 [&_blockquote_p]:my-0 [&_hr]:my-10 [&_hr]:border-gray-800 [&_p.aiot-cite]:mt-1 sm:[&_p.aiot-cite]:text-[13px] [&_p.aiot-cite]:text-xs [&_p.aiot-cite]:text-gray-400 [&_p.aiot-cite]:not-italic [&_table]:my-6 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-[14px] [&_table]:[-webkit-overflow-scrolling:touch] [&_table]:whitespace-nowrap [&_th]:border [&_th]:border-gray-700 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-[#111827] [&_th]:font-semibold [&_td]:border [&_td]:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_tr:nth-child(even)]:bg-[#020617] [&_tr:nth-child(odd)]:bg-black [&_thead]:bg-[#111827]">
        <KaTeXContent html={descriptionHtml} />
      </div>
    </details>
  );
}
