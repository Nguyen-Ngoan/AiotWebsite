// src/app/diy-maker/[idSlug]/components/ProductDescription.tsx

interface ProductDescriptionProps {
  descriptionHtml?: string;
}

export function ProductDescription({ descriptionHtml }: ProductDescriptionProps) {
  return (
    <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4" open>
      <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">
        Mô tả chi tiết
        <span className="ml-2 text-xs font-normal text-gray-500">(click để thu gọn / mở rộng)</span>
      </summary>
      <div className="mt-3 border-t border-gray-800 pt-3 text-sm leading-relaxed text-gray-200">{descriptionHtml ? <div className="prose prose-invert max-w-none prose-headings:text-gray-100 prose-p:text-gray-200 prose-strong:text-gray-100 prose-a:text-blue-400" dangerouslySetInnerHTML={{ __html: descriptionHtml }} /> : <p className="text-sm text-gray-400">Chưa có mô tả HTML cho sản phẩm này.</p>}</div>
    </details>
  );
}
