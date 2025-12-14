'use client';

import { useState } from 'react';

interface DetailedAnalysisPanelProps {
  htmlContent: string;
}

export function DetailedAnalysisPanel({
  htmlContent,
}: DetailedAnalysisPanelProps) {
  const [isOpen, setIsOpen] = useState(true); // Mặc định mở

  return (
    <div className="group mt-6 rounded-lg border border-gray-200 bg-white">
      <div
        className="flex cursor-pointer list-none items-center justify-between px-4 py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-base font-semibold text-gray-800">
          Phân tích chi tiết dự án
        </h3>
        <div className="relative ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 ${isOpen ? 'block' : 'hidden'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 ${isOpen ? 'hidden' : 'block'}`}
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
      </div>
      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
          isOpen ? 'max-h-[5000px]' : 'max-h-0'
        }`}
      >
        <div
          className="border-t border-gray-200 p-4 prose prose-slate max-w-none text-gray-700 text-base leading-relaxed [&_p]:my-2.5 [&_p:first-of-type]:mt-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-bold [&_h4]:mt-5 [&_h4]:mb-2 [&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_a]:text-blue-600 [&_a]:underline-offset-2 [&_a]:hover:text-blue-500 [&_a]:hover:underline [&_strong]:font-semibold [&_em]:italic [&_figure]:my-8 [&_figure]:mx-auto [&_figure]:max-w-full [&_figure_img]:rounded-lg [&_figure_img]:shadow-lg [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:rounded-lg [&_img]:shadow-md [&_figcaption]:mt-3 [&_figcaption]:text-xs [&_figcaption]:leading-snug [&_figcaption]:text-gray-500 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote_p]:my-0 [&_hr]:my-10 [&_hr]:border-gray-200 [&_p.aiot-cite]:mt-1 sm:[&_p.aiot-cite]:text-sm [&_p.aiot-cite]:text-xs [&_p.aiot-cite]:text-gray-500 [&_p.aiot-cite]:not-italic [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:my-6 [&_th]:border [&_th]:border-gray-200 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:bg-gray-100 [&_th]:font-semibold [&_td]:border [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-2.5 [&_tr:nth-child(even)]:bg-gray-50 [&_tr:nth-child(odd)]:bg-white [&_thead]:bg-gray-100 [&_table]:block [&_table]:overflow-x-auto [&_table]:whitespace-nowrap"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
