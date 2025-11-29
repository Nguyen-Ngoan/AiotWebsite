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
    <details
      className="group rounded-xl border border-gray-800 bg-[#050608]"
      open
    >
      <summary className="list-none cursor-pointer p-4 sm:p-6">
        <h2 className="inline text-sm font-semibold text-gray-100">
          Mô tả chi tiết
        </h2>
        <span className="ml-2 text-xs font-normal text-gray-500">
          (click để thu gọn / mở rộng)
        </span>
      </summary>
      <div className="border-t border-gray-800 p-4 sm:p-6 prose prose-invert max-w-none text-[16px] sm:text-[17px] leading-relaxed text-gray-100 not-italic [&_p]:not-italic [&_li]:not-italic [&_p]:my-4 [&_p:first-of-type]:mt-0 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-blue-400 [&_a]:underline-offset-2 [&_a]:hover:text-blue-300 [&_a]:hover:underline [&_strong]:font-semibold [&_em]:italic [&_figure]:my-8 [&_figure]:mx-auto [&_figure]:max-w-full [&_figure_img]:rounded-xl [&_figure_img]:shadow-lg [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-md [&_figcaption]:mt-3 [&_figcaption]:text-[11px] [&_figcaption]:leading-snug [&_figcaption]:text-gray-400 [&_blockquote]:my-6 [&_blockquote]:border-l [&_blockquote]:border-gray-700 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-200 [&_blockquote_p]:my-0 [&_hr]:my-10 [&_hr]:border-gray-800 [&_p.aiot-cite]:mt-1 sm:[&_p.aiot-cite]:text-[13px] [&_p.aiot-cite]:text-xs [&_p.aiot-cite]:text-gray-400 [&_p.aiot-cite]:not-italic [&_table]:w-full [&_table]:border-collapse [&_table]:text-[14px] [&_table]:my-6 [&_th]:border [&_th]:border-gray-700 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-[#111827] [&_th]:font-semibold [&_td]:border [&_td]:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_tr:nth-child(even)]:bg-[#020617] [&_tr:nth-child(odd)]:bg-black [&_thead]:bg-[#111827] [&_table]:block [&_table]:overflow-x-auto [&_table]:whitespace-nowrap">
        <KaTeXContent html={descriptionHtml} />
      </div>
    </details>
  );
}
